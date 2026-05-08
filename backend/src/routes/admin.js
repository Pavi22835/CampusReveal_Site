const express = require('express');
const router = express.Router();
const { prisma } = require('../prisma');
const { protect, adminOnly } = require('../middleware/auth');

// @desc    Get all universities (Admin)
// @route   GET /api/admin/universities
// @access  Private/Admin
router.get('/universities', async (req, res) => {
  try {
    const universities = await prisma.university.findMany({
      where: { isTrashed: false },  // Exclude trashed universities
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: universities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const totalUniversities = await prisma.university.count({ where: { isTrashed: false } });
    const totalReviews = await prisma.review.count({ where: { isTrashed: false } });
    const totalDiscussions = await prisma.discussion.count();
    const totalUsers = await prisma.user.count({ where: { isTrashed: false } });
    const aggregateRating = await prisma.university.aggregate({ 
      where: { isTrashed: false },
      _avg: { rating: true } 
    });

    const avgRating = aggregateRating._avg?.rating || 0;
    const avgReviewsPerUni = totalUniversities > 0 ? Math.round(totalReviews / totalUniversities) : 0;

    res.json({
      success: true,
      data: {
        universities: totalUniversities,
        reviews: totalReviews,
        discussions: totalDiscussions,
        users: totalUsers,
        pendingReviews: 0,
        avgRating,
        totalRatings: totalReviews,
        avgReviewsPerUni
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users (Admin) - Excludes trashed users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isTrashed: false },  // Exclude trashed users
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        major: true,
        graduationYear: true,
        credits: true,
        avatar: true,
        universityId: true,
        createdAt: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all trashed users (soft deleted)
// @route   GET /api/admin/users/trashed
// @access  Private/Admin
router.get('/users/trashed', protect, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isTrashed: true },
      orderBy: { trashedAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        major: true,
        graduationYear: true,
        credits: true,
        avatar: true,
        universityId: true,
        createdAt: true,
        isTrashed: true,
        trashedAt: true
      }
    });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin trashed users error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get user by ID (Admin)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        major: true,
        graduationYear: true,
        credits: true,
        avatar: true,
        bio: true,
        universityId: true,
        createdAt: true,
        updatedAt: true,
        isTrashed: true,
        trashedAt: true,
        university: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            reviews: true,
            projects: true,
            discussions: true,
            comments: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, major, graduationYear, credits } = req.body;

    const userExists = await prisma.user.findUnique({ where: { id } });

    if (!userExists) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        role: role !== undefined ? role : undefined,
        major: major !== undefined ? major : undefined,
        graduationYear: graduationYear !== undefined ? parseInt(graduationYear) : undefined,
        credits: credits !== undefined ? parseInt(credits) : undefined
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        major: true,
        graduationYear: true,
        credits: true,
        avatar: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({ success: true, data: updatedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Soft delete user (move to trash)
// @route   PATCH /api/admin/users/:id/soft-delete
// @access  Private/Admin
router.patch('/users/:id/soft-delete', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isTrashed) {
      return res.status(400).json({ success: false, message: 'User is already in trash' });
    }

    // Don't allow trashing admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot move admin users to trash' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isTrashed: true,
        trashedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'User moved to trash successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Soft delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Restore user from trash
// @route   PATCH /api/admin/users/:id/restore
// @access  Private/Admin
router.patch('/users/:id/restore', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.isTrashed) {
      return res.status(400).json({ success: false, message: 'User is not in trash' });
    }

    const restoredUser = await prisma.user.update({
      where: { id },
      data: {
        isTrashed: false,
        trashedAt: null
      }
    });

    res.json({
      success: true,
      message: 'User restored successfully',
      data: restoredUser
    });
  } catch (error) {
    console.error('Restore user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Permanently delete user
// @route   DELETE /api/admin/users/:id/permanent
// @access  Private/Admin
router.delete('/users/:id/permanent', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    // Delete all related records first
    await prisma.review.deleteMany({ where: { userId: id } });
    await prisma.project.deleteMany({ where: { authorId: id } });
    await prisma.discussion.deleteMany({ where: { authorId: id } });
    await prisma.comment.deleteMany({ where: { authorId: id } });
    await prisma.mentor.deleteMany({ where: { userId: id } });

    // Then delete the user
    await prisma.user.delete({ where: { id } });

    res.json({
      success: true,
      message: 'User permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user (Original hard delete)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Don't allow deleting admin users
    if (user.role === 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Bulk add universities (Admin)
// @route   POST /api/admin/universities/bulk
// @access  Private/Admin
router.post('/universities/bulk', async (req, res) => {
  try {
    const { universities } = req.body;
    
    const results = [];
    for (const uni of universities) {
      const existing = await prisma.university.findUnique({
        where: { name: uni.name }
      });
      
      if (!existing) {
        const created = await prisma.university.create({
          data: {
            name: uni.name,
            location: uni.location,
            city: uni.city || "",
            state: uni.state || "Tamil Nadu",
            rating: uni.rating || 0,
            studentCount: uni.studentCount || 0,
            description: uni.description || ""
          }
        });
        results.push(created);
      }
    }
    
    res.json({
      success: true,
      data: results,
      message: `Added ${results.length} new universities!`
    });
  } catch (error) {
    console.error('Bulk add error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;