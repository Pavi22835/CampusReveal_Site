const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/reviewController');
const { protect, adminOnly } = require('../middleware/auth');

// Public routes
router.get('/all', getAllReviewsPublic);
router.get('/university/:universityId', getReviewsByUniversity);

// Admin only routes - Trash / Soft Delete operations
router.get('/trashed', protect, adminOnly, getTrashedReviews);
router.patch('/:id/soft-delete', protect, adminOnly, softDeleteReview);
router.patch('/:id/restore', protect, adminOnly, restoreReview);
router.delete('/:id/permanent', protect, adminOnly, permanentDeleteReview);

router.get('/:id', getReviewById);

// Protected routes (user must be logged in)
router.get('/user/me', protect, getMyReviews);
router.post('/', protect, createReview);
router.put('/:id/like', protect, likeReview);

// Admin only routes - CRUD operations
router.get('/', protect, adminOnly, getAllReviews);
router.put('/:id', protect, adminOnly, updateReview);
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;