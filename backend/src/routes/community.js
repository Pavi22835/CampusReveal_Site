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
  getEvents,
  getTrashedEvents,
  softDeleteEvent,
  restoreEvent,
  permanentDeleteEvent
} = require('../controllers/communityController');
const { protect, adminOnly } = require('../middleware/auth');

// ==================== DISCUSSION ROUTES ====================

// Public routes
router.get('/discussions', getDiscussions);  // ✅ CHANGED: added /discussions
router.get('/discussions/:id', getDiscussionById);  // ✅ CHANGED: added /discussions/

// Protected routes (user must be logged in)
router.post('/discussions', protect, createDiscussion);  // ✅ CHANGED: added /discussions
router.post('/discussions/:id/comments', protect, addComment);  // ✅ CHANGED: added /discussions/

// Admin only routes - Discussion Trash operations
router.get('/discussions/trashed', protect, adminOnly, getTrashedDiscussions);  // ✅ CHANGED: added /discussions/
router.put('/discussions/:id', protect, adminOnly, updateDiscussion);  // ✅ CHANGED: added /discussions/
router.patch('/discussions/:id/soft-delete', protect, adminOnly, softDeleteDiscussion);  // ✅ CHANGED: added /discussions/
router.patch('/discussions/:id/restore', protect, adminOnly, restoreDiscussion);  // ✅ CHANGED: added /discussions/
router.delete('/discussions/:id/permanent', protect, adminOnly, permanentDeleteDiscussion);  // ✅ CHANGED: added /discussions/
router.delete('/discussions/:id', protect, adminOnly, deleteDiscussion);  // ✅ CHANGED: added /discussions/

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

// ==================== EVENT ROUTES ====================

// Public routes
router.get('/events', getEvents);

// Admin only routes - Event Trash operations
router.get('/events/trashed', protect, adminOnly, getTrashedEvents);
router.patch('/events/:id/soft-delete', protect, adminOnly, softDeleteEvent);
router.patch('/events/:id/restore', protect, adminOnly, restoreEvent);
router.delete('/events/:id/permanent', protect, adminOnly, permanentDeleteEvent);

module.exports = router;