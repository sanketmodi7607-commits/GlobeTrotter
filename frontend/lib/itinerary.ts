// ============================================================
// ITINERARY TYPES & STORAGE HELPERS
// Replace these functions with API calls when the backend is ready.
// ============================================================

export type ActivityCategory =
  | "sightseeing"
  | "food"
  | "transport"
  | "accommodation"
  | "adventure"
  | "culture"
  | "shopping"
  | "other";

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  city: string;
  date: string; // ISO date YYYY-MM-DD
  startTime: string; // HH:MM (24-hour)
  endTime: string; // HH:MM (24-hour)
  category: ActivityCategory;
  notes?: string;
  createdAt: string;
}

export interface ConflictWarning {
  activityA: Activity;
  activityB: Activity;
  message: string;
}

const STORAGE_KEY = "globetrotter_itineraries";

// -------------------------------------------------------
// Storage helpers
// -------------------------------------------------------

function getAllItineraries(): Record<string, Activity[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllItineraries(data: Record<string, Activity[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// -------------------------------------------------------
// Public API (mirrors future backend API shape)
// -------------------------------------------------------

export function getItinerary(tripId: string): Activity[] {
  const all = getAllItineraries();
  return all[tripId] ?? [];
}

export function saveItinerary(tripId: string, activities: Activity[]): void {
  const all = getAllItineraries();
  all[tripId] = activities;
  saveAllItineraries(all);
}

export function addActivity(
  activity: Omit<Activity, "id" | "createdAt">
): Activity {
  const newActivity: Activity = {
    ...activity,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const existing = getItinerary(activity.tripId);
  const sorted = [...existing, newActivity].sort(
    (a, b) =>
      new Date(`${a.date}T${a.startTime}`).getTime() -
      new Date(`${b.date}T${b.startTime}`).getTime()
  );
  saveItinerary(activity.tripId, sorted);
  return newActivity;
}

export function deleteActivity(tripId: string, activityId: string): void {
  const existing = getItinerary(tripId);
  saveItinerary(
    tripId,
    existing.filter((a) => a.id !== activityId)
  );
}

// -------------------------------------------------------
// Conflict detection
// -------------------------------------------------------

/** Convert "HH:MM" to minutes since midnight */
function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function detectConflicts(activities: Activity[]): ConflictWarning[] {
  const warnings: ConflictWarning[] = [];

  for (let i = 0; i < activities.length; i++) {
    const a = activities[i];

    // End before start
    if (toMinutes(a.endTime) <= toMinutes(a.startTime)) {
      warnings.push({
        activityA: a,
        activityB: a,
        message: `"${a.name}" has an end time before or equal to its start time.`,
      });
      continue;
    }

    for (let j = i + 1; j < activities.length; j++) {
      const b = activities[j];

      // Only compare activities on the same date
      if (a.date !== b.date) continue;

      const aStart = toMinutes(a.startTime);
      const aEnd = toMinutes(a.endTime);
      const bStart = toMinutes(b.startTime);
      const bEnd = toMinutes(b.endTime);

      // Overlap check: A starts before B ends AND B starts before A ends
      if (aStart < bEnd && bStart < aEnd) {
        warnings.push({
          activityA: a,
          activityB: b,
          message: `"${a.name}" overlaps with "${b.name}" (${a.startTime}–${a.endTime} vs ${b.startTime}–${b.endTime}).`,
        });
      }
    }
  }

  return warnings;
}

// -------------------------------------------------------
// Grouping helper
// -------------------------------------------------------

export interface DayGroup {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Day 1 — Paris, Rome"
  activities: Activity[];
}

export function groupActivitiesByDay(
  activities: Activity[],
  tripStartDate?: string
): DayGroup[] {
  const map = new Map<string, Activity[]>();

  for (const activity of activities) {
    const existing = map.get(activity.date) ?? [];
    map.set(activity.date, [...existing, activity]);
  }

  const sortedDates = Array.from(map.keys()).sort();

  return sortedDates.map((date, index) => {
    const dayActivities = map.get(date)!.sort(
      (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
    );

    let dayNumber = index + 1;
    if (tripStartDate) {
      const start = new Date(tripStartDate);
      const current = new Date(date);
      const diff = Math.round(
        (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      dayNumber = diff + 1;
    }

    const cities = [...new Set(dayActivities.map((a) => a.city))];
    const formattedDate = new Date(date + "T00:00:00").toLocaleDateString(
      "en-US",
      { weekday: "long", month: "short", day: "numeric" }
    );

    return {
      date,
      label: `Day ${dayNumber} — ${cities.join(", ")} · ${formattedDate}`,
      activities: dayActivities,
    };
  });
}

// -------------------------------------------------------
// Category metadata
// -------------------------------------------------------

export const ACTIVITY_CATEGORY_LABELS: Record<ActivityCategory, string> = {
  sightseeing: "Sightseeing",
  food: "Food & Dining",
  transport: "Transport",
  accommodation: "Check-in/out",
  adventure: "Adventure",
  culture: "Culture",
  shopping: "Shopping",
  other: "Other",
};

export const ACTIVITY_CATEGORY_ICONS: Record<ActivityCategory, string> = {
  sightseeing: "photo_camera",
  food: "restaurant",
  transport: "directions_car",
  accommodation: "hotel",
  adventure: "hiking",
  culture: "museum",
  shopping: "shopping_bag",
  other: "category",
};

export const ACTIVITY_CATEGORY_COLORS: Record<ActivityCategory, string> = {
  sightseeing: "#0058bc",
  food: "#f59e0b",
  transport: "#6b7280",
  accommodation: "#8b5cf6",
  adventure: "#10b981",
  culture: "#ef4444",
  shopping: "#ec4899",
  other: "#9ca3af",
};

// -------------------------------------------------------
// Next activity helper (used by dashboard)
// -------------------------------------------------------

export function getNextActivity(tripId: string): Activity | null {
  const activities = getItinerary(tripId);
  const now = new Date();

  const upcoming = activities
    .filter((a) => {
      const activityTime = new Date(`${a.date}T${a.startTime}`);
      return activityTime > now;
    })
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.startTime}`).getTime() -
        new Date(`${b.date}T${b.startTime}`).getTime()
    );

  return upcoming[0] ?? null;
}
