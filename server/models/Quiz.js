// /models/quiz.js
const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true }, // store the key/index of correct answer
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, default: "Final Quiz" },
    questions: [questionSchema], // store quiz questions
    passingScore: { type: Number, default: 75 }, // default passing threshold
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
