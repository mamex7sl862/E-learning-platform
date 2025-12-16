// src/pages/Courses.jsx
import { useState, useEffect } from "react";
import api from "../api/api";
import CourseCard from "../components/CourseCard";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch all courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
          Available Tech Courses
        </h1>
        <p className="text-center text-lg text-gray-600 dark:text-gray-400 mb-12">
          Master modern web development with hands-on courses
        </p>

        {/* Search Bar + Category Filter */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses by title or description..."
            className="flex-1 px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 transition"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-6 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
          >
            <option value="All">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Full Stack">Full Stack</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Database">Database</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              Loading courses...
            </p>
          </div>
        )}

        {/* No Courses Found */}
        {!loading && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-600 dark:text-gray-400">
              {search || selectedCategory !== "All"
                ? "No courses match your search."
                : "No courses available yet."}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Courses Grid */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onEnroll={async (id) => {
                  try {
                    await api.post(`/enrollments/${id}`);
                    alert("Enrolled successfully! Check your dashboard.");
                  } catch (err) {
                    alert(
                      "Enrollment failed: " +
                        (err.response?.data?.message || "Unknown error")
                    );
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
