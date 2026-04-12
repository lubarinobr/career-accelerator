"use client";

interface XPBarProps {
  currentXp: number;
  nextLevelXp: number;
  title: string;
}

export function XPBar({ currentXp, nextLevelXp, title }: XPBarProps) {
  const percentage =
    nextLevelXp > 0 ? Math.min((currentXp / nextLevelXp) * 100, 100) : 100;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">XP Progress</span>
        <span className="text-sm font-semibold text-blue-600">
          {currentXp} / {nextLevelXp} XP
        </span>
      </div>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-3 rounded-full bg-blue-500 transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-400">Next level: {title}</p>
    </div>
  );
}
