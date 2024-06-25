<template>
    <div class="project-chat">
        <div class="chat-container">
            <div class="chat-rooms">
                <h3>Чат-кімнати</h3>
                <ul class="room-list">
                    <li v-for="room in chatRooms" :key="room._id" class="room-item"
                        :class="{ 'active': activeRoom && activeRoom._id === room._id }" @click="selectRoom(room)">
                        {{ room.name }}
                        <button v-if="isAuthor" @click.stop="confirmDeleteRoom(room)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </li>
                </ul>
                <div v-if="isAuthor" class="create-room">
                    <input type="text" v-model="newRoomName" placeholder="Назва нової кімнати">
                    <button @click="createRoom">Створити</button>
                </div>
            </div>
            <div class="chat-window">
                <div v-if="!activeRoom" class="no-room-selected">
                    <p>Виберіть або створіть кімнату, щоб почати спілкування.</p>
                </div>
                <div v-else class="chat-messages">
                    <div v-for="message in messages" :key="message._id" class="message">
                        <div class="message-header">
                            <strong>{{ message.user.firstName }}</strong>
                            <span class="message-time">{{ formatTimestamp(message.timestamp) }}</span>
                        </div>
                        <div class="message-content">
                            <template v-if="message.text">{{ message.text }}</template>
                            <div v-else-if="message.file" class="message-file">
                                <i class="fas fa-file"></i>
                                <a :href="getFileUrl(message.file)" target="_blank" @click="downloadFile(message.file)">
                                    {{ message.file.name }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="activeRoom" class="chat-input">
                    <input type="text" v-model="newMessage" @keyup.enter="sendMessage"
                        placeholder="Введіть повідомлення...">
                    <label for="file-input" class="file-upload-label">
                        <i class="fas fa-paperclip"></i>
                    </label>
                    <input type="file" id="file-input" @change="handleFileUpload" style="display: none;">
                    <button @click="sendMessage">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import io from "socket.io-client";
import axios from "axios";

export default {
    name: "ProjectChatComponent",
    data() {
        return {
            socket: null,
            chatRooms: [],
            activeRoom: null,
            messages: [],
            newMessage: "",
            newRoomName: "",
            isAuthor: false,
        };
    },
    computed: {
        currentUser() {
            return JSON.parse(localStorage.getItem("user"));
        },
        projectId() {
            return this.$route.params.id;
        },
    },
    async created() {
        this.socket = io("http://localhost:3000");
        this.socket.emit("joinProject", this.projectId);
        this.socket.on("roomList", (rooms) => {
            this.chatRooms = rooms;
            if (!this.activeRoom && rooms.length > 0) {
                this.activeRoom = rooms[0];
                this.joinRoom(this.activeRoom._id);
            }
        });
        this.socket.on("previousMessages", (messages) => {
            this.messages = messages;
        });
        this.socket.on("message", (message) => {
            if (this.activeRoom && message.roomId === this.activeRoom.id) {
                this.messages.push(message);
            }
        });
        this.socket.on("roomMessages", (messages) => {
            this.messages = messages;
        });
        this.socket.on("roomCreated", (room) => {
            this.chatRooms.push(room);
        });
        this.socket.on("roomDeleted", (roomId) => {
            this.chatRooms = this.chatRooms.filter((room) => room._id !== roomId);
            if (this.activeRoom && this.activeRoom._id === roomId) {
                this.activeRoom = this.chatRooms[0];
                if (this.activeRoom) {
                    this.joinRoom(this.activeRoom._id);
                }
            }
        });

        try {
            const response = await axios.get(
                `http://localhost:5000/api/projects/${this.projectId}`
            );
            const project = response.data;
            this.isAuthor =
                this.currentUser && this.currentUser._id === project.user._id;
        } catch (error) {
            console.error("Error fetching project:", error);
        }
    },
    beforeUnmount() {
        this.socket.emit("leaveProject", this.projectId);
        this.socket.disconnect();
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '' && this.activeRoom) {
                const message = {
                    text: this.newMessage,
                    user: this.currentUser,
                    roomId: this.activeRoom._id,
                    timestamp: new Date().toISOString(),
                };
                this.socket.emit('chatMessage', message);
                this.messages.push(message);
                this.newMessage = '';
            }
        },
        selectRoom(room) {
            this.activeRoom = room;
            this.joinRoom(room._id);
        },
        joinRoom(roomId) {
            this.socket.emit('joinRoom', roomId);
            this.messages = [];
        },
        createRoom() {
            if (this.newRoomName.trim() !== "") {
                this.socket.emit("createRoom", {
                    projectId: this.projectId,
                    roomName: this.newRoomName,
                });
                this.newRoomName = "";
            }
        },
        confirmDeleteRoom(room) {
            const confirmDelete = window.confirm(`Ви впевнені, що хочете видалити кімнату "${room.name}"?`);
            if (confirmDelete) {
                this.deleteRoom(room);
            }
        },
        deleteRoom(room) {
            this.socket.emit('deleteRoom', { projectId: this.projectId, roomId: room._id });
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    const message = {
                        user: this.currentUser,
                        roomId: this.activeRoom._id,
                        file: {
                            name: file.name,
                            data: reader.result,
                        },
                        timestamp: new Date().toISOString(),
                    };
                    this.socket.emit('chatMessage', message);
                    this.messages.push(message); // Добавляем сообщение о файле в локальный массив сообщений
                };
                reader.readAsArrayBuffer(file);
            }
        },
        getFileUrl(file) {
            return `http://localhost:3000/uploads/chat-images/${file.filename}`;
        },
        downloadFile(file) {
            const link = document.createElement('a');
            link.href = this.getFileUrl(file);
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },
        formatTimestamp(timestamp) {
            const date = new Date(timestamp);
            return date.toLocaleString();
        },
    },
};
</script>

<style scoped>
.project-chat {
  display: flex;
  justify-content: center;
  padding: 20px;
  min-height: calc(100vh - 100px); 
}

.chat-container {
  display: flex;
  width: 100%;
  max-width: 2000px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(255, 255, 255, 0.05);
  background-color: #2c2c2c;
  margin: 0 auto;
}

.chat-rooms {
  flex: 0 0 300px;
  background-color: #3c3c3c;
  padding: 20px;
  color: #e0e0e0;
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
}

.room-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.room-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  margin-bottom: 10px;
  background-color: #4c4c4c;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.room-item:hover {
  background-color: #5c5c5c;
}

.room-item.active {
  background-color: #e0e0e0;
  color: #2c2c2c;
}

.room-item button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.room-item button:hover {
  color: #ff4d4d;
}

.create-room {
  display: flex;
  margin-top: 20px;
}

.create-room input {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  margin-right: 10px;
  background-color: #4c4c4c;
  color: #e0e0e0;
}

.create-room button {
  padding: 12px 24px;
  background-color: #e0e0e0;
  color: #2c2c2c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-room button:hover {
  background-color: #d0d0d0;
}

.chat-window {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  color: #e0e0e0;
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  padding: 20px;
  margin-left: 20px;
  overflow: hidden; /* Добавляем overflow: hidden для предотвращения растягивания */
}

.message {
  margin-bottom: 15px;
  max-width: 100%;
  
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 220px);
  padding-right: 20px;
  width: 100%;
}

.message-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #999;
  margin-bottom: 5px;
}

.message-time {
  margin-left: 10px;
}

.message-content {
  word-wrap: break-word; 
  overflow-wrap: break-word; 
  max-width: 100%;
  line-height: 1.4;
  padding: 10px; 
  background-color: #3c3c3c; 
  border-radius: 8px; 
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #4c4c4c;
}

.chat-input input {
  flex: 1;
  padding: 12px;
  border: 1px solid #4c4c4c;
  border-radius: 8px;
  background-color: #3c3c3c;
  color: #e0e0e0;
}

.file-upload-label {
  margin: 0 10px;
  cursor: pointer;
  color: #e0e0e0;
}

.chat-input button {
  padding: 12px;
  background-color: #e0e0e0;
  color: #2c2c2c;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.chat-input button:hover {
  background-color: #d0d0d0;
}

.no-room-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #999;
}

.message-file {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.message-file i {
  margin-right: 5px;
  color: #e0e0e0;
}

.message-file a {
  color: #e0e0e0;
  text-decoration: none;
}

.message-file a:hover {
  text-decoration: underline;
}
</style>