const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const Course = require("../models/course"); // Adjust path if needed
const axios = require("axios");

const QUIZ_API_KEY = "cEAdlaVzc0jqxwknwPkjIsyx7rIkNwUn01VAVf68";

// Fallback categories for non-HTML courses
const FALLBACK_CATEGORIES = [
  "Linux",
  "DevOps",
  "Docker",
  "Bash",
  "MySQL",
  "Code",
  "JavaScript",
];

router.post("/generate/:courseId", async (req, res) => {
  const { courseId } = req.params;

  try {
    let quiz = await Quiz.findOne({ course: courseId });

    if (!quiz) {
      // Fetch course to check title
      const course = await Course.findById(courseId);
      const courseTitle = (course?.title || "").toLowerCase();

      let questions = [];

      // === HARD CODED HTML QUESTIONS FOR HTML/WEB COURSES ===
      if (courseTitle.includes("html") || courseTitle.includes("web")) {
        questions = [
          {
            question: "What does HTML stand for?",
            options: [
              "Hyper Text Markup Language",
              "Home Tool Markup Language",
              "Hyperlinks and Text Markup Language",
              "Hyper Tool Markup Language",
            ],
            correctAnswer: 0,
          },
          {
            question: "Who is responsible for creating the Web standards?",
            options: [
              "Google",
              "Microsoft",
              "Mozilla",
              "The World Wide Web Consortium",
            ],
            correctAnswer: 3,
          },
          {
            question: "Which HTML element is used for the largest heading?",
            options: ["<heading>", "<h6>", "<head>", "<h1>"],
            correctAnswer: 3,
          },
          {
            question:
              "What is the correct HTML element for inserting a line break?",
            options: ["<br>", "<break>", "<lb>", "<line>"],
            correctAnswer: 0,
          },
          {
            question: "How do you add a background color in HTML?",
            options: [
              '<body bg="yellow">',
              '<body style="background-color:yellow;">',
              "<background>yellow</background>",
              '<body color="yellow">',
            ],
            correctAnswer: 1,
          },
          {
            question: "Which HTML element defines important text?",
            options: ["<important>", "<b>", "<i>", "<strong>"],
            correctAnswer: 3,
          },
          {
            question: "How can you make a numbered list in HTML?",
            options: ["<ul>", "<ol>", "<list>", "<dl>"],
            correctAnswer: 1,
          },
          {
            question: "How do you open a link in a new tab?",
            options: [
              '<a href="url" target="new">',
              '<a href="url" target="_blank">',
              '<a href="url" new>',
              '<a href="url" tab="new">',
            ],
            correctAnswer: 1,
          },
          {
            question: "Which HTML element defines navigation links?",
            options: ["<navigate>", "<navigation>", "<nav>", "<links>"],
            correctAnswer: 2,
          },
          {
            question:
              "Which attribute is required for an input field to be filled out?",
            options: ["placeholder", "validate", "required", "mandatory"],
            correctAnswer: 2,
          },
        ];

        console.log(
          `Hardcoded HTML quiz generated for course: ${course?.title}`
        );
      } else {
        // === FALLBACK TO QuizAPI FOR OTHER COURSES ===
        let usedCategory = null;

        for (const category of FALLBACK_CATEGORIES) {
          try {
            const response = await axios.get(
              `https://quizapi.io/api/v1/questions?apiKey=${QUIZ_API_KEY}&category=${category}&difficulty=Medium&limit=10`,
              { timeout: 10000 }
            );

            if (response.data && response.data.length >= 5) {
              questions = response.data;
              usedCategory = category;
              console.log(
                `Fetched ${questions.length} questions from "${category}" category`
              );
              break;
            }
          } catch (err) {
            console.warn(`Category "${category}" failed:`, err.message);
          }
        }

        if (questions.length < 5) {
          return res.status(500).json({
            error: "No questions available",
            details: "Could not fetch sufficient questions from QuizAPI.",
          });
        }

        // Transform QuizAPI response
        questions = questions.map((q) => {
          const opts = Object.values(q.answers).filter(Boolean);
          const correctKey = Object.keys(q.correct_answers).find(
            (key) => q.correct_answers[key] === "true"
          );
          const letter = correctKey ? correctKey.split("_")[1] : null;
          const correctIndex = letter
            ? ["a", "b", "c", "d", "e", "f"].indexOf(letter)
            : 0;

          return {
            question: q.question || "Question",
            options: opts.length > 0 ? opts : ["A", "B", "C", "D"],
            correctAnswer: correctIndex,
          };
        });
      }

      // Create quiz in database
      quiz = await Quiz.create({
        course: courseId,
        questions,
        passingScore: 75,
      });
    }

    // Send quiz to frontend
    res.json(quiz);
  } catch (err) {
    console.error("=== QUIZ GENERATION ERROR ===", err);
    res.status(500).json({
      error: "Failed to generate quiz",
      details: err.message || "Unknown error",
    });
  }
});

module.exports = router;

// GET quiz results for logged-in student
const auth = require("../middleware/authMiddleware");
const Result = require("../models/Result");

router.get("/results", auth(), async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate("quiz", "title")
      .populate("course", "title");

    // Map results by course id
    const byCourse = {};
    results.forEach((r) => {
      const courseId = String(r.course._id);
      if (!byCourse[courseId]) byCourse[courseId] = [];
      byCourse[courseId].push({
        quizTitle: r.quiz?.title || "Final Quiz",
        score: r.score,
        passed: r.passed,
      });
    });

    res.json(byCourse);
  } catch (err) {
    console.error("Failed to fetch quiz results", err);
    res.status(500).json({ message: "Failed to fetch quiz results" });
  }
});
