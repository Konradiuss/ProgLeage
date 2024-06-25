<template>
    <div class="chat-component">
        <h2>Загальний чат</h2>
        <div class="chat-messages">
            <div v-for="(message, index) in messages" :key="index" class="message">
                <span class="message-author">{{ message.author }}:</span>
                <span class="message-text">{{ message.text }}</span>
            </div>
        </div>
        <div class="chat-input">
            <input type="text" v-model="newMessage" placeholder="Введіть повідомлення..." @keyup.enter="sendMessage" />
            <button @click="sendMessage">Відправити</button>
        </div>
    </div>
</template>

<script>
import io from 'socket.io-client';

export default {
    data() {
        return {
            socket: null,
            messages: [],
            newMessage: '',

        };
    },
    computed: {
        currentUser() {
            const userString = localStorage.getItem('user');
            if (userString) {
                return JSON.parse(userString);
            }
            return null;
        },
    },
    created() {
        this.socket = io('http://localhost:5000');
        this.socket.on('message', (message) => {
            this.messages.push(message);
        });
        this.socket.on('recent messages', (messages) => {
            this.messages = messages;
        });

    },

    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '') {
                const message = {
                    userId: this.currentUser ? this.currentUser._id : null,
                    username: this.currentUser ? this.currentUser.username : 'Гість',
                    text: this.newMessage.trim(),
                };
                this.socket.emit('message', message);
                this.newMessage = '';
            }
        },
    },
};
</script>

<style scoped>
.chat-component {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
}

.chat-messages {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
}

.message {
    margin-bottom: 10px;
}

.message-author {
    font-weight: bold;
}

.chat-input {
    display: flex;
}

.chat-input input {
    flex-grow: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.chat-input button {
    margin-left: 10px;
    padding: 5px 10px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.chat-component {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chat-messages {
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #fff;
    border-radius: 4px;
}

.message {
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f1f1f1;
    border-radius: 4px;
}

.message-author {
    font-weight: bold;
    color: #333;
}

.message-text {
    margin-left: 10px;
    color: #666;
}

.chat-input {
    display: flex;
    align-items: center;
}

.chat-input input {
    flex-grow: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
}

.chat-input button {
    margin-left: 10px;
    padding: 10px 20px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.chat-input button:hover {
    background-color: #555;
}
</style>