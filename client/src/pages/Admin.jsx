import { useEffect, useState } from "react";
import api from "../api/api";
import CourseCard from "../components/CourseCard";

export default function Admin() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses").then((res) => {
      setCourses(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Teacher Dashboard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12">
          Manage and view your courses
        </p>

        {loading ? (
          <p className="text-center text-xl">Loading courses...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {course.description}
                  </p>
                  {course.category && (
                    <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-3 py-1 rounded-full text-sm">
                      {course.category}
                    </span>
                  )}
                  <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                    <p>📚 {course.lessons?.length || 0} Lessons</p>
                    <p>👥 {course.enrolledCount || 0} Students Enrolled</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
