const express = require("express");
const Enrollment = require("../models/Enrollment");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET STUDENT PROGRESS FOR A COURSE (Teacher only)
router.get("/course/:courseId", auth(["teacher"]), async (req, res) => {
  try {
    const data = await Enrollment.find({
      course: req.params.courseId,
    })
      .populate("student", "name email")
      .populate("completedLessons");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
