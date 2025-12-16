// server/routes/course.js
const express = require("express");
const Course = require("../models/course");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// GET ALL COURSES (for students - currently shows ALL courses)
// In the future: change { published: true } to enable draft mode
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;

    // Temporarily show ALL courses (including drafts) so they appear again
    let query = {};
    // Uncomment the line below when you're ready to hide drafts:
    // let query = { published: true };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const courses = await Course.find(query)
      .populate("teacher", "name")
      .select("-quizQuestions -lessons.notes") // Hide heavy fields
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET MY COURSES (teacher's own courses - includes drafts)
router.get("/my", auth(["teacher"]), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.id })
      .sort({ createdAt: -1 })
      .populate("teacher", "name");

    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE COURSE
router.post("/", auth(["teacher"]), async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      category,
      lessons,
      quizQuestions,
      published,
    } = req.body;

    if (!title || !description || !subject || !lessons?.length) {
      return res.status(400).json({
        message:
          "Title, description, subject, and at least one lesson are required",
      });
    }

    // Optional: Enforce 10 questions only if publishing
    if (published && (!quizQuestions || quizQuestions.length !== 10)) {
      return res
        .status(400)
        .json({ message: "Exactly 10 quiz questions required to publish" });
    }

    const course = await Course.create({
      title,
      description,
      subject,
      category,
      lessons,
      quizQuestions: quizQuestions || [],
      teacher: req.user.id,
      published: published || true, // Default to TRUE so new courses appear immediately
    });

    res.status(201).json(course);
  } catch (err) {
    console.error("Course creation error:", err);
    res.status(400).json({ message: err.message || "Failed to create course" });
  }
});

// UPDATE COURSE
router.put("/:id", auth(["teacher"]), async (req, res) => {
  try {
    const updates = req.body;

    const course = await Course.findOne({
      _id: req.params.id,
      teacher: req.user.id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    // If trying to publish, validate quiz
    if (
      updates.published &&
      (!updates.quizQuestions || updates.quizQuestions.length !== 10)
    ) {
      return res
        .status(400)
        .json({ message: "Exactly 10 quiz questions required to publish" });
    }

    Object.keys(updates).forEach((key) => {
      course[key] = updates[key];
    });

    await course.save();

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || "Update failed" });
  }
});

// PUBLISH COURSE (optional separate endpoint)
router.patch("/:id/publish", auth(["teacher"]), async (req, res) => {
  try {
    const course = await Course.findOne({
      _id: req.params.id,
      teacher: req.user.id,
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.quizQuestions.length !== 10) {
      return res
        .status(400)
        .json({ message: "Add exactly 10 quiz questions before publishing" });
    }

    course.published = true;
    await course.save();

    res.json({ message: "Course published successfully", course });
  } catch (err) {
    res.status(500).json({ message: "Publish failed" });
  }
});

// DELETE COURSE
router.delete("/:id", auth(["teacher"]), async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.id,
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found or unauthorized" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// GET SINGLE COURSE
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "teacher",
      "name"
    );

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Optional: Restrict access to unpublished courses
    // Remove or comment this if you want all courses accessible
    // if (!course.published && (!req.user || req.user.id !== course.teacher.toString())) {
    //   return res.status(403).json({ message: "This course is not published yet" });
    // }

    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

module.exports = router;
