const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deadline: { type: Date },
  payment: { type: Number },
  fulfilled: { type: Boolean, default: false },
  interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], 
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Request", requestSchema);

