import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import ProgressBar from "../components/ProgressBar";
import LessonList from "../components/LessonList";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [quiz, setQuiz] = useState(null); // { questions: [...], passingScore: 75 }
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null); // { score: number, passed: boolean }
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [courseRes, lessonsRes, enrollmentRes] = await Promise.all([
          api.get(`/courses/${courseId}`).catch(() => null),
          api.get(`/lessons/${courseId}`),
          api.get("/enrollments/my").catch(() => ({ data: [] })),
        ]);

        setCourse(courseRes?.data || { title: "Unknown Course" });

        // Lessons may be stored either as separate `Lesson` documents
        // (returned by /lessons/:courseId) or embedded inside the Course
        // document (`course.lessons`). Prefer server lessons if present,
        // otherwise fall back to embedded lessons.
        const serverLessons = lessonsRes?.data || [];
        const embeddedLessons = courseRes?.data?.lessons || [];
        setLessons(serverLessons.length ? serverLessons : embeddedLessons);

        const enrollment = enrollmentRes.data.find(
          (e) => e.course && e.course._id === courseId
        );
        if (enrollment) {
          setCompletedLessons(enrollment.completedLessons?.map(String) || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load course.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  // ==================== QUIZ ANSWER HANDLER ====================
  const handleQuizAnswer = (questionIndex, answerIndex) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  // ==================== MARK LESSON COMPLETE ====================
  const markComplete = async (lessonId) => {
    const isLastLesson = completedLessons.length + 1 === lessons.length;

    if (isLastLesson) {
      if (!course?.quizQuestions || course.quizQuestions.length !== 10) {
        alert("Final quiz not available. Please contact the teacher.");
        return;
      }

      if (!quiz) {
        setQuiz({ questions: course.quizQuestions });
      }
      setShowQuiz(true);
      return;
    }

    try {
      await api.post(`/enrollments/complete/${courseId}/${lessonId}`);
      setCompletedLessons((prev) => [...prev, String(lessonId)]);
    } catch (err) {
      alert(
        "Failed to save progress: " +
          (err.response?.data?.message || err.message)
      );
    }
  };

  // ==================== SUBMIT QUIZ ====================
  const submitQuiz = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) {
      alert("No questions loaded. Cannot submit quiz.");
      return;
    }

    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (parseInt(quizAnswers[i]) === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= 75;

    setQuizResult({ score, passed });

    if (passed) {
      // Only now mark the course as fully complete
      const allLessonIds = lessons.map((l) => String(l._id));
      setCompletedLessons(allLessonIds);

      // Optional: record quiz passed on backend
      api.post(`/enrollments/quiz-passed/${courseId}`).catch((err) => {
        console.warn("Failed to record quiz pass", err);
      });

      alert(
        "🎉 Congratulations! You passed the quiz and completed the course!"
      );
    } else {
      alert(
        `You scored ${score}%. You need 75% to pass. Click "Mark Complete" on the last lesson to retake.`
      );
      // Reset for retake
      setQuizAnswers({});
      setQuizResult(null);
    }
  };

  // ==================== DOWNLOAD CERTIFICATE ====================
  const downloadCertificate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`/certificates/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `${course?.title || "Course"}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading certificate", err);
      alert("Error downloading certificate");
    }
  };

  // ==================== RENDER STATES ====================
  if (loading)
    return <div className="text-center py-20 text-3xl">Loading course...</div>;

  if (error)
    return (
      <div className="text-center py-20 text-red-600 text-2xl">{error}</div>
    );

  const progress =
    lessons.length > 0 ? (completedLessons.length / lessons.length) * 100 : 0;
  const courseCompleted =
    completedLessons.length === lessons.length && quizResult?.passed;

  // ==================== MAIN RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back link and Unenroll button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 underline text-lg font-medium transition"
          >
            <span className="mr-2">←</span> Back to Dashboard
          </Link>

          <button
            onClick={async () => {
              if (
                !window.confirm(
                  "Are you sure you want to unenroll from this course?\n\nAll your progress, completed lessons, and quiz attempts will be permanently deleted."
                )
              ) {
                return;
              }

              try {
                await api.delete(`/enrollments/unenroll/${courseId}`);
                alert("You have successfully unenrolled from the course.");
                window.location.href = "/dashboard";
              } catch (err) {
                alert(
                  "Failed to unenroll: " +
                    (err.response?.data?.message ||
                      err.message ||
                      "Please try again.")
                );
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95"
          >
            Unenroll from Course
          </button>
        </div>

        {/* Course Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-10">
          {course?.title}
        </h1>

        {/* Progress Bar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">
              Course Progress
            </h3>
            <span className="text-3xl md:text-4xl font-bold text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
          <ProgressBar
            completed={completedLessons.length}
            total={lessons.length}
          />
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-lg">
            {completedLessons.length} of {lessons.length} lessons completed
          </p>
        </div>

        {/* Lesson List */}
        <LessonList
          lessons={lessons}
          completedLessons={completedLessons}
          onMarkComplete={markComplete}
        />

        {/* Certificate Button */}
        <div className="text-center my-16">
          <button
            onClick={downloadCertificate}
            disabled={!courseCompleted}
            className={`px-20 py-10 text-3xl font-bold rounded-3xl shadow-2xl transition-all ${
              courseCompleted
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:scale-105"
                : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {courseCompleted
              ? "🎉 Download Certificate"
              : "Complete all lessons & pass the final quiz to unlock"}
          </button>
        </div>

        {/* Quiz Modal */}
        {showQuiz && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto p-10 relative">
              <button
                onClick={() => setShowQuiz(false)}
                className="absolute top-6 right-8 text-gray-500 hover:text-gray-700 text-4xl"
              >
                ×
              </button>

              <h2 className="text-4xl font-bold text-center mb-10">
                Final Quiz: {course?.title}
              </h2>

              {/* Loading or Error State */}
              {!quiz ? (
                <div className="text-center py-20">
                  <p className="text-2xl">Loading quiz questions...</p>
                </div>
              ) : quiz.questions.length === 0 ? (
                <div className="text-center py-20 text-red-600">
                  <p className="text-2xl">
                    No questions available right now. Please try again later.
                  </p>
                  <button
                    onClick={() => setShowQuiz(false)}
                    className="mt-8 bg-gray-600 text-white px-12 py-4 rounded-xl text-xl"
                  >
                    Close
                  </button>
                </div>
              ) : quizResult ? (
                /* Quiz Result */
                <div className="text-center py-16">
                  <h3
                    className={`text-5xl font-bold mb-8 ${
                      quizResult.passed ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {quizResult.passed ? "🎉 Congratulations!" : "Try Again"}
                  </h3>
                  <p className="text-3xl mb-12">
                    Your Score: <strong>{quizResult.score}%</strong>
                  </p>

                  {quizResult.passed ? (
                    <button
                      onClick={downloadCertificate}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-16 py-8 rounded-3xl text-3xl font-bold hover:scale-105"
                    >
                      Download Certificate
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setQuizResult(null);
                        setQuizAnswers({});
                        setShowQuiz(false);
                      }}
                      className="bg-indigo-600 text-white px-16 py-8 rounded-3xl text-3xl font-bold hover:opacity-90"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              ) : (
                /* Quiz Questions */
                <div className="space-y-8">
                  {quiz.questions.map((q, i) => (
                    <div
                      key={i}
                      className="p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl"
                    >
                      <p className="text-xl font-semibold mb-5">
                        {i + 1}. {q.question}
                      </p>
                      <div className="space-y-3">
                        {q.options.map((opt, j) => (
                          <label
                            key={j}
                            className="flex items-center p-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition"
                          >
                            <input
                              type="radio"
                              name={`question-${i}`}
                              checked={quizAnswers[i] === j}
                              onChange={() => handleQuizAnswer(i, j)}
                              className="mr-4 w-5 h-5 text-indigo-600"
                            />
                            <span className="text-lg">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="text-center mt-12">
                    <button
                      onClick={submitQuiz}
                      disabled={
                        Object.keys(quizAnswers).length < quiz.questions.length
                      }
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-20 py-8 rounded-3xl text-3xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
