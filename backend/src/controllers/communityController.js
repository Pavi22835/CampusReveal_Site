const { prisma } = require('../prisma');

// ==================== DISCUSSIONS ====================

// @desc    Get all discussions (excluding trashed)
// @route   GET /api/community/discussions
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const discussions = await prisma.discussion.findMany({
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
    
    // Check if current user liked each discussion
    const discussionsWithLikeStatus = await Promise.all(discussions.map(async (discussion) => {
      let isLikedByUser = false;
      if (userId) {
        const like = await prisma.discussionLike.findFirst({
          where: {
            discussionId: discussion.id,
            userId: userId
          }
        });
        isLikedByUser = !!like;
      }
      return { ...discussion, isLikedByUser };
    }));
    
    res.json({
      success: true,
      data: discussionsWithLikeStatus
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
    const discussions = await prisma.discussion.findMany({
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
    const userId = req.user?.id;
    
    const discussion = await prisma.discussion.findFirst({
      where: { id: req.params.id, isTrashed: false },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        },
        comments: {
          include: {
            author: {
              select: { name: true, avatar: true, role: true }
            },
            _count: {
              select: { likesRelation: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { comments: true }
        }
      }
    });
    
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }
    
    // Check if current user liked the discussion
    let isLikedByUser = false;
    if (userId) {
      const like = await prisma.discussionLike.findFirst({
        where: {
          discussionId: discussion.id,
          userId: userId
        }
      });
      isLikedByUser = !!like;
    }
    
    // Check if current user liked each comment
    const commentsWithLikeStatus = await Promise.all(discussion.comments.map(async (comment) => {
      let commentLiked = false;
      if (userId) {
        const commentLike = await prisma.commentLike.findFirst({
          where: {
            commentId: comment.id,
            userId: userId
          }
        });
        commentLiked = !!commentLike;
      }
      return { 
        ...comment, 
        isLikedByUser: commentLiked,
        likes: comment._count?.likesRelation || 0
      };
    }));
    
    res.json({
      success: true,
      data: {
        ...discussion,
        isLikedByUser,
        comments: commentsWithLikeStatus
      }
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
        title: req.body.title || '',
        content: req.body.content,
        tags: req.body.tags || [],
        authorId: req.user.id
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      data: { ...discussion, isLikedByUser: false }
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
    
    await prisma.comment.deleteMany({ where: { discussionId: id } });
    await prisma.discussionLike.deleteMany({ where: { discussionId: id } });
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

// @desc    Delete discussion (hard delete)
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
    const { content, parentId } = req.body;
    
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        discussionId: id,
        parentId: parentId || null
      },
      include: {
        author: {
          select: { name: true, avatar: true, role: true }
        }
      }
    });
    
    await prisma.discussion.update({
      where: { id },
      data: { replies: { increment: 1 } }
    });
    
    res.status(201).json({
      success: true,
      data: { ...comment, isLikedByUser: false, likes: 0 }
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
    const comments = await prisma.comment.findMany({
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
    
    await prisma.commentLike.deleteMany({ where: { commentId: id } });
    await prisma.comment.deleteMany({ where: { parentId: id } });
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

// @desc    Get mentors
// @route   GET /api/community/mentors
// @access  Public
const getMentors = async (req, res) => {
  try {
    const mentors = await prisma.mentor.findMany({
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
    const mentors = await prisma.mentor.findMany({
      where: { isTrashed: true },
      include: {
        user: {
          select: { name: true, avatar: true, role: true, major: true }
        }
      },
      orderBy: { trashedAt: 'desc' }
    });
    
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

// ==================== LIKE / UNLIKE DISCUSSION ====================

// @desc    Like or unlike a discussion
// @route   PUT /api/community/discussions/:id/like
// @access  Private
const likeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const discussion = await prisma.discussion.findUnique({
      where: { id }
    });

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found' });
    }

    const existingLike = await prisma.discussionLike.findFirst({
      where: {
        discussionId: id,
        userId: userId
      }
    });

    if (existingLike) {
      await prisma.discussionLike.delete({
        where: { id: existingLike.id }
      });

      const updatedDiscussion = await prisma.discussion.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      });

      return res.json({ 
        success: true, 
        liked: false, 
        likesCount: updatedDiscussion.likes
      });
    } else {
      await prisma.discussionLike.create({
        data: {
          discussionId: id,
          userId: userId
        }
      });

      const updatedDiscussion = await prisma.discussion.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });

      return res.json({ 
        success: true, 
        liked: true, 
        likesCount: updatedDiscussion.likes
      });
    }
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== LIKE / UNLIKE COMMENT ====================

// @desc    Like or unlike a comment
// @route   PUT /api/community/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const existingLike = await prisma.commentLike.findFirst({
      where: {
        commentId: id,
        userId: userId
      }
    });

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id }
      });

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { likes: { decrement: 1 } }
      });

      return res.json({ 
        success: true, 
        liked: false, 
        likesCount: updatedComment.likes
      });
    } else {
      await prisma.commentLike.create({
        data: {
          commentId: id,
          userId: userId
        }
      });

      const updatedComment = await prisma.comment.update({
        where: { id },
        data: { likes: { increment: 1 } }
      });

      return res.json({ 
        success: true, 
        liked: true, 
        likesCount: updatedComment.likes
      });
    }
  } catch (error) {
    console.error('Like comment error:', error);
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
  likeDiscussion,
  likeComment
};