// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Dashboard from "./pages/Dashboard"; // student/general dashboard
import TeacherDashboard from "./pages/TeacherDashboard"; // teacher dashboard
import Courses from "./pages/Courses";
import CoursePlayer from "./pages/Courseplayer";
import Quiz from "./pages/Quiz";
import Nav from "./components/Nav";

// Authentication helper
const isLoggedIn = () => !!localStorage.getItem("token");

// Private Route
const PrivateRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  return isLoggedIn() ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Nav />

      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="/course/:courseId"
          element={
            <PrivateRoute>
              <CoursePlayer />
            </PrivateRoute>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
