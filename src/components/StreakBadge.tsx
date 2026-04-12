"use client";

interface StreakBadgeProps {
  currentStreak: number;
  isActive: boolean;
}

export function StreakBadge({ currentStreak, isActive }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      {/* Flame icon */}
      <div className={isActive ? "animate-pulse-flame" : ""}>
        <svg
          className={`h-12 w-12 ${isActive ? "text-orange-500" : "text-gray-300"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.07 2.31-6.64 4.39-9.15a.75.75 0 0 1 1.22.12c.63 1.16 1.6 2.42 2.68 2.79.08-1.8.73-4.47 2.55-6.62a.75.75 0 0 1 1.24.16C16.57 5.2 21 10.3 21 15c0 4.42-4.03 8-9 8Zm-1.4-8.57c-.36 1.05-.18 2.17.5 3.07.9 1.2 2.52 1.7 3.94 1.2.47-.16.9-.43 1.24-.78C17.32 19.84 14.8 21 12 21c-3.86 0-7-2.69-7-6 0-2.24 1.58-5.06 3.42-7.3.1.48.33.92.69 1.27.84.84 2.1 1.12 3.23.82a3.5 3.5 0 0 1-1.74 4.64Z" />
        </svg>
      </div>

      <div>
        <p className="text-3xl font-bold text-gray-900">
          {currentStreak}
        </p>
        <p className="text-sm text-gray-500">
          {currentStreak === 1 ? "day streak" : "day streak"}
        </p>
      </div>
    </div>
  );
}
