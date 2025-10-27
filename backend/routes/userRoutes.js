import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  followandUnfollowUser,
  myProfile,
  updatePassword,
  updateProfile,
  userFollowerandFollowingData,
  userProfile,
  getFollowersOrFollowings
} from "../controllers/userControllers.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/:id", isAuth, userProfile);
router.post("/update-password/:id", isAuth, updatePassword);
router.put('/update-profile/:id', isAuth, uploadFile, updateProfile);
router.post("/follow/:id", isAuth, followandUnfollowUser);
router.get("/followdata/:id", isAuth, userFollowerandFollowingData);
router.get("/connections/:id", isAuth, getFollowersOrFollowings);

export default router;
