const express = require("express");
const router = express.Router();
const LostFound = require("../models/LostFound");
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

router.post("/", auth, upload.array("images", 1), async (req, res) => {
  try {
    const { title, description, kind, place, contactNumber } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!place) return res.status(400).json({ error: "Location is required" });
    if (!["Lost", "Found"].includes(kind)) {
      return res.status(400).json({ error: "kind must be 'Lost' or 'Found'" });
    }
    if (kind === "Found" && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ error: "A photo is required when marking an item as found" });
    }

    const images = req.files?.map(
      file => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`
    ) || [];

    const item = new LostFound({
      title,
      description,
      kind,
      place,
      contactNumber,
      images,
      postedBy: req.userId
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const items = await LostFound.find().populate("postedBy", "name email contactNumber");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:itemId/interest", auth, async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (!item.interestedUsers.includes(req.userId)) {
      item.interestedUsers.push(req.userId);
      await item.save();
    }
    res.json({ message: "Interest shown successfully", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-posts", auth, async (req, res) => {
  try {
    const myItems = await LostFound.find({ postedBy: req.userId });
    res.json(myItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-interests", auth, async (req, res) => {
  try {
    const items = await LostFound.find({ interestedUsers: req.userId })
      .populate("postedBy", "name email contactNumber");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/interests-in-my-posts", auth, async (req, res) => {
  try {
    const myItems = await LostFound.find({ postedBy: req.userId })
      .populate("interestedUsers", "name email contactNumber");

    const result = myItems.flatMap(item =>
      item.interestedUsers.map(user => ({
        user,
        post: item
      }))
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
