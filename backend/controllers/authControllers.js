import { User } from "../models/userModel.js";
import TryCatch from "../utils/Trycatch.js";
import generateToken from "../utils/generateToken.js";
import getDataUrl from "../utils/urlGenrator.js";
import bcrypt from "bcryptjs";
import cloudinary from "cloudinary";

// ---------------- REGISTER USER ----------------
export const registerUser = TryCatch(async (req, res) => {
  const { email, password, gender, username } = req.body;

  if (!email || !password || !gender || !username) {
    return res.status(400).json({ message: "Please provide all required values" });
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) return res.status(400).json({ message: "Email already exists" });

  const existingUsername = await User.findOne({ username });
  if (existingUsername) return res.status(400).json({ message: "Username already exists" });

  // ✅ Use default profile pic (no upload yet)
  const myCloud = {
    public_id: "default_profile",
    secure_url: "https://res.cloudinary.com/demo/image/upload/v1699999999/default-profile.png",
  };

  // Hash password
  const hashPassword = await bcrypt.hash(password, 10);

  // Create new user
  const user = await User.create({
    name: username, // using username as name placeholder
    email,
    password: hashPassword,
    gender,
    username,
    bio: "",
    profilePic: {
      id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    lastLogin: Date.now(),
  });

  generateToken(user._id, res);

  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});


// ---------------- LOGIN USER ----------------
export const loginUser = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.status(400).json({
      message: "Invalid Credentials",
    });

  const comparePassword = await bcrypt.compare(password, user.password);

  if (!comparePassword)
    return res.status(400).json({
      message: "Invalid Credentials",
    });

  generateToken(user._id, res);

  res.json({
    message: "User Logged in",
    user,
  });
});




// ---------------- LOGOUT USER ----------------
export const logoutUser = TryCatch((req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.json({ message: "Logged out successfully" });
});
