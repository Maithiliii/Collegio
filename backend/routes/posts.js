const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const { title, description, price, contactNumber } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const images = req.files?.map(
      file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    ) || [];

    const post = new Post({
      title,
      description,
      price,
      contactNumber,
      images,
      postedBy: req.userId
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("postedBy", "name email contactNumber");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:postId/interest", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.interestedUsers.includes(req.userId)) {
      post.interestedUsers.push(req.userId);
      await post.save();
    }
    res.json({ message: "Interest shown successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-posts", auth, async (req, res) => {
  try {
    const myPosts = await Post.find({ postedBy: req.userId });
    res.json(myPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-interests", auth, async (req, res) => {
  try {
    const posts = await Post.find({ interestedUsers: req.userId })
      .populate("postedBy", "name email contactNumber");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
