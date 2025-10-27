import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // backend base URL
  withCredentials: true, // allows sending cookies for JWT
});

// ---------------- AUTH ROUTES ----------------
export const registerUser = async (formData) => {
  try {
    const res = await API.post("/auth/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials, {
      withCredentials: true, // 🔥 cookie-based JWT fix
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

export const logoutUser = async () => {
  try {
    const res = await API.get("/auth/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};

// ---------------- POST ROUTES ----------------
export const createPost = async (formData, type = "post") => {
  try {
    const res = await API.post(`/post/new?type=${type}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create post" };
  }
};

export const getAllPosts = async () => {
  try {
    const res = await API.get("/post/all");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch posts" };
  }
};

export const editPostCaption = async (postId, caption) => {
  try {
    const res = await API.put(`/post/${postId}`, { caption });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to edit post" };
  }
};

export const deletePost = async (postId) => {
  try {
    const res = await API.delete(`/post/${postId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete post" };
  }
};

export const likeUnlikePost = async (postId) => {
  try {
    const res = await API.post(`/post/like/${postId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to like/unlike post" };
  }
};

export const commentOnPost = async (postId, comment) => {
  try {
    const res = await API.post(`/post/${postId}/comment`, { comment });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add comment" };
  }
};

export const deleteComment = async (postId, commentId) => {
  try {
    const res = await API.delete(`/post/comment/${postId}?commentId=${commentId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete comment" };
  }
};

// ---------------- USER ROUTES ----------------

// Get logged-in user profile
export const getMyProfile = async () => {
  try {
    const { data } = await API.get("/user/me");
    return data; // Return full user data
  } catch (error) {
    console.error("getMyProfile error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

// Get another user's profile
export const getUserProfile = async (userId) => {
  try {
    const res = await API.get(`/user/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user profile" };
  }
};

// Follow / Unfollow user
export const followUnfollowUser = async (userId) => {
  try {
    const res = await API.post(`/user/follow/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to follow/unfollow" };
  }
};

// Get followers / followings with pagination
export const getFollowersOrFollowings = async (userId, type, page = 1, limit = 20) => {
  try {
    const res = await API.get(`/user/connections/${userId}`, {
      params: { type, page, limit },
    });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch list" };
  }
};

// Update logged-in user's profile
// api.js
export const updateProfile = async (formData, userId) => {
  if (!userId) throw new Error("User ID is required for updating profile");

  const res = await API.put(`/user/update-profile/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


// Update logged-in user's password
export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const res = await API.post("/user/update-password", { oldPassword, newPassword });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update password" };
  }
};

// Get a single post by ID
export const getPostById = async (postId) => {
  try {
    const res = await API.get(`/post/${postId}`);
    return res.data.post;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch post" };
  }
};

// 🔍 Search users
export const searchUsers = async (query) => {
  try {
    const res = await API.get(`/user/all?search=${encodeURIComponent(query)}`);
    return res.data; // returns an array of matched users
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

// ---------------- NOTIFICATION ROUTES ----------------

// Fetch all notifications for logged-in user
export const getNotifications = async () => {
  try {
    const res = await API.get("/notifications");
    return res.data.notifications; // array of notifications
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notifications" };
  }
};

// Mark all notifications as read
export const markNotificationsRead = async () => {
  try {
    const res = await API.put("/notifications/mark-read");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark notifications read" };
  }
};

// Clear (delete) all notifications
export const clearNotifications = async () => {
  try {
    const res = await API.delete("/notifications/clear");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to clear notifications" };
  }
};

// ---------------- CHAT ROUTES ----------------
export const getAllUsers = async (search = "") => {
  try {
    const { data } = await API.get(`/user/all?search=${encodeURIComponent(search)}`);
    return Array.isArray(data) ? data : data.users || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};


// Send a message
// New: Fetch chat history with a user

// In api.js, use API instance with backend baseURL
export const getChatHistory = async (userId) => {
  try {
    const response = await API.get(`/messages/history/${userId}`);
    return response.data.messages || []; // always return array
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return []; // fallback to empty array
  }
};

// New: Send message via API (backup, real-time via Socket.IO)
// api.js
export const sendMessageAPI = async (receiverId, content) => {
  try {
    const response = await API.post("/messages/send", { receiverId, content });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
};

// New: Mark messages as read
export const markMessagesAsRead = async (userId) => {
  try {
    const response = await API.put(`/messages/read/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};

// Get unread counts
export const getUnreadCounts = async () => {
  try {
    const res = await API.get("/messages/unread-count");
    return res.data; // [{ userId, count }]
  } catch (err) {
    console.error("Failed to fetch unread counts:", err);
    return [];
  }
};

// ---------------- NOTE ROUTES ----------------

// Create a new note
export const createNote = async (content) => {
  try {
    const res = await API.post("/notes", { content });
    return res.data; // returns the created note
  } catch (error) {
    throw error.response?.data || { message: "Failed to create note" };
  }
};

// Fetch all active notes
export const getActiveNotes = async () => {
  try {
    const res = await API.get("/notes");
    return res.data; // returns array of notes with user info
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notes" };
  }
};

// Delete a note
// Delete a note
export const deleteNote = async (noteId) => {
  try {
    const res = await API.delete(`/notes/${noteId}`);
    return res.data; // { message: "Note deleted successfully" }
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete note" };
  }
};



export default API;
