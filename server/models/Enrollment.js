const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },

  // Lessons completed (locked until quiz passed)
  completedLessons: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
    },
  ],

  // Quiz status
  quizPassed: {
    type: Boolean,
    default: false,
  },

  quizScore: {
    type: Number,
    default: 0,
  },

  // Course completion
  courseCompleted: {
    type: Boolean,
    default: false,
  },

  // Certificate
  certificateIssued: {
    type: Boolean,
    default: false,
  },

  enrolledAt: {
    type: Date,
    default: Date.now,
  },
});

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
