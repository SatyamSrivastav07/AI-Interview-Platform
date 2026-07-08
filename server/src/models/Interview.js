const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    expectedTopics: {
      type: [String],
      default: [],
    },
    userAnswer: {
      type: String,
      default: "",
      trim: true,
    },
    feedback: {
      type: String,
      default: "",
      trim: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid", "Senior"],
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["HR", "Technical", "DSA", "Mixed"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (questions) => Array.isArray(questions) && questions.length > 0,
        message: "Interview must contain at least one question",
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
