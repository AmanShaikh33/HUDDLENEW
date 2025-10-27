import { Post } from "../models/postModel.js";
import { Notification } from "../models/Notification.js";
import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenrator.js";
import cloudinary from "cloudinary";

// ======================== CREATE POST ========================
export const newPost = TryCatch(async (req, res) => {
  const { caption } = req.body;
  if (!caption && !req.file)
    return res.status(400).json({ message: "Caption or file is required" });

  const ownerId = req.user._id;

  // Extract hashtags from caption
  const hashtags = caption ? caption.match(/#\w+/g)?.map(tag => tag.toLowerCase()) : [];

  const file = req.file;
  let filesArray = [];

  if (file) {
    const fileUrl = getDataUrl(file);

    const option = req.query.type === "reel" ? { resource_type: "video" } : {};

    const uploaded = await cloudinary.v2.uploader.upload(fileUrl.content, option);

    filesArray.push({
      id: uploaded.public_id,
      url: uploaded.secure_url,
      type: req.query.type === "reel" ? "video" : "image",
    });
  }

  const post = await Post.create({
    caption,
    hashtags,
    files: filesArray,
    owner: ownerId,
    type: req.query.type || "post",
  });

  res.status(201).json({
    message: "Post created successfully",
    post,
  });
});

// ======================== DELETE POST ========================
export const deletePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized" });

  // Delete files from cloudinary
  for (let file of post.files) {
    await cloudinary.v2.uploader.destroy(file.id, { resource_type: file.type === "video" ? "video" : "image" });
  }

  await post.deleteOne();

  res.json({ message: "Post deleted" });
});

// ======================== GET ALL POSTS (with pagination) ========================
export const getAllPosts = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const typeFilter = req.query.type ? { type: req.query.type } : {};

  const posts = await Post.find({ ...typeFilter, isDeleted: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("owner", "-password")
    .populate({ path: "comments.user", select: "-password" });

  const total = await Post.countDocuments({ ...typeFilter, isDeleted: false });

  res.json({
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

// ======================== LIKE / UNLIKE POST ========================
export const likeUnlikePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  const userId = req.user._id;

  if (post.likes.includes(userId)) {
    // Unlike
    post.likes.pull(userId);
    await post.save();
    return res.json({ message: "Post unliked" });
  }

  // Like
  post.likes.push(userId);
  await post.save();

  // ✅ Create notification if user likes someone else's post
  if (post.owner.toString() !== userId.toString()) {
    await Notification.create({
      recipient: post.owner,
      sender: userId,
      type: "like",
      post: post._id,
    });
  }

  res.json({ message: "Post liked" });
});


// ======================== ADD COMMENT ========================
// controllers/postControllers.js
// ✅ FIXED CONTROLLER
export const commentOnPost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments.user", "-password");
  if (!post) return res.status(404).json({ message: "No post found" });

  const { comment } = req.body;
  if (!comment) return res.status(400).json({ message: "Comment cannot be empty" });

  const newComment = {
    user: req.user._id,
    name: req.user.name,
    comment,
  };

  post.comments.push(newComment);
  await post.save();

  // ✅ Create notification only if user comments on someone else's post
  if (String(post.owner) !== String(req.user._id)) {
    await Notification.create({
      sender: req.user._id,
      recipient: post.owner, // ✅ fixed field
      message: `${req.user.username} commented on your post`,
      type: "comment",
      post: post._id, // ✅ matches schema ('post', not 'postId')
    });
  }

  await post.populate({ path: "comments.user", select: "-password" });
  res.json({ message: "Comment added", comments: post.comments });
});





// ======================== DELETE COMMENT ========================
export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  const { commentId } = req.query;
  if (!commentId) return res.status(400).json({ message: "Comment ID required" });

  const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
  if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });

  const comment = post.comments[commentIndex];

  // Only post owner or comment owner can delete
  if (post.owner.toString() !== req.user._id.toString() &&
      comment.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized to delete this comment" });

  post.comments.splice(commentIndex, 1);
  await post.save();

  res.json({ message: "Comment deleted", comments: post.comments });
});

// ======================== EDIT CAPTION ========================
export const editCaption = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized" });

  const { caption } = req.body;
  if (!caption) return res.status(400).json({ message: "Caption cannot be empty" });

  post.caption = caption;
  post.hashtags = caption.match(/#\w+/g)?.map(tag => tag.toLowerCase()) || [];
  await post.save();

  res.json({ message: "Post updated", post });
});

// ======================== GET SINGLE POST ========================
// postControllers.js

// ======================== GET SINGLE POST ========================
export const getPost = TryCatch(async (req, res) => {
  // Ensure req.user is available from the isAuth middleware
  const loggedInUserId = req.user._id.toString(); 

  const post = await Post.findById(req.params.id)
    .populate("owner", "-password")
    .populate({ path: "comments.user", select: "-password" });

  if (!post) return res.status(404).json({ message: "No post found" });

  // 👈 THE FIX: Attach the logged-in user's ID to the response object
  // We spread the post object and add the new property
  const postWithCurrentUser = {
    ...post.toObject(), // Convert mongoose document to plain object
    currentUserId: loggedInUserId,
  };

  // Send the modified post object
  res.json({ post: postWithCurrentUser }); 
});

// NOTE: You should also check if your getAllPosts needs a similar fix if you render
// the HuddlePostCard component in a list, as it might be using data from there initially.
