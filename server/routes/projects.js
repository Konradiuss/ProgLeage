const express = require("express");
const jwt = require("jsonwebtoken");
const Project = require("../models/Project");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");
const Invitation = require("../models/Invitation");
const User = require("../models/User");

// Настройка multer для обработки загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/project-images");
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

// Получение списка всех проектов
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({ isPrivate: false });
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Создание нового проекта
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "sliderItems", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      // Получение ID пользователя из токена авторизации
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, "secretkey");
      const userId = decodedToken.userId;

      const {
        title,
        description,
        price,
        priceType,
        isLookingForTeam,
        requiredSkills,
        githubLink,
        programmingLanguage,
        programType,
        completionStatus,
        contactPhone,
        contactTelegram,
        contactFacebook,
        isPrivate,
      } = req.body;

      const imagePath = req.files["image"]
        ? req.files["image"][0].filename
        : "default-project.jpg";

      const sliderItems = req.files["sliderItems"]
        ? req.files["sliderItems"].map((file) => ({
            type: file.mimetype.startsWith("image") ? "image" : "video",
            url: file.filename,
          }))
        : [];

      // Проверка и установка значения по умолчанию для поля priceType
      let finalPriceType = priceType;
      if (price > 0) {
        finalPriceType = "";
      } else if (!["договірна", "безкоштовно", ""].includes(priceType)) {
        finalPriceType = "";
      }

      const project = new Project({
        title,
        description,
        image: imagePath,
        price,
        priceType: finalPriceType,
        isLookingForTeam,
        requiredSkills: JSON.parse(requiredSkills),
        githubLink,
        programmingLanguage,
        programType,
        completionStatus,
        contactPhone,
        contactTelegram,
        contactFacebook,
        sliderItems,
        isPrivate,
        likes: [],
        user: userId,
      });

      await project.save();

      res
        .status(201)
        .json({ message: "Project created successfully", project });
    } catch (error) {
      console.log("Received files:", req.files);
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:projectId/comments",
  authMiddleware,
  commentUpload.array("files", 3),
  async (req, res) => {
    try {
      const projectId = req.params.projectId;
      const { text } = req.body;
      const userId = req.user._id;
      const files = req.files ? req.files.map((file) => file.filename) : [];

      const comment = new Comment({
        text,
        author: userId,
        user: userId,
        project: projectId,
        likes: [],
        dislikes: [],
        files,
      });

      await comment.save();

      const populatedComment = await comment.populate('author', 'firstName lastName profileImage');

      await Project.findByIdAndUpdate(projectId, {
        $push: { comments: populatedComment._id },
      });

      res.status(201).json(populatedComment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.post(
  "/:projectId/comments/:commentId/like",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId, commentId } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Удаление пользователя из массива дизлайков, если он там есть
      comment.dislikes = comment.dislikes.filter(
        (dislike) => dislike.toString() !== userId.toString()
      );

      // Проверка, есть ли пользователь уже в массиве лайков
      if (!comment.likes.includes(userId)) {
        comment.likes.push(userId);
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
  "/:projectId/comments/:commentId/dislike",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId, commentId } = req.params;
      const userId = req.user._id;

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      // Удаление пользователя из массива лайков, если он там есть
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== userId.toString()
      );

      // Проверка, есть ли пользователь уже в массиве дизлайков
      if (!comment.dislikes.includes(userId)) {
        comment.dislikes.push(userId);
      }

      await comment.save();

      res.json(comment);
    } catch (error) {
      console.error("Error disliking comment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "sliderItems", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      const projectId = req.params.id;
      const userId = req.user._id;
      const {
        title,
        description,
        price,
        priceType,
        isLookingForTeam,
        requiredSkills,
        githubLink,
        programmingLanguage,
        programType,
        completionStatus,
        contactPhone,
        contactTelegram,
        contactFacebook,
        isPrivate,
      } = req.body;
      const imagePath = req.files["image"]
        ? req.files["image"][0].filename
        : undefined;

      let existingSliderItems = [];
      if (req.body.existingSliderItems) {
        try {
          existingSliderItems = JSON.parse(req.body.existingSliderItems);
        } catch (error) {
          console.error("Error parsing existingSliderItems:", error);
          // Обработка ошибки парсинга existingSliderItems
        }
      }

      const newSliderItems = req.files["sliderItems"]
        ? req.files["sliderItems"].map((file) => ({
            type: file.mimetype.startsWith("image") ? "image" : "video",
            url: file.filename,
          }))
        : [];

      let parsedRequiredSkills = [];
      if (requiredSkills) {
        try {
          parsedRequiredSkills = JSON.parse(requiredSkills);
        } catch (error) {
          console.error("Error parsing requiredSkills:", error);
          // Обработка ошибки парсинга requiredSkills
        }
      }

      const updateData = {
        title,
        description,
        price,
        priceType,
        isLookingForTeam,
        requiredSkills: parsedRequiredSkills,
        githubLink,
        programmingLanguage,
        programType,
        completionStatus,
        contactPhone,
        contactTelegram,
        contactFacebook,
        isPrivate: isPrivate === "true",
        sliderItems: [...existingSliderItems, ...newSliderItems],
      };

      if (imagePath) {
        updateData.image = imagePath;
      }

      const project = await Project.findOneAndUpdate(
        { _id: projectId, user: userId },
        updateData,
        { new: true }
      );

      if (!project) {
        return res
          .status(404)
          .json({ error: "Project not found or unauthorized" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
router.get("/user/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:projectId/like", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const userLikedIndex = project.likes.findIndex((like) =>
      like.equals(userId)
    );

    if (userLikedIndex !== -1) {
      // Если пользователь уже лайкнул проект, удаляем его лайк
      project.likes.splice(userLikedIndex, 1);
    } else {
      // Если пользователь еще не лайкнул проект, добавляем его лайк
      project.likes.push(userId);
    }

    await project.save();



    res.json(project);
  } catch (error) {
    console.error("Error liking project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:projectId/invite", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { recipientId } = req.body;
    const senderId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (!project.user.equals(senderId)) {
      return res
        .status(403)
        .json({ error: "Only project author can send invitations" });
    }

    const invitation = new Invitation({
      project: projectId,
      sender: senderId,
      recipient: recipientId,
    });

    await invitation.save();

    res.status(201).json({ message: "Invitation sent successfully" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/invitations/:invitationId", authMiddleware, async (req, res) => {
  try {
    const { invitationId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation) {
      return res.status(404).json({ error: "Invitation not found" });
    }

    if (!invitation.recipient.equals(userId)) {
      return res.status(403).json({
        error: "You are not authorized to respond to this invitation",
      });
    }

    if (status === "accepted") {
      await Project.findByIdAndUpdate(invitation.project, {
        $addToSet: { participants: userId },
      });
    }

    invitation.status = status;
    await invitation.save();

    res.json({ message: "Invitation response submitted successfully" });
  } catch (error) {
    console.error("Error responding to invitation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete(
  "/:projectId/participants/:participantId",
  authMiddleware,
  async (req, res) => {
    try {
      const { projectId, participantId } = req.params;
      const userId = req.user._id;

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.user.equals(userId)) {
        return res
          .status(403)
          .json({ error: "Only project author can remove participants" });
      }

      // Удаление участника из массива participants проекта
      await Project.findByIdAndUpdate(projectId, {
        $pull: { participants: participantId },
      });

      // Удаление проекта из массива participatingProjects участника
      await User.findByIdAndUpdate(participantId, {
        $pull: { participatingProjects: projectId },
      });

      res.json({ message: "Participant removed successfully" });
    } catch (error) {
      console.error("Error removing participant:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.delete("/:projectId/participants", authMiddleware, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Удаление пользователя из массива participants проекта
    project.participants.pull(userId);
    await project.save();

    // Удаление projectId из массива participatingProjects пользователя
    const user = await User.findById(userId);
    user.participatingProjects.pull(projectId);
    await user.save();

    res.json({ message: "Left the project successfully" });
  } catch (error) {
    console.error("Error leaving project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId)
      .populate("user")
      .populate("participants", "firstName lastName profileImage")
      .populate({
        path: "comments",
        populate: { path: "author", select: "firstName lastName profileImage" },
      });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:projectId", authMiddleware, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const userId = req.user._id;

    const project = await Project.findOneAndDelete({
      _id: projectId,
      user: userId,
    });

    if (!project) {
      return res
        .status(404)
        .json({ error: "Project not found or unauthorized" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
