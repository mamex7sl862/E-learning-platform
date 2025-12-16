export default function ProgressBar({ completed, total }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div
        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
        style={{ width: `${percentage}%` }}
      >
        <span className="text-white text-xs font-semibold">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
