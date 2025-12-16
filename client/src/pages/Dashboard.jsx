// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import ProgressBar from "../components/ProgressBar";

export default function Dashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enrollRes, quizRes] = await Promise.all([
          api.get("/enrollments/my"),
          api.get("/quizzes/results").catch(() => ({ data: {} })), // Prevent crash if no results
        ]);

        setEnrollments(enrollRes.data);
        setQuizResults(quizRes.data || {});
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const downloadCertificate = async (courseId, completed, total) => {
    if (completed < total) {
      alert("Complete all lessons to download certificate");
      return;
    }

    try {
      const res = await api.get(`/certificates/${courseId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "certificate.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error downloading certificate");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-2xl text-gray-600 dark:text-gray-400">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          My Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          Track your learning progress across all tech courses
        </p>

        {enrollments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 dark:text-gray-400 mb-6">
              No enrolled courses yet.
            </p>
            <Link
              to="/courses"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:opacity-90 transition shadow-lg"
            >
              Browse Available Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrollments.map((enrollment) => {
              // Safety check if course is populated
              if (!enrollment.course) return null;

              const course = enrollment.course;
              const totalLessons = course.lessons?.length || 0;
              const completedLessons = enrollment.completedLessons?.length || 0;
              const progress =
                totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

              return (
                <div
                  key={enrollment._id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 flex items-center justify-center">
                    <h3 className="text-3xl font-bold text-white">
                      {course.title[0]}
                    </h3>
                  </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {course.title}
                    </h3>

                    {course.instructor && (
                      <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3 flex items-center">
                        👨‍🏫 Instructor: {course.instructor}
                      </p>
                    )}

                    {course.category && (
                      <span className="inline-block bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-1 rounded-full text-sm font-medium mb-4">
                        {course.category}
                      </span>
                    )}

                    <div className="mb-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>
                          {completedLessons} / {totalLessons} lessons
                        </span>
                      </div>
                      <ProgressBar
                        completed={completedLessons}
                        total={totalLessons}
                      />
                      <p className="text-right text-sm font-semibold mt-2 text-indigo-600 dark:text-indigo-400">
                        {Math.round(progress)}% Complete
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Link
                        to={`/course/${course._id}`}
                        className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                      >
                        {completedLessons === 0
                          ? "Start Learning"
                          : "Continue Learning"}
                      </Link>

                      <button
                        onClick={() =>
                          downloadCertificate(
                            course._id,
                            completedLessons,
                            totalLessons
                          )
                        }
                        disabled={completedLessons < totalLessons}
                        className={`w-full py-3 rounded-xl font-semibold transition ${
                          completedLessons === totalLessons
                            ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:opacity-90"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {completedLessons === totalLessons
                          ? "🎉 Download Certificate"
                          : "Certificate Locked"}
                      </button>
                    </div>

                    {/* Quiz Results */}
                    {quizResults[course._id] &&
                      quizResults[course._id].length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                            Quiz Results
                          </h4>
                          {quizResults[course._id].map((q, i) => (
                            <p key={i} className="text-sm mb-1">
                              <span className="font-medium">
                                {q.quizTitle}:
                              </span>{" "}
                              <strong>{q.score}</strong> —{" "}
                              <span
                                className={
                                  q.passed ? "text-green-600" : "text-red-600"
                                }
                              >
                                {q.passed ? "Passed ✓" : "Failed ✗"}
                              </span>
                            </p>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
