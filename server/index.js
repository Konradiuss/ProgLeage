const express = require("express");

const path = require("path");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const projectRoutes = require("./routes/projects");
const invitationRoutes = require('./routes/invitations');
const User = require("./models/User");

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

const recentMessages = [];
const maxRecentMessages = 15;

app.use(express.json());
app.use(cors());
app.use("/api/user", userRoutes);
app.use("/api/projects", projectRoutes);

mongoose.connect("mongodb://localhost/myapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use('/api/invitations', invitationRoutes);

// Настройка маршрута для обслуживания статических файлов (изображений)
io.on("connection", (socket) => {
  console.log("Нове зєднання Socket.IO");

  // Отправить последние сообщения новому подключенному пользователю
  socket.emit("recent messages", recentMessages);

  socket.on("message", async (message) => {
    const { userId, text } = message;

    try {
      // Найти пользователя в базе данных по userId
      const user = await User.findById(userId);

      if (user) {
        // Если пользователь найден, отправить сообщение с именем пользователя
        const messageWithUser = {
          author: user.firstName,
          text: text,
        };
        io.emit("message", messageWithUser);

        // Добавить сообщение в массив последних сообщений
        recentMessages.push(messageWithUser);
        if (recentMessages.length > maxRecentMessages) {
          recentMessages.shift();
        }
      } else {
        // Если пользователь не найден, отправить сообщение от "Гостя"
        const messageFromGuest = {
          author: "Гість",
          text: text,
        };
        io.emit("message", messageFromGuest);

        // Добавить сообщение от гостя в массив последних сообщений
        recentMessages.push(messageFromGuest);
        if (recentMessages.length > maxRecentMessages) {
          recentMessages.shift();
        }
      }
    } catch (error) {
      console.error("Ошибка при обработке сообщения:", error);
    }
  });
});

// Настройка маршрута для обслуживания статических файлов (изображений)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const chatServer = require('./chatServer');
const chatPort = 3000; // Вы можете использовать любой другой порт
chatServer(chatPort);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
