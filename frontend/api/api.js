import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true, 
});


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
      withCredentials: true, 
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


export const getMyProfile = async () => {
  try {
    const { data } = await API.get("/user/me");
    return data; 
  } catch (error) {
    console.error("getMyProfile error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};


export const getUserProfile = async (userId) => {
  try {
    const res = await API.get(`/user/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch user profile" };
  }
};


export const followUnfollowUser = async (userId) => {
  try {
    const res = await API.post(`/user/follow/${userId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to follow/unfollow" };
  }
};


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


export const updateProfile = async (formData, userId) => {
  if (!userId) throw new Error("User ID is required for updating profile");

  const res = await API.put(`/user/update-profile/${userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


export const updatePassword = async (oldPassword, newPassword) => {
  try {
    const res = await API.post("/user/update-password", { oldPassword, newPassword });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update password" };
  }
};


export const getPostById = async (postId) => {
  try {
    const res = await API.get(`/post/${postId}`);
    return res.data.post;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch post" };
  }
};


export const searchUsers = async (query) => {
  try {
    const res = await API.get(`/user/all?search=${encodeURIComponent(query)}`);
    return res.data; 
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};


export const getNotifications = async () => {
  try {
    const res = await API.get("/notifications");
    return res.data.notifications; 
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notifications" };
  }
};

export const markNotificationsRead = async () => {
  try {
    const res = await API.put("/notifications/mark-read");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark notifications read" };
  }
};

export const clearNotifications = async () => {
  try {
    const res = await API.delete("/notifications/clear");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to clear notifications" };
  }
};


export const getAllUsers = async (search = "") => {
  try {
    const { data } = await API.get(`/user/all?search=${encodeURIComponent(search)}`);
    return Array.isArray(data) ? data : data.users || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};



export const getChatHistory = async (userId) => {
  try {
    const response = await API.get(`/messages/history/${userId}`);
    return response.data.messages || []; 
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return []; 
  }
};


export const sendMessageAPI = async (receiverId, content) => {
  try {
    const response = await API.post("/messages/send", { receiverId, content });
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    throw error;
  }
};


export const markMessagesAsRead = async (userId) => {
  try {
    const response = await API.put(`/messages/read/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
};


export const getUnreadCounts = async () => {
  try {
    const res = await API.get("/messages/unread-count");
    return res.data; 
  } catch (err) {
    console.error("Failed to fetch unread counts:", err);
    return [];
  }
};


export const createNote = async (content) => {
  try {
    const res = await API.post("/notes", { content });
    return res.data; 
  } catch (error) {
    throw error.response?.data || { message: "Failed to create note" };
  }
};

export const getActiveNotes = async () => {
  try {
    const res = await API.get("/notes");
    return res.data; 
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notes" };
  }
};


export const deleteNote = async (noteId) => {
  try {
    const res = await API.delete(`/notes/${noteId}`);
    return res.data; 
    
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete note" };
  }
};



export default API;
