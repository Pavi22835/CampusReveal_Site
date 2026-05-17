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
  likeDiscussion,
  likeComment
} = require('../controllers/communityController');
const { protect, adminOnly } = require('../middleware/auth');

// ==================== DISCUSSION ROUTES ====================

// Public routes
router.get('/discussions', getDiscussions);

// ==================== STATIC ROUTES - MUST COME BEFORE DYNAMIC ROUTES ====================
// Admin only routes - Discussion Trash operations (STATIC - no parameters)
router.get('/discussions/trashed', protect, adminOnly, getTrashedDiscussions);

// ==================== DYNAMIC ROUTES (WITH :id PARAMETER) - MUST COME AFTER STATIC ROUTES ====================
router.get('/discussions/:id', getDiscussionById);
router.post('/discussions', protect, createDiscussion);
router.post('/discussions/:id/comments', protect, addComment);
router.put('/discussions/:id/like', protect, likeDiscussion);
router.put('/discussions/:id', protect, adminOnly, updateDiscussion);
router.patch('/discussions/:id/soft-delete', protect, adminOnly, softDeleteDiscussion);
router.patch('/discussions/:id/restore', protect, adminOnly, restoreDiscussion);
router.delete('/discussions/:id/permanent', protect, adminOnly, permanentDeleteDiscussion);
router.delete('/discussions/:id', protect, adminOnly, deleteDiscussion);

// ==================== COMMENT ROUTES ====================

// Static routes first
router.get('/comments/trashed', protect, adminOnly, getTrashedComments);

// Dynamic routes with :id parameter
router.put('/comments/:id/like', protect, likeComment);
router.patch('/comments/:id/soft-delete', protect, adminOnly, softDeleteComment);
router.patch('/comments/:id/restore', protect, adminOnly, restoreComment);
router.delete('/comments/:id/permanent', protect, adminOnly, permanentDeleteComment);

// ==================== MENTOR ROUTES ====================

// Public routes
router.get('/mentors', getMentors);

// Static routes first
router.get('/mentors/trashed', protect, adminOnly, getTrashedMentors);

// Dynamic routes with :id parameter
router.patch('/mentors/:id/soft-delete', protect, adminOnly, softDeleteMentor);
router.patch('/mentors/:id/restore', protect, adminOnly, restoreMentor);
router.delete('/mentors/:id/permanent', protect, adminOnly, permanentDeleteMentor);

module.exports = router;