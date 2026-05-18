const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const request = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    
    // Ensure consistent response format
    return {
      success: true,
      ...data,
      data: data.data || data,
      message: data.message || 'Success'
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      message: error.message,
      error: error.message,
      data: null
    };
  }
};

const authHeader = (token) => {
  if (!token) {
    return {};
  }
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const api = {
  // ============================================
  // AUTH
  // ============================================
  
  login: (email, password) => 
    request('/auth/login', { 
      method: 'POST', 
      body: JSON.stringify({ username: email, password }) 
    }),
  
  getMe: (token) => 
    request('/auth/me', { headers: authHeader(token) }),
  
  // ============================================
  // UNIVERSITIES
  // ============================================
  
  getUniversities: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/universities${queryString ? `?${queryString}` : ''}`);
  },
  
  getAdminUniversities: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/admin/universities${queryString ? `?${queryString}` : ''}`, { 
      headers: authHeader(token) 
    });
  },
  
  getUniversity: (id) => request(`/universities/${id}`),

  getDropdownOptions: () => request('/universities/filters/options'),
  
  createUniversity: (data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request('/universities', { 
      method: 'POST', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  updateUniversity: (id, data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request(`/universities/${id}`, { 
      method: 'PUT', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  getTrashedUniversities: (token) => 
    request('/universities/trashed', { headers: authHeader(token) }),
  
  softDeleteUniversity: (id, token) => 
    request(`/universities/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreUniversity: (id, token) => 
    request(`/universities/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteUniversity: (id, token) => 
    request(`/universities/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),
  
  // ============================================
  // REVIEWS
  // ============================================
  
  getReviews: (token) => request('/reviews', { headers: authHeader(token) }),
  
  getReviewById: (id, token) => request(`/reviews/${id}`, { headers: authHeader(token) }),
  
  getAllReviews: () => request('/reviews/all'),
  
  createReview: (data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request('/reviews', { 
      method: 'POST', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  getAdminAllReviews: (token) => 
    request('/reviews', { headers: authHeader(token) }),
  
  getTrashedReviews: (token) => 
    request('/reviews/trashed', { headers: authHeader(token) }),
  
  softDeleteReview: (id, token) => 
    request(`/reviews/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreReview: (id, token) => 
    request(`/reviews/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteReview: (id, token) => 
    request(`/reviews/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),
  
  updateReview: (id, data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request(`/reviews/${id}`, { 
      method: 'PUT', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  deleteReview: (id, token) => 
    request(`/reviews/${id}`, { method: 'DELETE', headers: authHeader(token) }),

  // ============================================
  // USERS (Admin)
  // ============================================
  
  getAdminUsers: (token) => request('/admin/users', { headers: authHeader(token) }),
  
  getTrashedUsers: (token) => 
    request('/admin/users/trashed', { headers: authHeader(token) }),
  
  getUserById: (id, token) => 
    request(`/admin/users/${id}`, { headers: authHeader(token) }),
  
  updateUser: (id, data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request(`/admin/users/${id}`, { 
      method: 'PUT', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  softDeleteUser: (id, token) => 
    request(`/admin/users/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreUser: (id, token) => 
    request(`/admin/users/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteUser: (id, token) => 
    request(`/admin/users/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),
  
  deleteUser: (id, token) => 
    request(`/admin/users/${id}`, { method: 'DELETE', headers: authHeader(token) }),

  // ============================================
  // Admin Stats
  // ============================================
  
  getAdminStats: (token) => request('/admin/stats', { headers: authHeader(token) }),

  // ============================================
  // Community - Discussions
  // ============================================
  
  getDiscussions: () => request('/community/discussions'),
  
  getDiscussionById: (id) => request(`/community/discussions/${id}`),
  
  createDiscussion: (data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request('/community/discussions', { 
      method: 'POST', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  addComment: (id, content, token) => 
    request(`/community/discussions/${id}/comments`, { 
      method: 'POST', 
      headers: authHeader(token), 
      body: JSON.stringify({ content }) 
    }),

  getTrashedDiscussions: (token) => 
    request('/community/discussions/trashed', { headers: authHeader(token) }),
  
  softDeleteDiscussion: (id, token) => 
    request(`/community/discussions/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreDiscussion: (id, token) => 
    request(`/community/discussions/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteDiscussion: (id, token) => 
    request(`/community/discussions/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),
  
  updateDiscussion: (id, data, token) => {
    // Only send fields that have values
    const submitData = Object.keys(data).reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
        acc[key] = data[key];
      }
      return acc;
    }, {});
    
    return request(`/community/discussions/${id}`, { 
      method: 'PUT', 
      headers: authHeader(token), 
      body: JSON.stringify(submitData) 
    });
  },
  
  deleteDiscussion: (id, token) => 
    request(`/community/discussions/${id}`, { method: 'DELETE', headers: authHeader(token) }),

  // ============================================
  // Community - Comments
  // ============================================
  
  getTrashedComments: (token) => 
    request('/community/comments/trashed', { headers: authHeader(token) }),
  
  softDeleteComment: (id, token) => 
    request(`/community/comments/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreComment: (id, token) => 
    request(`/community/comments/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteComment: (id, token) => 
    request(`/community/comments/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),

  // ============================================
  // Community - Mentors
  // ============================================
  
  getMentors: () => request('/community/mentors'),
  
  getTrashedMentors: (token) => 
    request('/community/mentors/trashed', { headers: authHeader(token) }),
  
  softDeleteMentor: (id, token) => 
    request(`/community/mentors/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreMentor: (id, token) => 
    request(`/community/mentors/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteMentor: (id, token) => 
    request(`/community/mentors/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),

  // ============================================
  // Community - Events
  // ============================================
  
  getEvents: () => request('/community/events'),
  
  getTrashedEvents: (token) => 
    request('/community/events/trashed', { headers: authHeader(token) }),
  
  softDeleteEvent: (id, token) => 
    request(`/community/events/${id}/soft-delete`, { method: 'PATCH', headers: authHeader(token) }),
  
  restoreEvent: (id, token) => 
    request(`/community/events/${id}/restore`, { method: 'PATCH', headers: authHeader(token) }),
  
  permanentDeleteEvent: (id, token) => 
    request(`/community/events/${id}/permanent`, { method: 'DELETE', headers: authHeader(token) }),
};

// Export individual functions for convenience
export const {
  login,
  getMe,
  getUniversities,
  getAdminUniversities,
  getUniversity,
  getDropdownOptions,
  createUniversity,
  updateUniversity,
  getTrashedUniversities,
  softDeleteUniversity,
  restoreUniversity,
  permanentDeleteUniversity,
  getAdminUsers,
  getAdminStats,
  getReviews,
  getTrashedReviews,
  softDeleteReview,
  restoreReview,
  permanentDeleteReview,
  updateReview,
  deleteReview,
  getTrashedUsers,
  getUserById,
  updateUser,
  softDeleteUser,
  restoreUser,
  permanentDeleteUser,
  deleteUser,
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  addComment,
  getTrashedDiscussions,
  softDeleteDiscussion,
  restoreDiscussion,
  permanentDeleteDiscussion,
  updateDiscussion,
  deleteDiscussion,
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
} = api;

export default api;