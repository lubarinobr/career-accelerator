// SP3-06 — Streak engine
// Pure functions, no DB calls. Unit tested.
// Streak rules (architecture.md 4.3):
//   - A "day" = user's local timezone
//   - Streak breaks if lastActiveDate < yesterday AND no freeze applied
//   - Active today = at least 1 completed lesson (5 questions) per Q15
//   - currentStreak includes today (Duolingo pattern, per D1-S3-Q3)

/**
 * StreakResult — returned by calculateStreak()
 * The `action` field tells the caller what DB write to perform:
 *   - "none": no changes needed (already active today)
 *   - "increment": user completed a lesson today, increment streak
 *   - "apply_freeze": user missed exactly 1 day, a freeze can save the streak
 *   - "reset": streak is broken (missed 2+ days or missed 1 day with no freeze)
 */
export type StreakAction = "none" | "increment" | "apply_freeze" | "reset";

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  action: StreakAction;
}

/**
 * Calculate the streak state based on the user's last active date and today's date.
 * Pure function — does not touch the DB.
 *
 * @param lastActiveDate - The last date the user completed a lesson (null if never)
 * @param today - Today's date string in YYYY-MM-DD format (user's local timezone)
 * @param currentStreak - Current streak count from DB
 * @param longestStreak - Longest streak count from DB
 * @param freezeUsedDate - Last date a freeze was consumed (null if never)
 * @param hasFreezesAvailable - Whether the user has streak freezes to use
 */
export function calculateStreak(
  lastActiveDate: string | null,
  today: string,
  currentStreak: number,
  longestStreak: number,
  freezeUsedDate: string | null,
  hasFreezesAvailable: boolean,
): StreakResult {
  // First time ever — no previous activity
  if (!lastActiveDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(1, longestStreak),
      isActive: true,
      action: "increment",
    };
  }

  // Already active today — no change
  if (lastActiveDate === today) {
    return {
      currentStreak,
      longestStreak,
      isActive: true,
      action: "none",
    };
  }

  const daysDiff = diffDays(lastActiveDate, today);

  // Consecutive day — increment streak
  if (daysDiff === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, longestStreak),
      isActive: true,
      action: "increment",
    };
  }

  // Missed exactly 1 day — freeze can save it
  if (daysDiff === 2) {
    // Check if freeze was already used for yesterday
    const yesterday = addDays(today, -1);
    if (freezeUsedDate === yesterday) {
      // Freeze already applied for yesterday, treat as consecutive
      const newStreak = currentStreak + 1;
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, longestStreak),
        isActive: true,
        action: "increment",
      };
    }

    if (hasFreezesAvailable) {
      return {
        currentStreak: currentStreak + 1,
        longestStreak: Math.max(currentStreak + 1, longestStreak),
        isActive: true,
        action: "apply_freeze",
      };
    }

    // No freeze available — streak breaks
    return {
      currentStreak: 1,
      longestStreak,
      isActive: true,
      action: "reset",
    };
  }

  // Missed 2+ days — streak breaks regardless of freezes
  return {
    currentStreak: 1,
    longestStreak,
    isActive: true,
    action: "reset",
  };
}

/**
 * Get the user's local date string (YYYY-MM-DD) from an IANA timezone.
 * Falls back to UTC if timezone is invalid.
 */
export function getLocalDate(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    // Invalid timezone — fall back to UTC
    const now = new Date();
    return now.toISOString().split("T")[0];
  }
}

/** Calculate the number of days between two YYYY-MM-DD date strings */
function diffDays(from: string, to: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const fromDate = new Date(from + "T00:00:00Z");
  const toDate = new Date(to + "T00:00:00Z");
  return Math.round((toDate.getTime() - fromDate.getTime()) / msPerDay);
}

/** Add days to a YYYY-MM-DD date string, returns YYYY-MM-DD */
function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00Z");
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split("T")[0];
}
