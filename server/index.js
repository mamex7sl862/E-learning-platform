// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Models (only import what's needed)
const User = require("./models/User");

// Routes
const authRoutes = require("./routes/auth");
const courseRoutes = require("./routes/course");
const lessonRoutes = require("./routes/lesson");
const enrollmentRoutes = require("./routes/enrollment");
const reportRoutes = require("./routes/report");
const certificateRoutes = require("./routes/certificate");
const quizRoutes = require("./routes/quiz");
const externalQuizRoutes = require("./routes/externalQuiz");
const gradeQuizRoutes = require("./routes/gradeQuiz");

const app = express();
const server = http.createServer(app);

// ------------------ Socket.io Setup ------------------
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite default port
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ------------------ Middlewares ------------------
app.use(
  cors({
    origin: "http://localhost:5173", // Allow only your frontend
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON bodies

// ------------------ API Routes ------------------
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/external-quiz", externalQuizRoutes);
app.use("/api/grade-quiz", gradeQuizRoutes);

// ------------------ Health Check Route (Optional) ------------------
app.get("/", (req, res) => {
  res.json({ message: "LearnHub API is running!" });
});

// ------------------ MongoDB Connection ------------------
const MONGO_URI =
  "mongodb+srv://mame:%40Mamex7sl@cluster0.cb4hlfw.mongodb.net/elearning?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
