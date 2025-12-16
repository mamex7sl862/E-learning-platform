// server/models/Course.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
    },
    videoUrl: {
      type: String,
      required: [true, "YouTube video URL is required"],
    },
    notes: {
      type: String,
      default: "",
    },
    duration: Number, // optional: in seconds
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question text is required"],
  },
  options: {
    type: [String],
    validate: [(v) => v && v.length === 4, "Exactly 4 options are required"],
  },
  correctAnswer: {
    type: Number,
    required: [true, "Correct answer index is required"],
    min: [0, "Correct answer must be 0-3"],
    max: [3, "Correct answer must be 0-3"],
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
    },
    category: {
      type: String,
      enum: [
        "Frontend",
        "Backend",
        "Full Stack",
        "JavaScript",
        "Database",
        "Other",
      ],
      default: "Other",
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // New: Visibility control
    published: {
      type: Boolean,
      default: false, // Teachers can create drafts, then publish
    },
    lessons: {
      type: [lessonSchema],
      validate: [(v) => v && v.length > 0, "At least one lesson is required"],
    },
    quizQuestions: {
      type: [questionSchema],
      validate: [
        {
          validator: (v) => v && v.length === 10,
          message: "Exactly 10 quiz questions are required to publish",
        },
      ],
    },
    thumbnail: {
      type: String, // Optional: URL to course thumbnail
      default: "",
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Virtual to get enrollment count
courseSchema.virtual("enrollmentCount").get(function () {
  return this.enrolledStudents?.length || 0;
});

// Index for faster queries
courseSchema.index({ published: 1, category: 1 });
courseSchema.index({ teacher: 1 });

module.exports = mongoose.model("Course", courseSchema);
