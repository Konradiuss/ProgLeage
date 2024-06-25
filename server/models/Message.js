const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    file: {
        name: String,
        filename: String,
    },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);