const mongoose = require("mongoose");

const lostFoundSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  kind: { type: String, enum: ["Lost", "Found"], required: true },
  place: { type: String },
  contactNumber: { type: String },
  images: [{ type: String }],
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LostFound", lostFoundSchema);
