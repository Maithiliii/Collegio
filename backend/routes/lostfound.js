const express = require("express");
const router = express.Router();
const LostFound = require("../models/LostFound");
const auth = require("../middleware/auth");
const multer = require("multer");

const upload = multer();

router.post("/", auth, upload.none(), async (req, res) => {
  try {
    const { title, description, kind, place, contactNumber } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });
    if (!["Lost", "Found"].includes(kind)) {
      return res.status(400).json({ error: "kind must be 'Lost' or 'Found'" });
    }

    const item = new LostFound({
      title,
      description,
      kind,
      place,
      contactNumber,
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
