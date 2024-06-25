const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String }, 
  region: { type: String }, 
  bio: { type: String, maxlength: 1000 },
  profileImage: { type: String, default: 'default-profile.jpg' },
  portfolio: { type: String },
  socialMedia1: { type: String },
  socialMedia2: { type: String },
  socialMedia3: { type: String },
  lastLogin: { type: Date, default: Date.now },
  participatingProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
});

module.exports = mongoose.model('User', userSchema);