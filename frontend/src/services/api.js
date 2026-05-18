const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ================= COMMON REQUEST =================
const request = async (endpoint, options = {}) => {
  try {
    console.log(`📡 ${options.method || "GET"} → ${endpoint}`);

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await res.json();

    // Handle 401 Unauthorized
    if (res.status === 401) {
      console.warn(`⚠️ 401 Unauthorized: ${endpoint}`);
      if (endpoint.includes('/reviews') || endpoint.includes('/universities')) {
        return { success: true, data: [] };
      }
      return { success: false, message: data.message || "Unauthorized", status: 401 };
    }

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return { success: false, error: error.message };
  }
};

// ================= AUTH HEADER =================
const authHeader = (token) => ({
  ...(token && { Authorization: `Bearer ${token}` }),
});

// ================= API =================
export const api = {

  // ================= AUTH =================
  register: (userData) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (username, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  getMe: (token) => {
    if (!token) {
      return Promise.resolve({ success: false, message: "No token provided" });
    }
    return request("/auth/me", {
      headers: authHeader(token),
    });
  },

  updateProfile: (profileData, token) =>
    request("/auth/profile", {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(profileData),
    }),

  // ================= OTP AUTHENTICATION =================
  sendOTP: (phone, name) =>
    request("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone, name }),
    }),

  verifyOTP: (phone, otp, name) =>
    request("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp, name }),
    }),

  resendOTP: (phone) =>
    request("/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  // ================= USER PROFILE DETAILS =================
  updateUserProfile: (profileData, token) =>
    request("/auth/profile", {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(profileData),
    }),

  getUserProfile: (token) =>
    request("/auth/me", {
      headers: authHeader(token),
    }),

  // ================= UNIVERSITIES =================

  getFilteredUniversities: async (filters = {}) => {
    try {
      const queryParams = {
        page: filters.page || 1,
        limit: filters.limit || 1000,
        ...filters
      };
      
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const query = new URLSearchParams(queryParams).toString();
      const endpoint = `/universities${query ? `?${query}` : ""}`;
      
      console.log(`📡 GET → ${endpoint}`);
      
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }

      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Fetched ${data.data.length} filtered universities (Total: ${data.total || data.data.length})`);
        return { 
          success: true, 
          data: data.data, 
          total: data.total || data.data.length,
          pagination: data.pagination
        };
      }
      
      return { success: true, data: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 };
    } catch (error) {
      console.error("❌ Error fetching filtered universities:", error);
      return { success: false, error: error.message || "Unable to fetch universities.", data: [] };
    }
  },

  getFilterOptions: async () => {
    try {
      const res = await fetch(`${API_URL}/universities/filters/options`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: null, error: data?.message };
      }

      return data.data ? { success: true, data: data.data } : { success: true, data: data };
    } catch (error) {
      console.error("❌ Error fetching filter options:", error);
      return { success: false, error: error.message, data: null };
    }
  },

  getUniversities: async (params = {}) => {
    try {
      const safeParams = (params && typeof params === 'object') ? params : {};
      
      const queryParams = {
        page: safeParams.page || 1,
        limit: safeParams.limit || 1000,
        ...safeParams
      };
      
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === undefined || queryParams[key] === null || queryParams[key] === '') {
          delete queryParams[key];
        }
      });
      
      const query = new URLSearchParams(queryParams).toString();
      const endpoint = `/universities${query ? `?${query}` : ""}`;
      console.log(`📡 GET → ${endpoint}`);

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }

      if (data.data && Array.isArray(data.data)) {
        console.log(`✅ Fetched ${data.data.length} universities (Total: ${data.total || data.data.length})`);
        return { 
          success: true, 
          data: data.data, 
          total: data.total || data.data.length,
          pagination: data.pagination
        };
      }
      
      if (Array.isArray(data)) {
        console.log(`✅ Fetched ${data.length} universities`);
        return { success: true, data: data, total: data.length };
      }
      
      console.log(`✅ Fetched ${data.length || 0} universities`);
      return { success: true, data: Array.isArray(data) ? data : [], total: Array.isArray(data) ? data.length : 0 };
    } catch (error) {
      console.error("❌ Error fetching universities:", error);
      return { success: false, error: error.message || "Unable to fetch universities.", data: [] };
    }
  },

  getAllUniversities: async () => {
    try {
      console.log("📡 Fetching ALL universities...");
      
      let total = 1000;
      try {
        const countRes = await fetch(`${API_URL}/universities/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        if (countRes.ok) {
          const countData = await countRes.json();
          total = countData.total || countData.count || 1000;
          console.log(`📊 Total universities in DB: ${total}`);
        }
      } catch (err) {
        console.warn("Could not fetch count, using high limit");
      }
      
      const res = await fetch(`${API_URL}/universities?page=1&limit=${total}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }
      
      let universities = [];
      if (data.data && Array.isArray(data.data)) {
        universities = data.data;
      } else if (Array.isArray(data)) {
        universities = data;
      } else if (data.universities && Array.isArray(data.universities)) {
        universities = data.universities;
      }
      
      console.log(`✅ Successfully fetched ${universities.length} universities`);
      return { success: true, data: universities, total: universities.length };
    } catch (error) {
      console.error("❌ Error fetching all universities:", error);
      return { success: false, error: error.message || "Unable to fetch universities.", data: [] };
    }
  },

  getUniversity: async (id) => {
    try {
      console.log(`📡 GET → /universities/${id}`);
      const res = await fetch(`${API_URL}/universities/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null, error: data?.message };
      }

      return data.data ? data : { success: true, data: data };
    } catch (error) {
      console.error("❌ Error fetching university:", error);
      return { success: false, error: error.message || "Unable to fetch university.", data: null };
    }
  },

  createUniversity: async (data, token) => {
    try {
      console.log("📡 POST → /universities (Creating new university)");
      
      const res = await fetch(`${API_URL}/universities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(token),
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        console.error("❌ Create university failed:", responseData);
        return { success: false, message: responseData.message || "Failed to create university" };
      }
      
      console.log("✅ University created successfully!");
      return responseData;
    } catch (error) {
      console.error("❌ Create university error:", error);
      return { success: false, message: error.message || "Network error" };
    }
  },

  updateUniversity: async (id, data, token) => {
    try {
      console.log(`📡 PUT → /universities/${id} (Updating university)`);
      
      const res = await fetch(`${API_URL}/universities/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...authHeader(token),
        },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();
      
      if (!res.ok) {
        console.error("❌ Update university failed:", responseData);
        return { success: false, message: responseData.message || "Failed to update university" };
      }
      
      console.log("✅ University updated successfully!");
      return responseData;
    } catch (error) {
      console.error("❌ Update university error:", error);
      return { success: false, message: error.message || "Network error" };
    }
  },

  searchUniversities: async (query = '') => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('limit', 1000);
      const res = await fetch(`${API_URL}/universities/search?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }

      return data.data ? data : { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('❌ Error searching universities:', error);
      return { success: false, data: [], error: error.message || 'Unable to search universities.' };
    }
  },

  searchUniversitiesAdvanced: async (params = {}) => {
    try {
      const queryParams = {
        limit: 1000,
        ...params
      };
      const query = new URLSearchParams(queryParams).toString();
      const res = await fetch(`${API_URL}/universities/search/advanced?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }

      return data.data ? data : { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error('❌ Error searching universities advanced:', error);
      return { success: false, data: [], error: error.message || 'Unable to search universities.' };
    }
  },

  getTrendingUniversities: async () => {
    try {
      const res = await fetch(`${API_URL}/universities/trending?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], error: data?.message };
      }

      return data.data ? data : { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error("❌ Error fetching trending universities:", error);
      return { success: false, error: error.message || "Unable to fetch trending universities.", data: [] };
    }
  },

  // ================= UNIVERSITIES TRASH / SOFT DELETE =================
  getTrashedUniversities: (token) =>
    request("/universities/trashed", {
      headers: authHeader(token),
    }),

  softDeleteUniversity: (id, token) =>
    request(`/universities/${id}/soft-delete`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  restoreUniversity: (id, token) =>
    request(`/universities/${id}/restore`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  permanentDeleteUniversity: (id, token) =>
    request(`/universities/${id}/permanent`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // ================= REVIEWS =================
  getReviews: async (universityId) => {
    try {
      console.log(`📡 GET → /reviews/university/${universityId}`);
      const res = await fetch(`${API_URL}/reviews/university/${universityId}?limit=1000`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: [], error: data?.message || 'Failed to fetch reviews.' };
      }

      return data.data ? data : { success: true, data: Array.isArray(data) ? data : [] };
    } catch (error) {
      console.error("❌ Error fetching reviews:", error);
      return { success: false, data: [], error: error.message || 'Unable to fetch reviews.' };
    }
  },

  getReviewById: async (id) => {
    try {
      const res = await fetch(`${API_URL}/reviews/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, data: null };
      }
      return data;
    } catch (error) {
      console.error("❌ Error fetching review:", error);
      return { success: false, data: null };
    }
  },

  getAllReviews: () =>
    request("/reviews/all"),

  createReview: (data, token) =>
    request("/reviews", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  likeReview: (id, token) =>
    request(`/reviews/${id}/like`, {
      method: "PUT",
      headers: authHeader(token),
    }),

  getMyReviews: (token) =>
    request("/reviews/user/me", {
      headers: authHeader(token),
    }),

  // ================= REVIEWS TRASH / SOFT DELETE =================
  getAdminAllReviews: (token) =>
    request("/reviews", {
      headers: authHeader(token),
    }),

  getTrashedReviews: (token) =>
    request("/reviews/trashed", {
      headers: authHeader(token),
    }),

  softDeleteReview: (id, token) =>
    request(`/reviews/${id}/soft-delete`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  restoreReview: (id, token) =>
    request(`/reviews/${id}/restore`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  permanentDeleteReview: (id, token) =>
    request(`/reviews/${id}/permanent`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  updateReview: (id, data, token) =>
    request(`/reviews/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  deleteReview: (id, token) =>
    request(`/reviews/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // ================= ADMIN =================
  getAdminStats: (token) =>
    request("/admin/stats", {
      headers: authHeader(token),
    }),

  deleteUniversity: (id, token) =>
    request(`/universities/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // ================= ADMIN USERS MANAGEMENT =================
  getAdminUsers: (token) =>
    request("/admin/users", {
      headers: authHeader(token),
    }),

  getTrashedUsers: (token) =>
    request("/admin/users/trashed", {
      headers: authHeader(token),
    }),

  getUserById: (id, token) =>
    request(`/admin/users/${id}`, {
      headers: authHeader(token),
    }),

  updateUser: (id, data, token) =>
    request(`/admin/users/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  softDeleteUser: (id, token) =>
    request(`/admin/users/${id}/soft-delete`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  restoreUser: (id, token) =>
    request(`/admin/users/${id}/restore`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  permanentDeleteUser: (id, token) =>
    request(`/admin/users/${id}/permanent`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  deleteUser: (id, token) =>
    request(`/admin/users/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  // ================= COMMUNITY =================
  getDiscussions: () =>
    request("/community/discussions"),

  getDiscussionById: (id) =>
    request(`/community/discussions/${id}`),

  createDiscussion: (data, token) =>
    request("/community/discussions", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  addComment: (id, content, token) =>
    request(`/community/discussions/${id}/comments`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ content }),
    }),

  likeDiscussion: (id, token) =>
    request(`/community/discussions/${id}/like`, {
      method: "PUT",
      headers: authHeader(token),
    }),

  likeComment: (id, token) =>
    request(`/community/comments/${id}/like`, {
      method: "PUT",
      headers: authHeader(token),
    }),

  getTrashedDiscussions: (token) =>
    request("/community/discussions/trashed", {
      headers: authHeader(token),
    }),

  softDeleteDiscussion: (id, token) =>
    request(`/community/discussions/${id}/soft-delete`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  restoreDiscussion: (id, token) =>
    request(`/community/discussions/${id}/restore`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  permanentDeleteDiscussion: (id, token) =>
    request(`/community/discussions/${id}/permanent`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  updateDiscussion: (id, data, token) =>
    request(`/community/discussions/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    }),

  deleteDiscussion: (id, token) =>
    request(`/community/discussions/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  softDeleteComment: (id, token) =>
    request(`/community/comments/${id}/soft-delete`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  restoreComment: (id, token) =>
    request(`/community/comments/${id}/restore`, {
      method: "PATCH",
      headers: authHeader(token),
    }),

  permanentDeleteComment: (id, token) =>
    request(`/community/comments/${id}/permanent`, {
      method: "DELETE",
      headers: authHeader(token),
    }),

  getTrashedComments: (token) =>
    request("/community/comments/trashed", {
      headers: authHeader(token),
    }),

  // ================= COMPARE =================
  compareUniversities: (ids) =>
    request("/universities/compare", {
      method: "POST",
      body: JSON.stringify({ universityIds: ids }),
    }),

  // ================= HEALTH =================
  healthCheck: () => request("/health"),
};

// ================= EXPORTS =================
export const {
  register,
  login,
  getMe,
  updateProfile,
  sendOTP,
  verifyOTP,
  resendOTP,
  updateUserProfile,
  getUserProfile,
  getFilteredUniversities,
  getFilterOptions,
  getUniversities,
  getAllUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  getTrendingUniversities,
  searchUniversities,
  searchUniversitiesAdvanced,
  getReviews,
  getReviewById,
  getAllReviews,
  getAdminAllReviews,
  createReview,
  likeReview,
  getMyReviews,
  getTrashedReviews,
  softDeleteReview,
  restoreReview,
  permanentDeleteReview,
  updateReview,
  deleteReview,
  getAdminStats,
  deleteUniversity,
  getAdminUsers,
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
  likeDiscussion,
  likeComment,
  getTrashedDiscussions,
  softDeleteDiscussion,
  restoreDiscussion,
  permanentDeleteDiscussion,
  updateDiscussion,
  deleteDiscussion,
  softDeleteComment,
  restoreComment,
  permanentDeleteComment,
  getTrashedComments,
  compareUniversities,
  healthCheck,
} = api;