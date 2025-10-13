import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:7000/api", // adjust if your backend runs elsewhere
  withCredentials: true, // allows sending cookies for JWT
});

// ---------------- AUTH ROUTES ----------------

// Register user
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

// Login user
export const loginUser = async (credentials) => {
  try {
    const res = await API.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const res = await API.get("/auth/logout");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};

// ---------------- POST ROUTES ----------------

// Create a new post
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

// Get all posts and reels
export const getAllPosts = async () => {
  try {
    const res = await API.get("/post/all");
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch posts" };
  }
};

// Edit a post caption
export const editPostCaption = async (postId, caption) => {
  try {
    const res = await API.put(`/post/${postId}`, { caption });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to edit post" };
  }
};

// Delete a post
export const deletePost = async (postId) => {
  try {
    const res = await API.delete(`/post/${postId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete post" };
  }
};

// Like/Unlike a post
export const likeUnlikePost = async (postId) => {
  try {
    const res = await API.post(`/post/like/${postId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to like/unlike post" };
  }
};

// Comment on a post
export const commentOnPost = async (postId, comment) => {
  try {
    const res = await API.post(`/post/comment/${postId}`, { comment });
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add comment" };
  }
};

// Delete a comment
export const deleteComment = async (postId, commentId) => {
  try {
    const res = await API.delete(`/post/comment/${postId}?commentId=${commentId}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete comment" };
  }
};

export default API;
