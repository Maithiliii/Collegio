const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const auth = require("../middleware/auth");
const multer = require("multer");

const upload = multer();

router.post("/", auth, upload.none(), async (req, res) => {
  try {
    const { title, description, contactNumber, deadline, payment } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const request = new Request({
      title,
      description,
      contactNumber,
      deadline: deadline ? new Date(deadline) : undefined,
      payment: payment ? Number(payment) : undefined,
      requestedBy: req.userId
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().populate("requestedBy", "name email contactNumber");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:requestId/interest", auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (!request.interestedUsers.includes(req.userId)) {
      request.interestedUsers.push(req.userId);
      await request.save();
    }
    res.json({ message: "Interest shown successfully", request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-posts", auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ requestedBy: req.userId });
    res.json(myRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/my-interests", auth, async (req, res) => {
  try {
    const requests = await Request.find({ interestedUsers: req.userId })
      .populate("requestedBy", "name email contactNumber");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/interests-in-my-posts", auth, async (req, res) => {
  try {
    const myRequests = await Request.find({ requestedBy: req.userId })
      .populate("interestedUsers", "name email contactNumber");

    const result = myRequests.flatMap(request =>
      request.interestedUsers.map(user => ({
        user,
        post: request
      }))
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
