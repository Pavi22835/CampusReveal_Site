import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Users, Calendar, Search, 
  TrendingUp, Sparkles, Heart, Share2, 
  Plus, MessageCircle, Star, BadgeCheck,
  ArrowRight, Shield, Zap, Loader2, UserPlus, Clock,
  Award, BookOpen, Video, MapPin, Filter, ThumbsUp, ThumbsDown,
  Send, Image, Link as LinkIcon, Smile, MoreHorizontal, Flag,
  Trash2, Edit2, Check, X, Reply, Archive, RotateCcw, Pencil,
  Hash
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
  const [likingPost, setLikingPost] = useState(null);
  const [likingComment, setLikingComment] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.role === 'ADMIN' || user?.email === 'admin@campusreveal.com') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
    fetchPosts();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchTrashedPosts();
    }
  }, [isAdmin]);

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
            commentCount: discussion._count?.comments || 0,
            commentsList: [],
            timestamp: discussion.createdAt,
            liked: discussion.isLikedByUser || false,
            isTrashed: false,
            tags: discussion.tags || [],
            views: discussion.views || 0
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
          commentCount: discussion._count?.comments || 0,
          timestamp: discussion.createdAt,
          liked: false,
          isTrashed: true,
          trashedAt: discussion.trashedAt,
          tags: discussion.tags || [],
          views: discussion.views || 0
        }));
        setTrashedPosts(formattedTrashed);
      }
    } catch (error) {
      console.error('Error fetching trashed discussions:', error);
      setTrashedPosts([]);
    }
  };

  // Fetch comments for a specific post and update comment count
  const fetchComments = async (postId) => {
    try {
      const result = await api.getDiscussionById(postId);
      if (result.success && result.data) {
        const comments = result.data.comments || [];
        const formattedComments = comments.map(comment => ({
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
          liked: comment.isLikedByUser || false,
          replies: []
        }));
        
        console.log('Comment likes values:', formattedComments.map(c => ({ id: c.id, likes: c.likes })));
        
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                commentsList: formattedComments, 
                commentCount: comments.length 
              }
            : post
        ));
        
        setTrashedPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentCount: comments.length }
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
        title: '',
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
        
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, commentCount: (post.commentCount || 0) + 1 }
            : post
        ));
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

  // Like a post with API call
  const handleLikePost = async (postId) => {
    if (!token) {
      alert('Please login to like posts');
      return;
    }
    
    if (likingPost === postId) return;
    setLikingPost(postId);
    
    let previousLiked = false;
    let previousLikes = 0;
    try {
      const post = posts.find(p => p.id === postId);
      previousLiked = post?.liked || false;
      previousLikes = post?.likes || 0;
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: previousLiked ? previousLikes - 1 : previousLikes + 1, 
              liked: !previousLiked 
            }
          : post
      ));
      
      const result = await api.likeDiscussion(postId, token);
      
      if (result?.success) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post,
                likes: typeof result.likesCount === 'number' ? result.likesCount : (isLiked ? currentLikes - 1 : currentLikes + 1),
                liked: result.liked !== undefined ? result.liked : !isLiked
              }
            : post
        ));
      } else {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: isLiked ? currentLikes + 1 : currentLikes - 1, 
                liked: isLiked 
              }
            : post
        ));
        console.error('Failed to like post');
      }
    } catch (err) {
      console.error('Error liking post:', err);
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, likes: previousLikes, liked: previousLiked }
          : p
      ));
    } finally {
      setLikingPost(null);
    }
  };

  // Like a comment with API call
  const handleLikeComment = async (postId, commentId) => {
    if (!token) {
      alert('Please login to like comments');
      return;
    }
    
    if (likingComment === commentId) return;
    setLikingComment(commentId);
    
    let previousCommentLiked = false;
    let previousCommentLikes = 0;
    try {
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentsList: post.commentsList.map(comment => {
            if (comment.id !== commentId) return comment;
            previousCommentLiked = comment.liked || false;
            previousCommentLikes = comment.likes || 0;
            return {
              ...comment,
              likes: previousCommentLiked ? previousCommentLikes - 1 : previousCommentLikes + 1,
              liked: !previousCommentLiked
            };
          })
        };
      }));
      
      const result = await api.likeComment(commentId, token);
      
      if (result?.success) {
        setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          return {
            ...post,
            commentsList: post.commentsList.map(comment => {
              if (comment.id !== commentId) return comment;
              return {
                ...comment,
                likes: typeof result.likesCount === 'number' ? result.likesCount : (currentLiked ? currentLikes - 1 : currentLikes + 1),
                liked: result.liked !== undefined ? result.liked : !currentLiked
              };
            })
          };
        }));
      } else {
        setPosts(prev => prev.map(post => {
          if (post.id !== postId) return post;
          return {
            ...post,
            commentsList: post.commentsList.map(comment => {
              if (comment.id !== commentId) return comment;
              return {
                ...comment,
                likes: currentLiked ? currentLikes + 1 : currentLikes - 1,
                liked: currentLiked
              };
            })
          };
        }));
      }
    } catch (err) {
      console.error('Error liking comment:', err);
      setPosts(prev => prev.map(post => {
        if (post.id !== postId) return post;
        return {
          ...post,
          commentsList: post.commentsList.map(comment => {
            if (comment.id !== commentId) return comment;
            return {
              ...comment,
              likes: previousCommentLikes,
              liked: previousCommentLiked
            };
          })
        };
      }));
    } finally {
      setLikingComment(null);
    }
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
          const deletedPost = posts.find(p => p.id === postId);
          setPosts(prev => prev.filter(p => p.id !== postId));
          
          if (deletedPost) {
            setTrashedPosts(prev => [{
              ...deletedPost,
              isTrashed: true,
              trashedAt: new Date().toISOString()
            }, ...prev]);
          } else {
            await fetchTrashedPosts();
          }
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
          const restoredPost = trashedPosts.find(p => p.id === postId);
          setTrashedPosts(prev => prev.filter(p => p.id !== postId));
          
          if (restoredPost) {
            setPosts(prev => [{
              ...restoredPost,
              isTrashed: false,
              trashedAt: undefined
            }, ...prev]);
          } else {
            await fetchPosts();
          }
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
          setTrashedPosts(prev => prev.filter(p => p.id !== postId));
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
    if (window.confirm('Delete this comment?')) {
      try {
        const result = await api.deleteComment?.(commentId, token);
        if (result?.success) {
          setPosts(prev => prev.map(post => 
            post.id === postId 
              ? { 
                  ...post, 
                  commentsList: post.commentsList.filter(c => c.id !== commentId),
                  commentCount: Math.max(0, (post.commentCount || 0) - 1)
                }
              : post
          ));
        } else {
          alert('Failed to delete comment');
        }
      } catch (error) {
        console.error('Delete comment error:', error);
        alert('Error deleting comment');
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

  const currentList = activeTab === 'all' ? posts : trashedPosts;
  
  const filteredList = currentList.filter(post =>
    post.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format like count for display
  const formatLikeCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };

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
          <div className="ig-header-left">
            <h1>Community</h1>
            <span className="ig-post-count">{posts.length} posts</span>
          </div>
          <div className="ig-header-actions">
            <button className="create-post-btn" onClick={() => setShowNewPostModal(true)}>
              <Plus size={20} />
              <span className="create-post-text">Add New Post</span>
            </button>
          </div>
        </div>

        {/* FAB for Mobile */}
        <button className="ig-fab" onClick={() => setShowNewPostModal(true)}>
          <Pencil size={24} />
        </button>

        {/* Admin Tabs */}
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
          {searchQuery && (
            <button className="ig-search-clear" onClick={clearSearch}>
              <X size={14} />
            </button>
          )}
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

                {/* Post Content */}
                <div className="ig-post-content">
                  <p>{post.content}</p>
                </div>

                {/* Post Actions */}
                {!post.isTrashed && (
                  <>
                    <div className="ig-post-actions">
                      <button 
                        onClick={() => handleLikePost(post.id)} 
                        className={`ig-action ${post.liked ? 'liked' : ''}`}
                        disabled={likingPost === post.id}
                      >
                        <Heart size={22} fill={post.liked ? '#ed4956' : 'none'} />
                        <span className="ig-action-count">
                          {post.likes > 0 && formatLikeCount(post.likes)}
                        </span>
                      </button>
                      <button onClick={() => toggleComments(post.id)} className="ig-action">
                        <MessageCircle size={22} />
                        <span className="ig-action-count">
                          {post.commentCount > 0 && formatLikeCount(post.commentCount)}
                        </span>
                      </button>
                    </div>

                    {/* Post Likes Count */}
                    {post.likes > 0 && (
                      <div className="ig-likes">
                        ❤️ {formatLikeCount(post.likes)} {post.likes === 1 ? 'like' : 'likes'}
                      </div>
                    )}

                    {/* Comments Count Link */}
                    {post.commentCount > 0 && (
                      <div className="ig-comments-count" onClick={() => toggleComments(post.id)}>
                        View all {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                      </div>
                    )}

                    {/* Comments Section */}
                    {activePostId === post.id && (
                      <div className="ig-comments-section">
                        <div className="ig-comments-list">
                          {post.commentsList?.length > 0 ? (
                            post.commentsList.map((comment) => (
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
                                  
                                  {/* Comment Actions */}
                                  <div className="ig-comment-actions">
                                    <button 
                                      onClick={() => handleLikeComment(post.id, comment.id)}
                                      className={`ig-comment-action ${comment.liked ? 'liked' : ''}`}
                                      disabled={likingComment === comment.id}
                                    >
                                      {comment.liked ? 'Liked' : 'Like'}
                                    </button>
                                    <button 
                                      onClick={() => setActiveCommentId(activeCommentId === comment.id ? null : comment.id)}
                                      className="ig-comment-action"
                                    >
                                      Reply
                                    </button>
                                  </div>
                                  
                                  {/* COMMENT LIKES COUNT - Shows total likes with heart icon */}
                                  {comment.likes > 0 && (
                                    <div className="ig-comment-likes-count">
                                      ❤️ {formatLikeCount(comment.likes)} {comment.likes === 1 ? 'like' : 'likes'}
                                    </div>
                                  )}

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
                            ))
                          ) : (
                            <div className="ig-no-comments">
                              <p>No comments yet. Be the first to comment!</p>
                            </div>
                          )}
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
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
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
            <motion.div 
              className="ig-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ig-modal-header">
                <h3>Create new post</h3>
                <button onClick={() => setShowNewPostModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="ig-modal-body">
                <textarea
                  placeholder="What's on your mind? Share your thoughts, questions, or experiences..."
                  rows={6}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  autoFocus
                />
                <div className="ig-post-tags">
                  <span className="ig-tag-hint">
                    <Hash size={12} /> Use #hashtags to make your post discoverable
                  </span>
                </div>
              </div>
              <div className="ig-modal-footer">
                <button className="cancel-btn" onClick={() => setShowNewPostModal(false)}>Cancel</button>
                <button 
                  className="share-btn"
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                >
                  <Send size={16} />
                  Share Post
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}