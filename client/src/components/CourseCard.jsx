// src/components/CourseCard.jsx
import { Link } from "react-router-dom";

export default function CourseCard({ course, onEnroll }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Course Header Thumbnail */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-center">
        <div className="text-white text-5xl font-bold opacity-50">
          {course.title.substring(0, 2).toUpperCase()}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {course.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {course.description}
        </p>

        {course.instructor && (
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-3">
            👨‍🏫 {course.instructor}
          </p>
        )}

        {course.category && (
          <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-4 py-1 rounded-full text-sm font-medium mb-6">
            {course.category}
          </span>
        )}

        <button
          onClick={() => onEnroll(course._id)}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition text-lg"
        >
          Enroll Now
        </button>
      </div>
    </div>
  );
}
