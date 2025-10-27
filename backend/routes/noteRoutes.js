// routes/noteRoutes.js
import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { Note } from "../models/Note.js";

const router = express.Router();

// Create a note
router.post("/", isAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const note = new Note({
      user: req.user._id,
      content,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h expiry
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Fetch all active notes
router.get("/", isAuth, async (req, res) => {
  try {
    const notes = await Note.find({ expiresAt: { $gt: new Date() } })
      .populate("user", "name username profilePic")
      .sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /notes/:id
router.delete("/:id", isAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // Only allow owner to delete
    if (note.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    // Use deleteOne instead of remove()
    await note.deleteOne();

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
