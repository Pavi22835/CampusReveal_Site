const { prisma } = require('../prisma');

// @desc    Get reviews by university
// @route   GET /api/reviews/university/:universityId
// @access  Public
const getReviewsByUniversity = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { 
        universityId: req.params.universityId,
        isTrashed: false  // Exclude trashed reviews
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
            name: true,
            location: true
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
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔑 Body keys:', Object.keys(req.body));
    
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

    console.log('📍 Extracted universityId:', universityId);
    console.log('👤 Authenticated user:', req.user?.id);

    if (!universityId) {
      console.warn('⚠️ Missing universityId in request body');
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
          socialLife: 0
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
    const allReviews = await prisma.review.findMany({
      where: { 
        universityId: universityId,
        isTrashed: false  // Only count non-trashed reviews
      },
      select: { rating: true }
    });
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await prisma.university.update({
      where: { id: universityId },
      data: { rating: avgRating }
    });
    
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
      data: review,
      message: "Review submitted successfully! You earned 50 credits!"
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = async (req, res) => {
  try {
    const review = await prisma.review.findUnique({
      where: { id: req.params.id },
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
    
    res.json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like a review
// @route   PUT /api/reviews/:id/like
// @access  Private
const likeReview = async (req, res) => {
  try {
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: {
        helpful: {
          increment: 1
        }
      }
    });
    
    res.json({
      success: true,
      helpful: review.helpful
    });
  } catch (error) {
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
        isTrashed: false  // Exclude trashed reviews
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            location: true
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin) - Excludes trashed
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isTrashed: false },  // Exclude trashed reviews
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
    });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Public) - Excludes trashed
// @route   GET /api/reviews/all
// @access  Public
const getAllReviewsPublic = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { isTrashed: false },  // Exclude trashed reviews
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
    });

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Get all reviews public error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SOFT DELETE / TRASH FUNCTIONS ====================

// @desc    Get all trashed reviews (soft deleted)
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
    
    // Update university average rating (exclude trashed reviews)
    const allReviews = await prisma.review.findMany({
      where: { 
        universityId: review.universityId,
        isTrashed: false
      },
      select: { rating: true }
    });
    
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
    
    await prisma.university.update({
      where: { id: review.universityId },
      data: { rating: avgRating }
    });
    
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
    
    // Update university average rating
    const allReviews = await prisma.review.findMany({
      where: { 
        universityId: review.universityId,
        isTrashed: false
      },
      select: { rating: true }
    });
    
    const avgRating = allReviews.length > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
      : 0;
    
    await prisma.university.update({
      where: { id: review.universityId },
      data: { rating: avgRating }
    });
    
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
    
    await prisma.review.delete({ where: { id } });
    
    // Update university average rating after permanent delete
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
    
    res.json({
      success: true,
      message: 'Review permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review (Admin)
// @route   PUT /api/reviews/:id
// @access  Admin
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, rating } = req.body;
    
    const review = await prisma.review.findUnique({ where: { id } });
    
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        title: title !== undefined ? title : review.title,
        content: content !== undefined ? content : review.content,
        rating: rating !== undefined ? parseFloat(rating) : review.rating
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
    
    // Update university average rating if rating changed
    if (rating !== undefined && rating !== review.rating) {
      const allReviews = await prisma.review.findMany({
        where: { 
          universityId: review.universityId,
          isTrashed: false
        },
        select: { rating: true }
      });
      
      const avgRating = allReviews.length > 0 
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length 
        : 0;
      
      await prisma.university.update({
        where: { id: review.universityId },
        data: { rating: avgRating }
      });
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

// @desc    Delete review (Original - Hard delete)
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
    
    // Update university average rating
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