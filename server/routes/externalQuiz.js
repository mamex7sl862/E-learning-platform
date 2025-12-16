const express = require("express");
const axios = require("axios");
const router = express.Router();

const QUIZ_API_KEY = "YOUR_API_KEY"; // Replace with your actual key

// Fetch quiz questions from QuizAPI.io
router.get("/:courseTitle", async (req, res) => {
  try {
    const { courseTitle } = req.params;

    // Fetch 10 medium difficulty questions
    const response = await axios.get(`https://quizapi.io/api/v1/questions`, {
      params: {
        apiKey: QUIZ_API_KEY,
        difficulty: "Medium",
        limit: 10,
        category: "Linux", // Optional: you can map courseTitle -> category
      },
    });

    // Format questions for frontend
    const questions = response.data.map((q) => {
      const options = Object.values(q.answers).filter(Boolean); // only non-null options
      const correct = Object.keys(q.correct_answers).find(
        (key) => q.correct_answers[key] === "true"
      );
      const correctAnswer = q.answers[correct];
      return {
        question: q.question,
        options: options.sort(() => Math.random() - 0.5),
        correctAnswer,
      };
    });

    res.json({ questions });
  } catch (err) {
    console.error("Quiz fetch error:", err);
    res.status(500).json({ message: "Failed to fetch quiz questions" });
  }
});

module.exports = router;
