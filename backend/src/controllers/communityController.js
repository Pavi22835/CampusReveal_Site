const { prisma } = require('../prisma');

// Helper function to check if column exists
const isColumnExists = async (model, column) => {
  try {
    // Try to query with the column, if it fails, column doesn't exist
    await prisma[model].findFirst({
      where: { [column]: true },
      take: 1
    });
    return true;
  } catch (error) {
    return false;
  }
};

// ==================== DISCUSSIONS ====================

// @desc    Get all discussions (excluding trashed if column exists)
// @route   GET /api/community/discussions
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    let discussions;
    
    try {
      // Try to fetch with isTrashed filter first
      discussions = await prisma.discussion.findMany({
        where: { isTrashed: false },
        include: {
          author: {
            select: { name: true, avatar: true, role: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      // If column doesn't exist, fetch without filter
      if (error.message.includes('does not exist')) {
        discussions = await prisma.discussion.findMany({
          include: {
            author: {
              select: { name: true, avatar: true, role: true }
            },
            _count: {
              select: { comments: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get discussions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed discussions (soft deleted)
// @route   GET /api/community/discussions/trashed
// @access  Admin
const getTrashedDiscussions = async (req, res) => {
  try {
    let discussions = [];
    
    try {
      discussions = await prisma.discussion.findMany({
        where: { isTrashed: true },
        include: {
          author: {
            select: { name: true, avatar: true, role: true }
          },
          _count: {
            select: { comments: true }
          }
        },
        orderBy: { trashedAt: 'desc' }
      });
    } catch (error) {
      // If column doesn't exist, return empty array
      if (error.message.includes('does not exist')) {
        discussions = [];
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get trashed discussions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single discussion
// @route   GET /api/community/discussions/:id
// @access  Public
const getDiscussionById = async (req, res) => {
  try {
    let discussion;
    
    try {
      discussion = await prisma.discussion.findUnique({
        where: { id: req.params.id },
        include: {
          author: {
            select: { name: true, avatar: true, role: true }
          },
          comments: {
            include: {
              author: {
                select: { name: true, avatar: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { comments: true }
          }
        }
      });
    } catch (error) {
      // Fallback without isTrashed filter
      discussion = await prisma.discussion.findUnique({
        where: { id: req.params.id },
        include: {
          author: {
            select: { name: true, avatar: true, role: true }
          },
          comments: {
            include: {
              author: {
                select: { name: true, avatar: true, role: true }
              }
            },
            orderBy: { createdAt: 'asc' }
          },
          _count: {
            select: { comments: true }
          }
        }
      });
    }
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Get discussion by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create discussion
// @route   POST /api/community/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const discussion = await prisma.discussion.create({
      data: {
        title: req.body.title,
        content: req.body.content,
        tags: req.body.tags || [],
        authorId: req.user.id
      },
      include: {
        author: {
          select: { name: true, avatar: true }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update discussion
// @route   PUT /api/community/discussions/:id
// @access  Admin
const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;
    
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    const updatedDiscussion = await prisma.discussion.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        tags: tags !== undefined ? tags : undefined
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedDiscussion,
      message: 'Discussion updated successfully'
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete discussion (move to trash)
// @route   PATCH /api/community/discussions/:id/soft-delete
// @access  Admin
const softDeleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    try {
      // Check if isTrashed column exists and value
      if (discussion.isTrashed) {
        return res.status(400).json({ success: false, message: 'Discussion is already in trash' });
      }
      
      const updatedDiscussion = await prisma.discussion.update({
        where: { id },
        data: {
          isTrashed: true,
          trashedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        message: 'Discussion moved to trash successfully',
        data: updatedDiscussion
      });
    } catch (error) {
      // If column doesn't exist, suggest running migration
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE discussions ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Soft delete discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore discussion from trash
// @route   PATCH /api/community/discussions/:id/restore
// @access  Admin
const restoreDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    try {
      if (!discussion.isTrashed) {
        return res.status(400).json({ success: false, message: 'Discussion is not in trash' });
      }
      
      const restoredDiscussion = await prisma.discussion.update({
        where: { id },
        data: {
          isTrashed: false,
          trashedAt: null
        }
      });
      
      res.json({
        success: true,
        message: 'Discussion restored successfully',
        data: restoredDiscussion
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE discussions ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Restore discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete discussion
// @route   DELETE /api/community/discussions/:id/permanent
// @access  Admin
const permanentDeleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    // First delete all comments related to this discussion
    await prisma.comment.deleteMany({ where: { discussionId: id } });
    
    // Then delete the discussion
    await prisma.discussion.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Discussion permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete discussion (Original hard delete)
// @route   DELETE /api/community/discussions/:id
// @access  Admin
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const discussion = await prisma.discussion.findUnique({ where: { id } });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    await prisma.discussion.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== COMMENTS ====================

// @desc    Add comment to discussion
// @route   POST /api/community/discussions/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        discussionId: id
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        }
      }
    });
    
    // Update discussion reply count
    await prisma.discussion.update({
      where: { id },
      data: { replies: { increment: 1 } }
    });
    
    res.status(201).json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed comments
// @route   GET /api/community/comments/trashed
// @access  Admin
const getTrashedComments = async (req, res) => {
  try {
    let comments = [];
    
    try {
      comments = await prisma.comment.findMany({
        where: { isTrashed: true },
        include: {
          author: {
            select: { name: true, avatar: true, role: true }
          },
          discussion: {
            select: { id: true, title: true }
          }
        },
        orderBy: { trashedAt: 'desc' }
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        comments = [];
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get trashed comments error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete comment
// @route   PATCH /api/community/comments/:id/soft-delete
// @access  Admin
const softDeleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    try {
      if (comment.isTrashed) {
        return res.status(400).json({ success: false, message: 'Comment is already in trash' });
      }
      
      const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
          isTrashed: true,
          trashedAt: new Date()
        }
      });
      
      // Update discussion reply count
      await prisma.discussion.update({
        where: { id: comment.discussionId },
        data: { replies: { decrement: 1 } }
      });
      
      res.json({
        success: true,
        message: 'Comment moved to trash successfully',
        data: updatedComment
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE comments ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Soft delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore comment
// @route   PATCH /api/community/comments/:id/restore
// @access  Admin
const restoreComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    try {
      if (!comment.isTrashed) {
        return res.status(400).json({ success: false, message: 'Comment is not in trash' });
      }
      
      const restoredComment = await prisma.comment.update({
        where: { id },
        data: {
          isTrashed: false,
          trashedAt: null
        }
      });
      
      // Update discussion reply count
      await prisma.discussion.update({
        where: { id: comment.discussionId },
        data: { replies: { increment: 1 } }
      });
      
      res.json({
        success: true,
        message: 'Comment restored successfully',
        data: restoredComment
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE comments ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Restore comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete comment
// @route   DELETE /api/community/comments/:id/permanent
// @access  Admin
const permanentDeleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await prisma.comment.findUnique({ where: { id } });
    
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    
    await prisma.comment.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Comment permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== MENTORS ====================

// @desc    Get mentors (excluding trashed if column exists)
// @route   GET /api/community/mentors
// @access  Public
const getMentors = async (req, res) => {
  try {
    let mentors;
    
    try {
      mentors = await prisma.mentor.findMany({
        where: { 
          availability: true,
          isTrashed: false
        },
        include: {
          user: {
            select: { name: true, avatar: true, role: true, major: true }
          }
        },
        take: 10
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        mentors = await prisma.mentor.findMany({
          where: { availability: true },
          include: {
            user: {
              select: { name: true, avatar: true, role: true, major: true }
            }
          },
          take: 10
        });
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: mentors
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed mentors
// @route   GET /api/community/mentors/trashed
// @access  Admin
const getTrashedMentors = async (req, res) => {
  try {
    let mentors = [];
    
    try {
      mentors = await prisma.mentor.findMany({
        where: { isTrashed: true },
        include: {
          user: {
            select: { name: true, avatar: true, role: true, major: true }
          }
        },
        orderBy: { trashedAt: 'desc' }
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        mentors = [];
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: mentors
    });
  } catch (error) {
    console.error('Get trashed mentors error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete mentor
// @route   PATCH /api/community/mentors/:id/soft-delete
// @access  Admin
const softDeleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
    
    try {
      if (mentor.isTrashed) {
        return res.status(400).json({ success: false, message: 'Mentor is already in trash' });
      }
      
      const updatedMentor = await prisma.mentor.update({
        where: { id },
        data: {
          isTrashed: true,
          trashedAt: new Date(),
          availability: false
        }
      });
      
      res.json({
        success: true,
        message: 'Mentor moved to trash successfully',
        data: updatedMentor
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE mentors ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Soft delete mentor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore mentor
// @route   PATCH /api/community/mentors/:id/restore
// @access  Admin
const restoreMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
    
    try {
      if (!mentor.isTrashed) {
        return res.status(400).json({ success: false, message: 'Mentor is not in trash' });
      }
      
      const restoredMentor = await prisma.mentor.update({
        where: { id },
        data: {
          isTrashed: false,
          trashedAt: null
        }
      });
      
      res.json({
        success: true,
        message: 'Mentor restored successfully',
        data: restoredMentor
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE mentors ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Restore mentor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete mentor
// @route   DELETE /api/community/mentors/:id/permanent
// @access  Admin
const permanentDeleteMentor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const mentor = await prisma.mentor.findUnique({ where: { id } });
    
    if (!mentor) {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }
    
    await prisma.mentor.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Mentor permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete mentor error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EVENTS ====================

// @desc    Get events (excluding trashed if column exists)
// @route   GET /api/community/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    let events;
    
    try {
      events = await prisma.event.findMany({
        where: {
          date: { gte: new Date() },
          isTrashed: false
        },
        orderBy: { date: 'asc' },
        take: 10
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        events = await prisma.event.findMany({
          where: {
            date: { gte: new Date() }
          },
          orderBy: { date: 'asc' },
          take: 10
        });
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all trashed events
// @route   GET /api/community/events/trashed
// @access  Admin
const getTrashedEvents = async (req, res) => {
  try {
    let events = [];
    
    try {
      events = await prisma.event.findMany({
        where: { isTrashed: true },
        orderBy: { trashedAt: 'desc' }
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        events = [];
      } else {
        throw error;
      }
    }
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get trashed events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Soft delete event
// @route   PATCH /api/community/events/:id/soft-delete
// @access  Admin
const softDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({ where: { id } });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    try {
      if (event.isTrashed) {
        return res.status(400).json({ success: false, message: 'Event is already in trash' });
      }
      
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          isTrashed: true,
          trashedAt: new Date()
        }
      });
      
      res.json({
        success: true,
        message: 'Event moved to trash successfully',
        data: updatedEvent
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE events ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Soft delete event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore event
// @route   PATCH /api/community/events/:id/restore
// @access  Admin
const restoreEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({ where: { id } });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    try {
      if (!event.isTrashed) {
        return res.status(400).json({ success: false, message: 'Event is not in trash' });
      }
      
      const restoredEvent = await prisma.event.update({
        where: { id },
        data: {
          isTrashed: false,
          trashedAt: null
        }
      });
      
      res.json({
        success: true,
        message: 'Event restored successfully',
        data: restoredEvent
      });
    } catch (error) {
      if (error.message.includes('does not exist')) {
        res.status(500).json({ 
          success: false, 
          message: 'Database migration needed. Please run SQL ALTER TABLE events ADD COLUMN is_trashed BOOLEAN DEFAULT FALSE;' 
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Restore event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Permanently delete event
// @route   DELETE /api/community/events/:id/permanent
// @access  Admin
const permanentDeleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await prisma.event.findUnique({ where: { id } });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    await prisma.event.delete({ where: { id } });
    
    res.json({
      success: true,
      message: 'Event permanently deleted successfully'
    });
  } catch (error) {
    console.error('Permanent delete event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { 
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
};