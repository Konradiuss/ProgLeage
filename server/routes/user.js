const express = require("express");
const multer = require("multer");
const path = require("path");
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");
const Comment = require("../models/Comment");

const router = express.Router();

mongoose.connect("mongodb://localhost/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/profile-images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const commentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/comments-images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const commentUpload = multer({ storage: commentStorage });

router.put(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const profileImage = req.file.filename;

      const user = await User.findByIdAndUpdate(
        userId,
        { profileImage },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating profile image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password").lean();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const projects = await Project.find({ user: userId });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/last-login", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    res.json({ lastLogin: user.lastLogin });
  } catch (error) {
    console.error("Error fetching last login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/participating-projects", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("participatingProjects");
    res.json(user.participatingProjects);
  } catch (error) {
    console.error("Error fetching participating projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      region,
      bio,
      portfolio,
      socialMedia1,
      socialMedia2,
      socialMedia3,
    } = req.body;

    // Проверка наличия пользователя с таким же email
    if (email) {
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone,
        city,
        region,
        bio,
        portfolio,
        socialMedia1,
        socialMedia2,
        socialMedia3,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName lastName profileImage" },
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/:userId/comments",
  authMiddleware,
  commentUpload.array("files", 3),
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { text } = req.body;
      const authorId = req.user._id;
      const files = req.files ? req.files.map((file) => file.filename) : [];

      const comment = new Comment({
        text,
        author: authorId,
        user: userId,
        likes: [],
        dislikes: [],
        files,
      });

      await comment.save();

      await User.findByIdAndUpdate(userId, {
        $push: { comments: comment._id },
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:userId/comments/:commentId/like",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId, commentId } = req.params;
      const currentUserId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Удаление пользователя из массива дизлайков, если он там есть
      comment.dislikes = comment.dislikes.filter(
        (dislike) => dislike.toString() !== currentUserId.toString()
      );

      // Проверка, есть ли пользователь уже в массиве лайков
      if (!comment.likes.includes(currentUserId)) {
        comment.likes.push(currentUserId);
      }

      await comment.save();

      res.json(comment);
    } catch (error) {
      console.error("Error liking comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:userId/comments/:commentId/dislike",
  authMiddleware,
  async (req, res) => {
    try {
      const { userId, commentId } = req.params;
      const currentUserId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Удаление пользователя из массива лайков, если он там есть
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== currentUserId.toString()
      );

      // Проверка, есть ли пользователь уже в массиве дизлайков
      if (!comment.dislikes.includes(currentUserId)) {
        comment.dislikes.push(currentUserId);
      }

      await comment.save();

      res.json(comment);
    } catch (error) {
      console.error("Error disliking comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/:userId/projects", async (req, res) => {
  try {
    const userId = req.params.userId;
    const projects = await Project.find({ user: userId });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:userId/participating-projects", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("participatingProjects");
    res.json(user.participatingProjects);
  } catch (error) {
    console.error("Error fetching participating projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
