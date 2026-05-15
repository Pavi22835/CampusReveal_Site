const express = require('express');
const router = express.Router();
const { 
  getDiscussions, 
  getTrashedDiscussions,
  getDiscussionById,
  createDiscussion, 
  updateDiscussion,
  softDeleteDiscussion,
  restoreDiscussion,
  permanentDeleteDiscussion,
  deleteDiscussion,
  addComment,
  getTrashedComments,
  softDeleteComment,
  restoreComment,
  permanentDeleteComment,
  getMentors, 
  getTrashedMentors,
  softDeleteMentor,
  restoreMentor,
  permanentDeleteMentor,
  // ❌ REMOVE these event imports
  // getEvents,
  // getTrashedEvents,
  // softDeleteEvent,
  // restoreEvent,
  // permanentDeleteEvent,
  likeDiscussion,
  likeComment
} = require('../controllers/communityController');
const { protect, adminOnly } = require('../middleware/auth');

// ==================== DISCUSSION ROUTES ====================

// Public routes
router.get('/discussions', getDiscussions);
router.get('/discussions/:id', getDiscussionById);

// Protected routes (user must be logged in)
router.post('/discussions', protect, createDiscussion);
router.post('/discussions/:id/comments', protect, addComment);

// Like/Unlike routes
router.put('/discussions/:id/like', protect, likeDiscussion);
router.put('/comments/:id/like', protect, likeComment);

// Admin only routes - Discussion Trash operations
router.get('/discussions/trashed', protect, adminOnly, getTrashedDiscussions);
router.put('/discussions/:id', protect, adminOnly, updateDiscussion);
router.patch('/discussions/:id/soft-delete', protect, adminOnly, softDeleteDiscussion);
router.patch('/discussions/:id/restore', protect, adminOnly, restoreDiscussion);
router.delete('/discussions/:id/permanent', protect, adminOnly, permanentDeleteDiscussion);
router.delete('/discussions/:id', protect, adminOnly, deleteDiscussion);

// ==================== COMMENT ROUTES ====================

// Admin only routes - Comment Trash operations
router.get('/comments/trashed', protect, adminOnly, getTrashedComments);
router.patch('/comments/:id/soft-delete', protect, adminOnly, softDeleteComment);
router.patch('/comments/:id/restore', protect, adminOnly, restoreComment);
router.delete('/comments/:id/permanent', protect, adminOnly, permanentDeleteComment);

// ==================== MENTOR ROUTES ====================

// Public routes
router.get('/mentors', getMentors);

// Admin only routes - Mentor Trash operations
router.get('/mentors/trashed', protect, adminOnly, getTrashedMentors);
router.patch('/mentors/:id/soft-delete', protect, adminOnly, softDeleteMentor);
router.patch('/mentors/:id/restore', protect, adminOnly, restoreMentor);
router.delete('/mentors/:id/permanent', protect, adminOnly, permanentDeleteMentor);

// ❌ REMOVE ALL EVENT ROUTES BELOW

module.exports = router;