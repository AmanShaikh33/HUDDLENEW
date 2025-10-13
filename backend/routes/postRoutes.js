import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  deleteComment,
  deletePost,
  editCaption,
  getAllPosts,
  likeUnlikePost,
  newPost,
  commentOnPost,
} from "../controllers/postControllers.js";
import uploadFile from "../middlewares/multer.js";

const router = express.Router();

router.post("/new", isAuth, uploadFile, newPost);

router.put("/:id", isAuth, editCaption);
router.delete("/:id", isAuth, deletePost);

router.get("/all", isAuth, getAllPosts);

router.post("/like/:id", isAuth, likeUnlikePost);


router.delete("/comment/:id", isAuth, deleteComment);
router.post("/:id/comment", commentOnPost);

export default router;
