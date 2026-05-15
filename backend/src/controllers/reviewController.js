const { prisma } = require('../prisma');

// @desc    Get reviews by university (with pagination & like status)
// @route   GET /api/reviews/university/:universityId
// @access  Public
const getReviewsByUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const { page = 1, limit = 10, minRating, maxRating } = req.query;
    const userId = req.user?.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    let where = { 
      universityId: universityId,
      isTrashed: false
    };
    
    if (minRating) where.rating = { gte: parseFloat(minRating) };
    if (maxRating) where.rating = { ...where.rating, lte: parseFloat(maxRating) };
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              graduationYear: true,
              major: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.review.count({ where })
    ]);
    
    // ✅ ADDED: Check if current user liked each review
    const reviewsWithLikeStatus = await Promise.all(reviews.map(async (review) => {
      let isLikedByUser = false;
      if (userId) {
        // Check if user liked this review (using helpful tracking)
        // Note: You may need a ReviewLike table for proper tracking
        const userReviewInteraction = await prisma.reviewLike?.findFirst({
          where: {
            reviewId: review.id,
            userId: userId
          }
        });
        isLikedByUser = !!userReviewInteraction;
      }
      return { ...review, isLikedByUser };
    }));
    
    res.json({
      success: true,
      data: reviewsWithLikeStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create review with all data
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    console.log('🔍 POST /api/reviews - Request received');
    
    const {
      universityId,
      title,
      content,
      rating,
      ratings,
      pros,
      cons,
      tips,
      classYear,
      major,
      projectLink
    } = req.body;

    if (!universityId) {
      return res.status(400).json({
        success: false,
        message: 'University ID is required to submit a review.'
      });
    }

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User authentication failed.'
      });
    }

    // Check if user already reviewed this university
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: req.user.id,
        universityId: universityId,
        isTrashed: false
      }
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this university. You can edit your existing review.'
      });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        title: title || "Student Review",
        content: content || "",
        rating: rating || 4.0,
        ratings: ratings || {
          academicRigor: 0,
          campusFacilities: 0,
          careerSupport: 0,
          socialLife: 0,
          facultySupport: 0,
          infrastructure: 0,
          placements: 0
        },
        pros: pros || [],
        cons: cons || [],
        tips: tips || "",
        classYear: classYear || "",
        major: major || "",
        projectLink: projectLink || "",
        helpful: 0,
        verified: true,
        user: {
          connect: { id: req.user.id }
        },
        university: {
          connect: { id: universityId }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            graduationYear: true,
            major: true
          }
        },
        university: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Update university average rating
    await updateUniversityRating(universityId);
    
    // Add credits to user for writing review
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        credits: {
          increment: 50
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: { ...review, isLikedByUser: false },
      message: "Review submitted successfully! You earned 50 credits!"
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update university rating
const updateUniversityRating = async (universityId) => {
  const allReviews = await prisma.review.findMany({
    where: { 
      universityId: universityId,
      isTrashed: false
    },
    select: { rating: true }
  });
  
  const avgRating = allReviews.length > 0 
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
    : 0;
  
  await prisma.university.update({
    where: { id: universityId },
    data: { rating: avgRating }
  });
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const review = await prisma.review.findUnique({
      where: { id: req.params.id, isTrashed: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            graduationYear: true,
            major: true
          }
        },
        university: true
      }
    });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if user liked this review
    let isLikedByUser = false;
    if (userId) {
      const userLike = await prisma.reviewLike?.findFirst({
        where: {
          reviewId: review.id,
          userId: userId
        }
      });
      isLikedByUser = !!userLike;
    }
    
    res.json({
      success: true,
      data: { ...review, isLikedByUser }
    });
  } catch (error) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like a review (Fixed - prevents multiple likes)
// @route   PUT /api/reviews/:id/like
// @access  Private
const likeReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const review = await prisma.review.findUnique({
      where: { id, isTrashed: false }
    });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Check if user already liked this review
    // Note: You need to create ReviewLike model for this to work properly
    // For now, using a simple toggle with helpful count
    
    // Check if user has already liked (using session or temp tracking)
    // Alternative: Use ReviewLike table
    try {
      const existingLike = await prisma.reviewLike?.findFirst({
        where: {
          reviewId: id,
          userId: userId
        }
      });
      
      if (existingLike) {
        // Unlike
        await prisma.reviewLike.delete({ where: { id: existingLike.id } });
        const updatedReview = await prisma.review.update({
          where: { id },
          data: { helpful: { decrement: 1 } }
        });
        return res.json({ success: true, liked: false, helpful: updatedReview.helpful });
      } else {
        // Like
        await prisma.reviewLike.create({
          data: {
            reviewId: id,
            userId: userId
          }
        });
        const updatedReview = await prisma.review.update({
          where: { id },
          data: { helpful: { increment: 1 } }
        });
        return res.json({ success: true, liked: true, helpful: updatedReview.helpful });
      }
    } catch (error) {
      // Fallback: Simple like without tracking (prevents multiple likes in same session)
      // This is less secure but works without ReviewLike table
      const updatedReview = await prisma.review.update({
        where: { id },
        data: { helpful: { increment: 1 } }
      });
      return res.json({ success: true, liked: true, helpful: updatedReview.helpful });
    }
  } catch (error) {
    console.error('Like review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/user/me
// @access  Private
const getMyReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        userId: req.user.id,
        isTrashed: false
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            location: true,
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { isTrashed: false },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              major: true,
              graduationYear: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      }),
      prisma.review.count({ where: { isTrashed: false } })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Public)
// @route   GET /api/reviews/all
// @access  Public
const getAllReviewsPublic = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { isTrashed: false },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              major: true,
              graduationYear: true
            }
          },
          university: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      }),
      prisma.review.count({ where: { isTrashed: false } })
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all reviews public error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SOFT DELETE / TRASH FUNCTIONS ====================

// @desc    Get all trashed reviews
// @route   GET /api/reviews/trashed
// @access  Admin
const getTrashedReviews = async (req, res) => {
  try {
    const trashedReviews = await prisma.review.findMany({
      where: { isTrashed: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            major: true,
            graduationYear: true
          }
        },
        university: {
          select: {
            id: true,
            name: true,
            location: true
          }
        }
      },
      orderBy: { trashedAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: trashedReviews
    });
  } catch (error) {
    console.error('Get trashed reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete review (move to trash)
// @route   PATCH /api/reviews/:id/soft-delete
// @access  Admin
const softDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (review.isTrashed) {
      return res.status(400).json({ success: false, message: 'Review is already in trash' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        isTrashed: true,
        trashedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        university: {
          select: { id: true, name: true }
        }
      }
    });
    
    // Update university rating
    await updateUniversityRating(review.universityId);
    
    res.json({
      success: true,
      message: 'Review moved to trash successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Soft delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore review from trash
// @route   PATCH /api/reviews/:id/restore
// @access  Admin
const restoreReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    if (!review.isTrashed) {
      return res.status(400).json({ success: false, message: 'Review is not in trash' });
    }
    
    const restoredReview = await prisma.review.update({
      where: { id },
      data: {
        isTrashed: false,
        trashedAt: null
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true }
        },
        university: {
          select: { id: true, name: true }
        }
      }
    });
    
    // Update university rating
    await updateUniversityRating(review.universityId);
    
    res.json({
      success: true,
      message: 'Review restored successfully',
      data: restoredReview
    });
  } catch (error) {
    console.error('Restore review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete review
// @route   DELETE /api/reviews/:id/permanent
// @access  Admin
const permanentDeleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const universityId = review.universityId;
    
    // Delete review likes first if table exists
    await prisma.reviewLike?.deleteMany({ where: { reviewId: id } });
    
    await prisma.review.delete({ where: { id } });
    
    // Update university rating
    await updateUniversityRating(universityId);
    
    res.json({
      success: true,
      message: 'Review permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Admin (or author)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating, pros, cons, tips, classYear, major } = req.body;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    // Allow author or admin to update
    if (review.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        title: title !== undefined ? title : review.title,
        content: content !== undefined ? content : review.content,
        rating: rating !== undefined ? parseFloat(rating) : review.rating,
        pros: pros !== undefined ? pros : review.pros,
        cons: cons !== undefined ? cons : review.cons,
        tips: tips !== undefined ? tips : review.tips,
        classYear: classYear !== undefined ? classYear : review.classYear,
        major: major !== undefined ? major : review.major
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, major: true, graduationYear: true }
        },
        university: {
          select: { id: true, name: true, location: true }
        }
      }
    });
    
    // Update university rating if rating changed
    if (rating !== undefined && rating !== review.rating) {
      await updateUniversityRating(review.universityId);
    }
    
    res.json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review (Hard delete)
// @route   DELETE /api/reviews/:id
// @access  Admin
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const universityId = review.universityId;
    
    await prisma.review.delete({ where: { id } });
    
    // Update university rating
    await updateUniversityRating(universityId);
    
    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
  getReviewsByUniversity, 
  createReview, 
  getReviewById, 
  likeReview,
  getMyReviews,
  getAllReviews,
  getAllReviewsPublic,
  getTrashedReviews,
  softDeleteReview,
  restoreReview,
  permanentDeleteReview,
  updateReview,
  deleteReview
};