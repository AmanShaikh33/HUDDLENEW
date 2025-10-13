import TryCatch from "../utils/Trycatch.js";
import { User } from "../models/userModel.js";
import getDataUrl from "../utils/urlGenrator.js";
import cloudinary from "cloudinary";
import bcrypt from "bcrypt";

// ------------------- GET OWN PROFILE -------------------
export const myProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("followers", "name username profilePic")
    .populate("followings", "name username profilePic");

  res.json(user);
});

// ------------------- GET ANOTHER USER PROFILE -------------------
export const userProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "name username profilePic")
    .populate("followings", "name username profilePic");

  if (!user)
    return res.status(404).json({ message: "No user with this ID" });

  // Check if current user is following this user
  const isFollowing = user.followers.some(
    (follower) => follower._id.toString() === req.user._id.toString()
  );

  res.json({ ...user.toObject(), isFollowing });
});

// ------------------- FOLLOW / UNFOLLOW USER -------------------
export const followandUnfollowUser = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id);
  const loggedInUser = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ message: "No user with this ID" });
  if (user._id.toString() === loggedInUser._id.toString())
    return res.status(400).json({ message: "You can't follow yourself" });

  let action = "";
  let badgeUnlocked = false;

  if (user.followers.includes(loggedInUser._id)) {
    // Unfollow
    user.followers = user.followers.filter(
      (id) => id.toString() !== loggedInUser._id.toString()
    );
    loggedInUser.followings = loggedInUser.followings.filter(
      (id) => id.toString() !== user._id.toString()
    );
    action = "unfollowed";
  } else {
    // Follow
    user.followers.push(loggedInUser._id);
    loggedInUser.followings.push(user._id);
    action = "followed";

    // Badge logic after push
    const followerCount = user.followers.length;
    if (followerCount === 1 && !user.badges.oneFollower) {
      user.badges.oneFollower = true;
      badgeUnlocked = true;
    }
    if (followerCount === 5 && !user.badges.fiveFollowers) {
      user.badges.fiveFollowers = true;
      badgeUnlocked = true;
    }
  }

  await loggedInUser.save();
  await user.save();

  res.json({
    message: badgeUnlocked
      ? `User ${action}. Badge unlocked!`
      : `User ${action}`,
    followersCount: user.followers.length,
    followingsCount: user.followings.length,
    badges: user.badges,
  });
});

// ------------------- FOLLOWERS / FOLLOWINGS DATA -------------------
export const userFollowerandFollowingData = TryCatch(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("followers", "name username profilePic")
    .populate("followings", "name username profilePic");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({
    followers: user.followers,
    followings: user.followings,
    badges: user.badges,
    followersCount: user.followers.length,
    followingsCount: user.followings.length,
  });
});

// ------------------- UPDATE PROFILE -------------------
export const updateProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, username, bio } = req.body;
  const file = req.file; // profile pic
  const coverFile = req.body.coverFile; // optional cover photo

  // Update basic info
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;

  if (username && username !== user.username) {
    const existing = await User.findOne({ username });
    if (existing && existing._id.toString() !== user._id.toString())
      return res.status(400).json({ message: "Username already taken" });
    user.username = username;
  }

  // Profile picture
  if (file) {
    if (user.profilePic?.id) await cloudinary.v2.uploader.destroy(user.profilePic.id);
    const fileUrl = getDataUrl(file);
    const uploaded = await cloudinary.v2.uploader.upload(fileUrl.content);
    user.profilePic = { id: uploaded.public_id, url: uploaded.secure_url };
  }

  // Cover photo
  if (coverFile) {
    if (user.coverPhoto?.id) await cloudinary.v2.uploader.destroy(user.coverPhoto.id);
    const coverUrl = getDataUrl(coverFile);
    const uploadedCover = await cloudinary.v2.uploader.upload(coverUrl.content);
    user.coverPhoto = { id: uploadedCover.public_id, url: uploadedCover.secure_url };
  }

  await user.save();

  res.json({
    message: "Profile updated successfully",
    user,
  });
});

// ------------------- UPDATE PASSWORD -------------------
export const updatePassword = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, newPassword } = req.body;

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong old password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password updated successfully" });
});

export const getFollowersOrFollowings = TryCatch(async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query; // pagination
  const { id } = req.params;

  if (!["followers", "followings"].includes(type)) {
    return res.status(400).json({ message: "Invalid type. Must be 'followers' or 'followings'" });
  }

  const user = await User.findById(id).select("-password");

  if (!user) return res.status(404).json({ message: "User not found" });

  // Get the requested list
  const list = user[type];

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginatedList = list.slice(startIndex, startIndex + parseInt(limit));

  // Populate only relevant fields
  const users = await User.find({ _id: { $in: paginatedList } })
    .select("name username profilePic");

  res.json({
    users,
    total: list.length,
    page: parseInt(page),
    pages: Math.ceil(list.length / limit),
  });
});