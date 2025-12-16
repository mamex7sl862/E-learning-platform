const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
  },
  question: String,
  options: [String],
  correctAnswer: Number,
});

module.exports = mongoose.model("Question", questionSchema);
