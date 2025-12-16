const express = require("express");
const router = express.Router();

// Grade quiz answers
router.post("/", (req, res) => {
  const { questions, answers } = req.body;

  let score = 0;
  questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswer) score++;
  });

  const percentage = (score / questions.length) * 100;
  const passed = percentage >= 75;

  res.json({ score, passed });
});

module.exports = router;
