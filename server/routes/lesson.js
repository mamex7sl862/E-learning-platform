const express = require("express");
const Lesson = require("../models/lesson");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// ADD LESSON (Teacher only)
router.post("/", auth(["teacher"]), async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET LESSONS BY COURSE
router.get("/:courseId", auth(), async (req, res) => {
  const lessons = await Lesson.find({ course: req.params.courseId });
  res.json(lessons);
});

module.exports = router;
