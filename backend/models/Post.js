const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  price: { type: Number },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contactNumber: { type: String },
  images: [{ type: String }],
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
