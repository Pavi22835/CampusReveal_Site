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

// ==================== PUBLIC ROUTES ====================
// Get all reviews (public)
router.get('/all', getAllReviewsPublic);

// Get reviews by university
router.get('/university/:universityId', getReviewsByUniversity);

// Get single review by ID
router.get('/:id', getReviewById);

// ==================== PROTECTED ROUTES ====================
// Get current user's reviews
router.get('/user/me', protect, getMyReviews);

// Create a new review
router.post('/', protect, createReview);

// Like a review
router.put('/:id/like', protect, likeReview);

// ==================== ADMIN ONLY ROUTES ====================
// Get all reviews (admin)
router.get('/', protect, adminOnly, getAllReviews);

// Get trashed reviews
router.get('/trashed', protect, adminOnly, getTrashedReviews);

// Soft delete review (move to trash)
router.patch('/:id/soft-delete', protect, adminOnly, softDeleteReview);

// Restore review from trash
router.patch('/:id/restore', protect, adminOnly, restoreReview);

// Permanently delete review
router.delete('/:id/permanent', protect, adminOnly, permanentDeleteReview);

// Update review
router.put('/:id', protect, adminOnly, updateReview);

// Hard delete review
router.delete('/:id', protect, adminOnly, deleteReview);

module.exports = router;