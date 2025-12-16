// src/components/LessonList.jsx
export default function LessonList({
  lessons,
  completedLessons,
  onMarkComplete,
}) {
  const getEmbed = (url) => {
    if (!url || typeof url !== "string") return null;

    const trimmed = url.trim();

    // YouTube full watch URL -> embed
    if (trimmed.includes("watch?v=")) {
      return { type: "iframe", src: trimmed.replace("watch?v=", "embed/") };
    }

    // youtu.be short link
    if (trimmed.includes("youtu.be/")) {
      return {
        type: "iframe",
        src: trimmed.replace("youtu.be/", "www.youtube.com/embed/"),
      };
    }

    // Already an embed link
    if (trimmed.includes("/embed/")) {
      return { type: "iframe", src: trimmed };
    }

    // Google Drive share -> preview embed
    const driveMatch = trimmed.match(
      /drive.google.com\/(file\/d\/|open\?id=)([A-Za-z0-9_-]+)/
    );
    if (driveMatch) {
      const id = driveMatch[2];
      return {
        type: "iframe",
        src: `https://drive.google.com/file/d/${id}/preview`,
      };
    }

    // Direct mp4 link -> use HTML5 video
    if (trimmed.endsWith(".mp4") || trimmed.includes(".mp4?")) {
      return { type: "video", src: trimmed };
    }

    // Unknown format -> return original for iframe attempt
    return { type: "iframe", src: trimmed };
  };
  return (
    <div className="space-y-6">
      {lessons.map((lesson, index) => {
        const isCompleted = completedLessons.includes(String(lesson._id));

        return (
          <div
            key={lesson._id}
            className={`p-6 rounded-2xl border-2 shadow-lg transition-all ${
              isCompleted
                ? "bg-green-50 dark:bg-green-900/30 border-green-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            }`}
          >
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-4">
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-2">
                  Lesson {index + 1}: {lesson.title}
                </h4>
                {lesson.notes && (
                  <p className="text-gray-700 dark:text-gray-300">
                    {lesson.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => onMarkComplete(lesson._id)}
                disabled={isCompleted}
                className={`px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition ${
                  isCompleted
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90"
                }`}
              >
                {isCompleted ? "✓ Completed" : "Mark Complete"}
              </button>
            </div>

            {lesson.videoUrl &&
              (() => {
                const embed = getEmbed(lesson.videoUrl);
                if (!embed) return null;

                if (embed.type === "video") {
                  return (
                    <div
                      className="relative w-full"
                      style={{ paddingBottom: "56.25%" }}
                    >
                      <video
                        src={embed.src}
                        title={lesson.title}
                        className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                        controls
                      />
                    </div>
                  );
                }

                return (
                  <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                  >
                    <iframe
                      src={embed.src}
                      title={lesson.title}
                      className="absolute top-0 left-0 w-full h-full rounded-xl shadow-2xl"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                );
              })()}
          </div>
        );
      })}
    </div>
  );
}
