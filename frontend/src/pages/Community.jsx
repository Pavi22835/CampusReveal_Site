import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Users, Calendar, Search, 
  TrendingUp, Sparkles, Heart, Share2, 
  Plus, MessageCircle, Star, BadgeCheck,
  ArrowRight, Shield, Zap, Loader2, UserPlus, Clock,
  Award, BookOpen, Video, MapPin, Filter, ThumbsUp, ThumbsDown,
  Send, Image, Link as LinkIcon, Smile, MoreHorizontal, Flag,
  Trash2, Edit2, Check, X, Reply, Archive, RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Community.css';

export default function Community() {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [trashedPosts, setTrashedPosts] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [newReply, setNewReply] = useState({});
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [activePostId, setActivePostId] = useState(null);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.role === 'ADMIN' || user?.email === 'admin@campusreveal.com') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
    fetchPosts();
    if (isAdmin) {
      fetchTrashedPosts();
    }
  }, [user, isAdmin]);

  // Format date for display
  const formatTimestamp = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  // Fetch all active discussions from API
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.getDiscussions();
      console.log('Fetched discussions:', result);
      
      if (result?.success && Array.isArray(result.data)) {
        const activePosts = result.data
          .filter(post => !post.isTrashed)
          .map((discussion) => ({
            id: discussion.id,
            content: discussion.content,
            user: {
              username: discussion.author?.name
                ? discussion.author.name.toLowerCase().replace(/\s+/g, '_')
                : 'anonymous',
              name: discussion.author?.name || 'Anonymous',
              avatar: discussion.author?.avatar || null,
              verified: discussion.author?.role === 'ADMIN',
              isAdmin: discussion.author?.role === 'ADMIN'
            },
            likes: discussion.likes || 0,
            comments: discussion._count?.comments || 0,
            timestamp: discussion.createdAt,
            liked: false,
            isTrashed: false,
            tags: discussion.tags || [],
            commentsList: [],
            views: discussion.views || 0,
            replies: discussion.replies || 0
          }));
        setPosts(activePosts);
      } else {
        setError('Unable to load discussions');
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load community posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch trashed discussions (admin only)
  const fetchTrashedPosts = async () => {
    try {
      const result = await api.getTrashedDiscussions?.(token);
      if (result?.success && Array.isArray(result.data)) {
        const formattedTrashed = result.data.map((discussion) => ({
          id: discussion.id,
          content: discussion.content,
          user: {
            username: discussion.author?.name
              ? discussion.author.name.toLowerCase().replace(/\s+/g, '_')
              : 'anonymous',
            name: discussion.author?.name || 'Anonymous',
            avatar: discussion.author?.avatar || null,
            verified: discussion.author?.role === 'ADMIN',
            isAdmin: discussion.author?.role === 'ADMIN'
          },
          likes: discussion.likes || 0,
          comments: discussion._count?.comments || 0,
          timestamp: discussion.createdAt,
          liked: false,
          isTrashed: true,
          trashedAt: discussion.trashedAt,
          tags: discussion.tags || [],
          commentsList: [],
          views: discussion.views || 0,
          replies: discussion.replies || 0
        }));
        setTrashedPosts(formattedTrashed);
      }
    } catch (error) {
      console.error('Error fetching trashed discussions:', error);
      setTrashedPosts([]);
    }
  };

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    try {
      const result = await api.getDiscussionById(postId);
      if (result.success && result.data) {
        const formattedComments = result.data.comments?.map(comment => ({
          id: comment.id,
          user: {
            username: comment.author?.name?.toLowerCase().replace(/\s/g, '_') || 'anonymous',
            name: comment.author?.name || 'Anonymous',
            verified: comment.author?.role === 'ADMIN',
            isAdmin: comment.author?.role === 'ADMIN'
          },
          content: comment.content,
          timestamp: comment.createdAt,
          likes: comment.likes || 0,
          liked: false,
          replies: []
        })) || [];
        
        // Update posts with comments
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentsList: formattedComments, comments: formattedComments.length }
            : post
        ));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert('Please enter some content for your post');
      return;
    }

    try {
      const result = await api.createDiscussion({
        title: '', // Empty title to avoid duplication
        content: newPostContent,
        tags: []
      }, token);
      
      if (result.success) {
        alert('Post created successfully!');
        await fetchPosts();
        setNewPostContent('');
        setShowNewPostModal(false);
      } else {
        alert(result.message || 'Failed to create post');
      }
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Error creating post');
    }
  };

  // Add comment to post
  const handleAddComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const result = await api.addComment(postId, newComment, token);
      if (result.success) {
        await fetchComments(postId);
        setNewComment('');
        setActivePostId(null);
      } else {
        alert('Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Error adding comment');
    }
  };

  // Add reply to comment
  const handleAddReply = async (postId, commentId) => {
    const replyText = newReply[commentId];
    if (!replyText?.trim()) return;

    try {
      const result = await api.addComment(postId, replyText, token);
      if (result.success) {
        await fetchComments(postId);
        setNewReply(prev => ({ ...prev, [commentId]: '' }));
        setActiveCommentId(null);
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      alert('Error adding reply');
    }
  };

  // Like a post
  const handleLikePost = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    ));
  };

  // Like a comment
  const handleLikeComment = (postId, commentId) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      return {
        ...post,
        commentsList: post.commentsList.map(comment => {
          if (comment.id !== commentId) return comment;
          return { ...comment, likes: comment.liked ? comment.likes - 1 : comment.likes + 1, liked: !comment.liked };
        })
      };
    }));
  };

  // Soft delete post (move to trash)
  const handleSoftDeletePost = async (postId) => {
    if (!isAdmin) {
      alert('Only admins can delete posts');
      return;
    }
    if (window.confirm('Move this post to trash? You can restore it later.')) {
      try {
        const result = await api.softDeleteDiscussion?.(postId, token);
        if (result?.success) {
          await fetchPosts();
          await fetchTrashedPosts();
          alert('Post moved to trash');
        } else {
          alert('Failed to move post to trash');
        }
      } catch (err) {
        console.error('Soft delete error:', err);
        alert('Error moving post to trash');
      }
    }
  };

  // Restore post from trash
  const handleRestorePost = async (postId) => {
    if (!isAdmin) return;
    if (window.confirm('Restore this post from trash?')) {
      try {
        const result = await api.restoreDiscussion?.(postId, token);
        if (result?.success) {
          await fetchPosts();
          await fetchTrashedPosts();
          alert('Post restored');
        } else {
          alert('Failed to restore post');
        }
      } catch (err) {
        console.error('Restore error:', err);
        alert('Error restoring post');
      }
    }
  };

  // Permanently delete post
  const handlePermanentDeletePost = async (postId) => {
    if (!isAdmin) return;
    if (window.confirm('Permanently delete this post? This action cannot be undone.')) {
      try {
        const result = await api.permanentDeleteDiscussion?.(postId, token);
        if (result?.success) {
          await fetchTrashedPosts();
          alert('Post permanently deleted');
        } else {
          alert('Failed to delete post');
        }
      } catch (err) {
        console.error('Permanent delete error:', err);
        alert('Error deleting post');
      }
    }
  };

  // Soft delete comment
  const handleSoftDeleteComment = async (postId, commentId) => {
    if (!isAdmin) {
      alert('Only admins can delete comments');
      return;
    }
    if (window.confirm('Move this comment to trash?')) {
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              commentsList: post.commentsList.filter(c => c.id !== commentId),
              comments: Math.max(0, (post.comments || 0) - 1)
            }
          : post
      ));
      
      try {
        await api.softDeleteComment?.(commentId, token);
      } catch (error) {
        console.error('API soft delete comment error:', error);
      }
    }
  };

  // Toggle comments section and fetch comments
  const toggleComments = async (postId) => {
    if (activePostId === postId) {
      setActivePostId(null);
    } else {
      setActivePostId(postId);
      const post = posts.find(p => p.id === postId);
      if (post && (!post.commentsList || post.commentsList.length === 0)) {
        await fetchComments(postId);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Get current list based on active tab
  const currentList = activeTab === 'all' ? posts : trashedPosts;
  
  const filteredList = currentList.filter(post =>
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="ig-loading">
        <div className="ig-spinner"></div>
        <p>Loading community posts...</p>
      </div>
    );
  }

  return (
    <div className="instagram-community">
      <div className="ig-container">
        {/* Header */}
        <div className="ig-header">
          <h1>Community</h1>
          <button className="create-post-btn" onClick={() => setShowNewPostModal(true)}>
            <Plus size={20} />
          </button>
        </div>

        {/* Tabs for Admin */}
        {isAdmin && (
          <div className="ig-tabs">
            <button 
              className={`ig-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <MessageSquare size={16} />
              All Posts
              <span className="ig-tab-count">{posts.length}</span>
            </button>
            <button 
              className={`ig-tab-btn ${activeTab === 'trash' ? 'active' : ''}`}
              onClick={() => setActiveTab('trash')}
            >
              <Archive size={16} />
              Trash
              <span className="ig-tab-count trash-count">{trashedPosts.length}</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="ig-search">
          <Search size={16} />
          <input
            type="text"
            placeholder={`Search in ${activeTab === 'all' ? 'posts' : 'trash'}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Admin Banner */}
        {isAdmin && activeTab === 'all' && (
          <div className="ig-admin-banner">
            <Shield size={14} />
            <span>Admin mode - You can delete posts and comments</span>
          </div>
        )}

        {activeTab === 'trash' && trashedPosts.length > 0 && (
          <div className="ig-trash-banner">
            <Archive size={14} />
            <span>Items in trash can be restored or permanently deleted</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="ig-error">
            <p>{error}</p>
            <button onClick={fetchPosts}>Retry</button>
          </div>
        )}

        {/* Posts Feed */}
        <div className="ig-feed">
          {filteredList.length > 0 ? (
            filteredList.map((post) => (
              <div key={post.id} className={`ig-post ${post.isTrashed ? 'trashed-post' : ''}`}>
                {/* Post Header */}
                <div className="ig-post-header">
                  <div className="ig-post-user">
                    <div className="ig-avatar">
                      {post.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="ig-user-info">
                      <span className="ig-username">{post.user?.username || 'Anonymous'}</span>
                      {post.user?.verified && <BadgeCheck size={12} className="ig-verified" />}
                      <span className="ig-time">• {formatTimestamp(post.timestamp)}</span>
                      {post.isTrashed && <span className="trashed-badge">Trashed</span>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="ig-post-actions-menu">
                      {!post.isTrashed ? (
                        <button onClick={() => handleSoftDeletePost(post.id)} className="ig-more" title="Move to Trash">
                          <Archive size={16} />
                        </button>
                      ) : (
                        <>
                          <button onClick={() => handleRestorePost(post.id)} className="ig-more restore" title="Restore">
                            <RotateCcw size={16} />
                          </button>
                          <button onClick={() => handlePermanentDeletePost(post.id)} className="ig-more delete" title="Permanently Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Post Content - Only show content once */}
                <div className="ig-post-content">
                  <p>{post.content}</p>
                </div>

                {/* Post Actions - Only show for active posts */}
                {!post.isTrashed && (
                  <>
                    <div className="ig-post-actions">
                      <button onClick={() => handleLikePost(post.id)} className={`ig-action ${post.liked ? 'liked' : ''}`}>
                        <Heart size={22} fill={post.liked ? '#ed4956' : 'none'} />
                      </button>
                      <button onClick={() => toggleComments(post.id)} className="ig-action">
                        <MessageCircle size={22} />
                      </button>
                    </div>

                    {/* Likes Count */}
                    <div className="ig-likes">
                      {post.likes.toLocaleString()} likes
                    </div>

                    {/* Comments Section */}
                    {activePostId === post.id && (
                      <div className="ig-comments-section">
                        <div className="ig-comments-list">
                          {post.commentsList?.map((comment) => (
                            <div key={comment.id} className="ig-comment">
                              <div className="ig-comment-avatar">
                                {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="ig-comment-content">
                                <div className="ig-comment-header">
                                  <span className="ig-comment-username">{comment.user?.username || 'Anonymous'}</span>
                                  {comment.user?.verified && <BadgeCheck size={10} className="ig-verified-small" />}
                                  <span className="ig-comment-time">{formatTimestamp(comment.timestamp)}</span>
                                </div>
                                <p className="ig-comment-text">{comment.content}</p>
                                <div className="ig-comment-actions">
                                  <button 
                                    onClick={() => handleLikeComment(post.id, comment.id)}
                                    className={`ig-comment-action ${comment.liked ? 'liked' : ''}`}
                                  >
                                    Like
                                  </button>
                                  <button 
                                    onClick={() => setActiveCommentId(activeCommentId === comment.id ? null : comment.id)}
                                    className="ig-comment-action"
                                  >
                                    Reply
                                  </button>
                                  {comment.likes > 0 && (
                                    <span className="ig-comment-likes">{comment.likes} likes</span>
                                  )}
                                </div>

                                {/* Replies */}
                                {comment.replies?.map((reply) => (
                                  <div key={reply.id} className="ig-reply">
                                    <div className="ig-reply-avatar">
                                      {reply.user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="ig-reply-content">
                                      <div className="ig-reply-header">
                                        <span className="ig-reply-username">{reply.user?.username || 'Anonymous'}</span>
                                        <span className="ig-reply-time">{formatTimestamp(reply.timestamp)}</span>
                                      </div>
                                      <p className="ig-reply-text">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Reply Input */}
                                {activeCommentId === comment.id && (
                                  <div className="ig-reply-input">
                                    <input
                                      type="text"
                                      value={newReply[comment.id] || ''}
                                      onChange={(e) => setNewReply(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                      placeholder={`Reply to @${comment.user?.username}...`}
                                      autoFocus
                                    />
                                    <button onClick={() => handleAddReply(post.id, comment.id)}>Post</button>
                                  </div>
                                )}
                              </div>
                              {isAdmin && (
                                <button onClick={() => handleSoftDeleteComment(post.id, comment.id)} className="ig-delete-comment" title="Delete Comment">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Comment */}
                        <div className="ig-add-comment">
                          <div className="ig-comment-avatar-small">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                          />
                          <button 
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment.trim()}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="ig-empty">
              <MessageSquare size={48} />
              <h3>{activeTab === 'all' ? 'No posts yet' : 'Trash is empty'}</h3>
              <p>{activeTab === 'all' ? 'Be the first to share something!' : 'No posts in trash'}</p>
              {activeTab === 'all' && (
                <button className="create-first-post" onClick={() => setShowNewPostModal(true)}>
                  <Plus size={16} /> Create First Post
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <div className="ig-modal-overlay" onClick={() => setShowNewPostModal(false)}>
            <div className="ig-modal" onClick={(e) => e.stopPropagation()}>
              <div className="ig-modal-header">
                <h3>Create new post</h3>
                <button onClick={() => setShowNewPostModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="ig-modal-body">
                <textarea
                  placeholder="What's on your mind? Share your thoughts, questions, or experiences..."
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
              </div>
              <div className="ig-modal-footer">
                <button onClick={() => setShowNewPostModal(false)}>Cancel</button>
                <button 
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  style={{ opacity: !newPostContent.trim() ? 0.5 : 1 }}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}