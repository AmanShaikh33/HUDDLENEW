// models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

// TTL index to auto-delete expired notes
noteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Note = mongoose.model("Note", noteSchema);
