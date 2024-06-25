const mongoose = require("mongoose");


const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "default-project.jpg" },
  price: { type: Number, default: 0 },
  priceType: { type: String, enum: ["договірна", "безкоштовно", ""] },
  isLookingForTeam: { type: Boolean, default: false },
  requiredSkills: [
    {
      type: {
        type: String,
        enum: ["Frontend", "Backend", "SoftSkill", "Custom"],
      },
      description: String,
    },
  ],
  githubLink: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  programmingLanguage: { type: String },
  programType: { type: String },
  completionStatus: { type: String },
  contactPhone: { type: String },
  contactTelegram: { type: String },
  contactFacebook: { type: String },
  sliderItems: [
    {
      type: { type: String, enum: ["image", "video"] },
      url: String,
    },
  ],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPrivate: { type: Boolean, default: false },
});

module.exports = mongoose.model("Project", projectSchema);
