const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});
const multer = require("multer");
const path = require("path");
const Message = require("./models/Message");
const Room = require("./models/Room");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/chat-images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

io.on("connection", (socket) => {
  console.log("Новый пользователь подключился к чату");

  socket.on("joinProject", async (projectId) => {
    socket.join(projectId);
    console.log(`Пользователь присоединился к проекту ${projectId}`);

    try {
      const rooms = await Room.find({ project: projectId });
      socket.emit("roomList", rooms);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
  });

  socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`Пользователь присоединился к комнате ${roomId}`);

    try {
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: 1 })
        .populate("user", "firstName");
      socket.emit("roomMessages", messages);
    } catch (error) {
      console.error("Error loading room messages:", error);
    }
  });

  socket.on("createRoom", async ({ projectId, roomName }) => {
    try {
      const newRoom = new Room({
        name: roomName,
        project: projectId,
      });
      await newRoom.save();

      io.to(projectId).emit("roomCreated", newRoom);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  });

  socket.on("deleteRoom", async ({ projectId, roomId }) => {
    try {
      await Room.findByIdAndDelete(roomId);
      io.to(projectId).emit("roomDeleted", roomId);
    } catch (error) {
      console.error("Error deleting room:", error);
    }
  });

  socket.on("chatMessage", async (message) => {
    try {
      if (!message.user || !message.roomId) {
        console.error("Error: Missing required fields (user or roomId)");
        return;
      }

      if (message.file) {
        const fileData = message.file;

        // Проверяем наличие свойства 'name' у объекта 'fileData'
        if (!fileData.name) {
          console.error("Error: File name is missing");
          return;
        }

        const fileExtension = path.extname(fileData.name);
        const fileName = Date.now() + fileExtension;
        const filePath = path.join(
          __dirname,
          "uploads",
          "chat-images",
          fileName
        );

        // Сохраняем файл с помощью fs.writeFile
        fs.writeFile(filePath, fileData.data, async (err) => {
          if (err) {
            console.error("Error saving file:", err);
            return;
          }

          const newMessage = new Message({
            user: message.user,
            room: message.roomId,
            file: {
              name: fileData.name,
              filename: fileName,
            },
            timestamp: message.timestamp,
          });
          await newMessage.save();

          io.to(message.roomId).emit("message", {
            user: message.user,
            roomId: message.roomId,
            timestamp: message.timestamp,
            _id: newMessage._id,
            file: {
              name: fileData.name,
              filename: fileName,
            },
          });
        });
      } else {
        const newMessage = new Message({
          text: message.text,
          user: message.user,
          room: message.roomId,
          timestamp: message.timestamp,
        });
        await newMessage.save();

        io.to(message.roomId).emit("message", {
          text: message.text,
          user: message.user,
          roomId: message.roomId,
          timestamp: message.timestamp,
          _id: newMessage._id,
        });
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
    console.log(`Пользователь покинул комнату ${roomId}`);
  });

  socket.on("leaveProject", (projectId) => {
    socket.leave(projectId);
    console.log(`Пользователь покинул проект ${projectId}`);
  });

  socket.on("disconnect", async () => {
    console.log("Пользователь отключился от чата");
  });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  res.json({ filename: req.file.filename });
});

const PORT = process.env.PORT || 3000;

module.exports = (port) => {
  server.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
  });
};
