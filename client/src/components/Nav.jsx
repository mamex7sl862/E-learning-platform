// src/components/Nav.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
} from "lucide-react";

// Helper to get user role from token
const getUserRole = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role;
  } catch {
    return null;
  }
};

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const role = getUserRole();

  const isLoggedIn = !!localStorage.getItem("token");

  // Load saved theme on initial mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Sync darkMode state changes with HTML class and localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
    setMobileMenuOpen(false);
  };

  if (!isLoggedIn) return null;

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/courses", label: "Courses", icon: BookOpen },
  ];

  // Add "Create Course" link only for teachers
  if (role === "teacher") {
    navItems.push({
      to: "/teacher",
      label: "Create Course",
      icon: GraduationCap,
    });
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>

            <Link
              to="/dashboard"
              className="ml-4 md:ml-0 text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
            >
              MTechHub
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-md"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={toggleDarkMode}
              className="ml-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-500" />
              ) : (
                <Moon size={20} />
              )}
            </button>

            <button
              onClick={logout}
              className="ml-4 flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-medium transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                MTechHub
              </h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={28} />
              </button>
            </div>

            <div className="space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-4 px-5 py-4 rounded-xl font-medium transition-all ${
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Icon size={24} />
                    <span className="text-lg">{item.label}</span>
                  </Link>
                );
              })}

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-4 w-full px-5 py-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {darkMode ? (
                    <Sun size={24} className="text-yellow-500" />
                  ) : (
                    <Moon size={24} />
                  )}
                  <span className="text-lg">
                    {darkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>

                <button
                  onClick={logout}
                  className="flex items-center space-x-4 w-full px-5 py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition mt-4"
                >
                  <LogOut size={24} />
                  <span className="text-lg">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
