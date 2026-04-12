"use client";

interface XPBarProps {
  currentXp: number;
  nextLevelXp: number;
  title: string;
}

export function XPBar({ currentXp, nextLevelXp, title }: XPBarProps) {
  const percentage =
    nextLevelXp > 0 ? Math.min((currentXp / nextLevelXp) * 100, 100) : 100;
  const isCloseToLevelUp = percentage >= 80;

  return (
    <div
      className={`rounded-xl bg-white p-4 shadow-sm ring-1 ${
        isCloseToLevelUp ? "ring-yellow-300" : "ring-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">
          {isCloseToLevelUp ? "Almost there!" : "XP Progress"}
        </span>
        <span
          className={`text-sm font-semibold ${isCloseToLevelUp ? "text-yellow-600" : "text-blue-600"}`}
        >
          {currentXp} / {nextLevelXp} XP
        </span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-3 rounded-full transition-all duration-700 ease-out ${
            isCloseToLevelUp
              ? "bg-gradient-to-r from-yellow-400 to-orange-500"
              : "bg-blue-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-gray-400">Next level: {title}</p>
        {isCloseToLevelUp && (
          <p className="text-xs font-semibold text-yellow-600">
            {nextLevelXp - currentXp} XP to go!
          </p>
        )}
      </div>
    </div>
  );
}
