// src/pages/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import api from "../api/api";

export default function TeacherDashboard() {
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" }); // success or error

  // ==================== CREATE FORM STATE ====================
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    subject: "",
    category: "Frontend",
    lessons: [{ title: "", videoUrl: "", notes: "" }],
    quizQuestions: Array(10)
      .fill()
      .map(() => ({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      })),
  });

  // ==================== EDIT FORM STATE ====================
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // ==================== FETCH MY COURSES ====================
  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoadingCourses(true);
      const res = await api.get("/courses/my");
      setMyCourses(res.data);
    } catch (err) {
      showMessage("Failed to load your courses", "error");
    } finally {
      setLoadingCourses(false);
    }
  };

  // ==================== MESSAGE HANDLER ====================
  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 6000);
  };

  // ==================== CREATE COURSE ====================
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm(createForm)) return;

    try {
      await api.post("/courses", createForm);
      showMessage("Course created and published successfully!");
      resetCreateForm();
      fetchMyCourses();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Failed to create course",
        "error"
      );
    }
  };

  // ==================== START EDIT ====================
  const startEdit = (course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title || "",
      description: course.description || "",
      subject: course.subject || "",
      category: course.category || "Frontend",
      lessons:
        course.lessons && course.lessons.length > 0
          ? course.lessons
          : [{ title: "", videoUrl: "", notes: "" }],
      quizQuestions:
        course.quizQuestions && course.quizQuestions.length === 10
          ? course.quizQuestions
          : Array(10)
              .fill()
              .map(() => ({
                question: "",
                options: ["", "", "", ""],
                correctAnswer: 0,
              })),
    });
  };

  // ==================== UPDATE COURSE ====================
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(editForm)) return;

    try {
      await api.put(`/courses/${editingCourse._id}`, editForm);
      showMessage("Course updated successfully!");
      setEditingCourse(null);
      setEditForm(null);
      fetchMyCourses();
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Failed to update course",
        "error"
      );
    }
  };

  // ==================== DELETE COURSE ====================
  const deleteCourse = async (courseId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this course?\nAll lessons, quiz questions, and student progress will be lost permanently."
      )
    )
      return;

    try {
      await api.delete(`/courses/${courseId}`);
      showMessage("Course deleted successfully");
      fetchMyCourses();
    } catch (err) {
      showMessage("Failed to delete course", "error");
    }
  };

  // ==================== FORM VALIDATION ====================
  const validateForm = (form) => {
    // Check lessons
    if (form.lessons.some((l) => !l.title.trim() || !l.videoUrl.trim())) {
      showMessage(
        "Every lesson must have a title and a valid YouTube URL",
        "error"
      );
      return false;
    }

    // Check quiz
    if (
      form.quizQuestions.some(
        (q) => !q.question.trim() || q.options.some((opt) => !opt.trim())
      )
    ) {
      showMessage(
        "Every quiz question and all 4 options must be filled",
        "error"
      );
      return false;
    }

    return true;
  };

  // ==================== RESET CREATE FORM ====================
  const resetCreateForm = () => {
    setCreateForm({
      title: "",
      description: "",
      subject: "",
      category: "Frontend",
      lessons: [{ title: "", videoUrl: "", notes: "" }],
      quizQuestions: Array(10)
        .fill()
        .map(() => ({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        })),
    });
  };

  // ==================== HELPER: ADD LESSON ====================
  const addLesson = (form, setForm) => {
    setForm({
      ...form,
      lessons: [...form.lessons, { title: "", videoUrl: "", notes: "" }],
    });
  };

  // ==================== HELPER: UPDATE NESTED FIELD ====================
  const updateNested = (
    form,
    setForm,
    arrayName,
    index,
    field,
    value,
    optIndex = null
  ) => {
    const updatedArray = [...form[arrayName]];
    if (optIndex !== null) {
      updatedArray[index].options[optIndex] = value;
    } else if (field === "correctAnswer") {
      updatedArray[index].correctAnswer = Number(value);
    } else {
      updatedArray[index][field] = value;
    }
    setForm({ ...form, [arrayName]: updatedArray });
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-16">
          Teacher Dashboard
        </h1>

        {/* Global Message */}
        {message.text && (
          <div
            className={`mb-12 p-8 rounded-2xl text-center text-2xl font-bold text-white shadow-lg ${
              message.type === "error" ? "bg-red-600" : "bg-green-600"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* My Courses List */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold mb-10">
            My Courses ({myCourses.length})
          </h2>

          {loadingCourses ? (
            <p className="text-center text-3xl text-gray-600 dark:text-gray-400">
              Loading your courses...
            </p>
          ) : myCourses.length === 0 ? (
            <p className="text-center text-3xl text-gray-600 dark:text-gray-400">
              You haven't created any courses yet. Use the form below to create
              your first one!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {myCourses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 flex flex-col"
                >
                  <h3 className="text-3xl font-bold mb-4">{course.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow line-clamp-4">
                    {course.description}
                  </p>
                  <p className="text-xl text-indigo-600 dark:text-indigo-400 mb-8">
                    {course.subject} • {course.category}
                  </p>
                  <div className="flex gap-6 mt-auto">
                    <button
                      onClick={() => startEdit(course)}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-5 rounded-2xl font-bold text-xl transition transform hover:scale-105"
                    >
                      Edit Course
                    </button>
                    <button
                      onClick={() => deleteCourse(course._id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-bold text-xl transition transform hover:scale-105"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ==================== CREATE NEW COURSE FORM ==================== */}
        {!editingCourse && (
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12">
            <h2 className="text-4xl font-bold text-center mb-12">
              Create New Course
            </h2>

            <form onSubmit={handleCreate} className="space-y-16">
              {/* Basic Course Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <label className="block text-2xl font-semibold mb-4">
                    Course Title
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, title: e.target.value })
                    }
                    placeholder="e.g. Complete React Mastery"
                    className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700 focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-2xl font-semibold mb-4">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.subject}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, subject: e.target.value })
                    }
                    placeholder="e.g. React.js, Node.js"
                    className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700 focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-2xl font-semibold mb-4">
                  Description
                </label>
                <textarea
                  required
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      description: e.target.value,
                    })
                  }
                  rows="6"
                  placeholder="Write a detailed description of your course..."
                  className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700 focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-2xl font-semibold mb-4">
                  Category
                </label>
                <select
                  value={createForm.category}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, category: e.target.value })
                  }
                  className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700 focus:border-indigo-500 transition"
                >
                  <option>Frontend</option>
                  <option>Backend</option>
                  <option>Full Stack</option>
                  <option>JavaScript</option>
                  <option>Database</option>
                </select>
              </div>

              {/* Lessons Section */}
              <div>
                <h3 className="text-4xl font-bold mb-10">Lessons</h3>
                {createForm.lessons.map((lesson, i) => (
                  <div
                    key={i}
                    className="mb-12 p-10 bg-gray-100 dark:bg-gray-900 rounded-3xl shadow-lg"
                  >
                    <h4 className="text-2xl font-semibold mb-6">
                      Lesson {i + 1}
                    </h4>
                    <input
                      type="text"
                      required
                      placeholder="Lesson Title"
                      value={lesson.title}
                      onChange={(e) =>
                        updateNested(
                          createForm,
                          setCreateForm,
                          "lessons",
                          i,
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full mb-6 px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                    <input
                      type="url"
                      required
                      placeholder="YouTube Video URL (e.g. https://www.youtube.com/watch?v=...)"
                      value={lesson.videoUrl}
                      onChange={(e) =>
                        updateNested(
                          createForm,
                          setCreateForm,
                          "lessons",
                          i,
                          "videoUrl",
                          e.target.value
                        )
                      }
                      className="w-full mb-6 px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                    <textarea
                      placeholder="Additional notes (optional)"
                      value={lesson.notes}
                      onChange={(e) =>
                        updateNested(
                          createForm,
                          setCreateForm,
                          "lessons",
                          i,
                          "notes",
                          e.target.value
                        )
                      }
                      rows="4"
                      className="w-full px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addLesson(createForm, setCreateForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl text-xl font-bold transition"
                >
                  + Add Another Lesson
                </button>
              </div>

              {/* Quiz Section */}
              <div>
                <h3 className="text-4xl font-bold mb-10">
                  Final Quiz – Exactly 10 Questions
                </h3>
                {createForm.quizQuestions.map((q, i) => (
                  <div
                    key={i}
                    className="mb-16 p-12 bg-purple-50 dark:bg-purple-900/30 rounded-3xl shadow-lg"
                  >
                    <h4 className="text-3xl font-semibold mb-8">
                      Question {i + 1}
                    </h4>
                    <input
                      type="text"
                      required
                      placeholder="Write your question here"
                      value={q.question}
                      onChange={(e) =>
                        updateNested(
                          createForm,
                          setCreateForm,
                          "quizQuestions",
                          i,
                          "question",
                          e.target.value
                        )
                      }
                      className="w-full mb-10 px-8 py-6 text-2xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {q.options.map((opt, j) => (
                        <div key={j} className="flex items-center gap-6">
                          <input
                            type="text"
                            required
                            placeholder={`Option ${j + 1}`}
                            value={opt}
                            onChange={(e) =>
                              updateNested(
                                createForm,
                                setCreateForm,
                                "quizQuestions",
                                i,
                                "options",
                                e.target.value,
                                j
                              )
                            }
                            className="flex-1 px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                          />
                          <label className="flex items-center gap-3 text-xl">
                            <input
                              type="radio"
                              name={`create-correct-${i}`}
                              checked={q.correctAnswer === j}
                              onChange={() =>
                                updateNested(
                                  createForm,
                                  setCreateForm,
                                  "quizQuestions",
                                  i,
                                  "correctAnswer",
                                  j
                                )
                              }
                              className="w-6 h-6 text-indigo-600"
                            />
                            <span>Correct Answer</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-32 py-10 rounded-3xl text-4xl font-bold shadow-2xl transition transform hover:scale-105"
                >
                  Publish Course
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ==================== EDIT COURSE MODAL ==================== */}
        {editingCourse && editForm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6 overflow-y-auto">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-6xl w-full max-h-screen overflow-y-auto p-12">
              <h2 className="text-5xl font-bold text-center mb-12">
                Edit Course: {editingCourse.title}
              </h2>

              <form onSubmit={handleUpdate} className="space-y-16">
                {/* Same structure as create form, but using editForm */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="block text-2xl font-semibold mb-4">
                      Course Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-2xl font-semibold mb-4">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.subject}
                      onChange={(e) =>
                        setEditForm({ ...editForm, subject: e.target.value })
                      }
                      className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xl font-semibold mb-4">
                    Description
                  </label>
                  <textarea
                    required
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    rows="6"
                    className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-2xl font-semibold mb-4">
                    Category
                  </label>
                  <select
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({ ...editForm, category: e.target.value })
                    }
                    className="w-full px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                  >
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Full Stack</option>
                    <option>JavaScript</option>
                    <option>Database</option>
                  </select>
                </div>

                {/* Edit Lessons */}
                <div>
                  <h3 className="text-4xl font-bold mb-10">Lessons</h3>
                  {editForm.lessons.map((lesson, i) => (
                    <div
                      key={i}
                      className="mb-12 p-10 bg-gray-100 dark:bg-gray-900 rounded-3xl shadow-lg"
                    >
                      <h4 className="text-2xl font-semibold mb-6">
                        Lesson {i + 1}
                      </h4>
                      <input
                        type="text"
                        required
                        placeholder="Lesson Title"
                        value={lesson.title}
                        onChange={(e) =>
                          updateNested(
                            editForm,
                            setEditForm,
                            "lessons",
                            i,
                            "title",
                            e.target.value
                          )
                        }
                        className="w-full mb-6 px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                      />
                      <input
                        type="url"
                        required
                        placeholder="YouTube Video URL"
                        value={lesson.videoUrl}
                        onChange={(e) =>
                          updateNested(
                            editForm,
                            setEditForm,
                            "lessons",
                            i,
                            "videoUrl",
                            e.target.value
                          )
                        }
                        className="w-full mb-6 px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                      />
                      <textarea
                        placeholder="Notes (optional)"
                        value={lesson.notes}
                        onChange={(e) =>
                          updateNested(
                            editForm,
                            setEditForm,
                            "lessons",
                            i,
                            "notes",
                            e.target.value
                          )
                        }
                        rows="4"
                        className="w-full px-8 py-5 text-xl border-2 rounded-2xl dark:bg-gray-700"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addLesson(editForm, setEditForm)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl text-xl font-bold transition"
                  >
                    + Add Another Lesson
                  </button>
                </div>

                {/* Edit Quiz */}
                <div>
                  <h3 className="text-4xl font-bold mb-10">
                    Final Quiz – Exactly 10 Questions
                  </h3>
                  {editForm.quizQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="mb-16 p-12 bg-purple-50 dark:bg-purple-900/30 rounded-3xl shadow-lg"
                    >
                      <h4 className="text-3xl font-semibold mb-8">
                        Question {i + 1}
                      </h4>
                      <input
                        type="text"
                        required
                        placeholder="Write your question here"
                        value={q.question}
                        onChange={(e) =>
                          updateNested(
                            editForm,
                            setEditForm,
                            "quizQuestions",
                            i,
                            "question",
                            e.target.value
                          )
                        }
                        className="w-full mb-10 px-8 py-6 text-2xl border-2 rounded-2xl dark:bg-gray-700"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {q.options.map((opt, j) => (
                          <div key={j} className="flex items-center gap-6">
                            <input
                              type="text"
                              required
                              placeholder={`Option ${j + 1}`}
                              value={opt}
                              onChange={(e) =>
                                updateNested(
                                  editForm,
                                  setEditForm,
                                  "quizQuestions",
                                  i,
                                  "options",
                                  e.target.value,
                                  j
                                )
                              }
                              className="flex-1 px-8 py-6 text-xl border-2 rounded-2xl dark:bg-gray-700"
                            />
                            <label className="flex items-center gap-3 text-xl">
                              <input
                                type="radio"
                                name={`edit-correct-${i}`}
                                checked={q.correctAnswer === j}
                                onChange={() =>
                                  updateNested(
                                    editForm,
                                    setEditForm,
                                    "quizQuestions",
                                    i,
                                    "correctAnswer",
                                    j
                                  )
                                }
                                className="w-6 h-6 text-indigo-600"
                              />
                              <span>Correct Answer</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Edit Buttons */}
                <div className="flex justify-center gap-12">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCourse(null);
                      setEditForm(null);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-20 py-8 rounded-3xl text-3xl font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-28 py-8 rounded-3xl text-3xl font-bold shadow-2xl transition transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
