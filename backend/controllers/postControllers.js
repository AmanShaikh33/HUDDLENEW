import { Post } from "../models/postModel.js";
import { Notification } from "../models/Notification.js";
import TryCatch from "../utils/Trycatch.js";
import getDataUrl from "../utils/urlGenrator.js";
import cloudinary from "cloudinary";


export const newPost = TryCatch(async (req, res) => {
  const { caption } = req.body;
  if (!caption && !req.file)
    return res.status(400).json({ message: "Caption or file is required" });

  const ownerId = req.user._id;


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


export const deletePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  if (post.owner.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized" });

 
  for (let file of post.files) {
    await cloudinary.v2.uploader.destroy(file.id, { resource_type: file.type === "video" ? "video" : "image" });
  }

  await post.deleteOne();

  res.json({ message: "Post deleted" });
});


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


export const likeUnlikePost = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  const userId = req.user._id;

  if (post.likes.includes(userId)) {
    
    post.likes.pull(userId);
    await post.save();
    return res.json({ message: "Post unliked" });
  }


  post.likes.push(userId);
  await post.save();

  
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

 
  if (String(post.owner) !== String(req.user._id)) {
    await Notification.create({
      sender: req.user._id,
      recipient: post.owner,
      message: `${req.user.username} commented on your post`,
      type: "comment",
      post: post._id, 
    });
  }

  await post.populate({ path: "comments.user", select: "-password" });
  res.json({ message: "Comment added", comments: post.comments });
});






export const deleteComment = TryCatch(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "No post found" });

  const { commentId } = req.query;
  if (!commentId) return res.status(400).json({ message: "Comment ID required" });

  const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
  if (commentIndex === -1) return res.status(404).json({ message: "Comment not found" });

  const comment = post.comments[commentIndex];

  if (post.owner.toString() !== req.user._id.toString() &&
      comment.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: "Unauthorized to delete this comment" });

  post.comments.splice(commentIndex, 1);
  await post.save();

  res.json({ message: "Comment deleted", comments: post.comments });
});

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


export const getPost = TryCatch(async (req, res) => {
 
  const loggedInUserId = req.user._id.toString(); 

  const post = await Post.findById(req.params.id)
    .populate("owner", "-password")
    .populate({ path: "comments.user", select: "-password" });

  if (!post) return res.status(404).json({ message: "No post found" });

  
  const postWithCurrentUser = {
    ...post.toObject(), 
    currentUserId: loggedInUserId,
  };

 
  res.json({ post: postWithCurrentUser }); 
});

