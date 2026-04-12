"use client";

interface LevelBadgeProps {
  level: number;
  title: string;
}

export function LevelBadge({ level, title }: LevelBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold text-purple-700">
      Lv. {level} — {title}
    </span>
  );
}
