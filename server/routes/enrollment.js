// ./routes/enrollment.js
const express = require("express");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/course");
const auth = require("../middleware/authMiddleware");
const PDFDocument = require("pdfkit");

const router = express.Router();

// -------------------- ENROLL IN COURSE --------------------
router.post("/:courseId", auth(["student"]), async (req, res) => {
  try {
    const exists = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (exists)
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId,
      completedLessons: [],
      quizPassed: false,
      quizScore: 0,
    });

    res.status(201).json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to enroll" });
  }
});

// -------------------- MARK LESSON COMPLETE --------------------
router.post(
  "/complete/:courseId/:lessonId",
  auth(["student"]),
  async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;

      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
      });

      if (!enrollment)
        return res.status(404).json({ message: "Enrollment not found" });

      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
        await enrollment.save();
      }

      // Check if all lessons completed
      const course = await Course.findById(courseId);
      const completedAllLessons =
        enrollment.completedLessons.length === course.lessons.length;

      res.json({
        enrollment,
        completedAllLessons,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to mark lesson complete" });
    }
  }
);

// -------------------- RECORD QUIZ RESULT --------------------
router.post("/quiz-passed/:courseId", auth(["student"]), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { score } = req.body; // frontend should send score

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    });

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    const course = await Course.findById(courseId);
    const passingScore = course?.quizPassingScore || 75;

    enrollment.quizScore = score;
    enrollment.quizPassed = score >= passingScore;
    await enrollment.save();

    res.json({
      success: enrollment.quizPassed,
      score: enrollment.quizScore,
      message: enrollment.quizPassed
        ? "Quiz passed!"
        : "Quiz failed. Try again.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to record quiz result" });
  }
});

// -------------------- GET MY ENROLLMENTS --------------------
router.get("/my", auth(["student"]), async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate({
        path: "course",
        populate: { path: "teacher", select: "name" },
      })
      .populate("completedLessons");

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
});

// -------------------- UNENROLL FROM COURSE --------------------
router.delete("/unenroll/:courseId", auth(["student"]), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({
      student: req.user.id,
      course: req.params.courseId,
    });

    if (!enrollment)
      return res
        .status(404)
        .json({ message: "You are not enrolled in this course" });

    res.json({ message: "Successfully unenrolled. Progress removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to unenroll" });
  }
});

// -------------------- DOWNLOAD CERTIFICATE --------------------
router.get("/certificate/:courseId", auth(["student"]), async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
    }).populate("course");

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    // Check if eligible for certificate
    if (
      enrollment.completedLessons.length !== enrollment.course.lessons.length ||
      !enrollment.quizPassed
    ) {
      return res.status(403).json({
        message: "Complete all lessons and pass quiz to get certificate",
      });
    }

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${enrollment.course.title}_Certificate.pdf`
    );

    doc.pipe(res);
    doc.fontSize(25).text("Certificate of Completion", { align: "center" });
    doc.moveDown();
    doc.fontSize(18).text(`This certifies that:`, { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(`${req.user.name}`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(18)
      .text(
        `Has successfully completed the course: ${enrollment.course.title}`,
        { align: "center" }
      );
    doc.moveDown();
    doc.fontSize(16).text(`Teacher: ${enrollment.course.teacher.name}`, {
      align: "center",
    });
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

module.exports = router;
