"use client";

import { useState, useEffect } from "react";
import {
  getItinerary,
  addActivity,
  deleteActivity,
  detectConflicts,
  groupActivitiesByDay,
  ACTIVITY_CATEGORY_LABELS,
  ACTIVITY_CATEGORY_ICONS,
  ACTIVITY_CATEGORY_COLORS,
  type Activity,
  type ActivityCategory,
  type ConflictWarning,
} from "../../lib/itinerary";

interface ItineraryPlannerProps {
  tripId: string;
  tripStartDate: string;
  tripEndDate: string;
}

const CATEGORIES = Object.keys(ACTIVITY_CATEGORY_LABELS) as ActivityCategory[];

export default function ItineraryPlanner({
  tripId,
  tripStartDate,
  tripEndDate,
}: ItineraryPlannerProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [conflicts, setConflicts] = useState<ConflictWarning[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    city: "",
    date: tripStartDate || new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    category: "sightseeing" as ActivityCategory,
    notes: "",
  });

  const refresh = () => {
    const data = getItinerary(tripId);
    setActivities(data);
    setConflicts(detectConflicts(data));
  };

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter an activity name.");
      return;
    }
    if (!form.city.trim()) {
      setFormError("Please enter a city.");
      return;
    }
    if (!form.date) {
      setFormError("Please select a date.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      setFormError("Please enter start and end times.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError("End time must be after start time.");
      return;
    }

    addActivity({
      tripId,
      name: form.name.trim(),
      city: form.city.trim(),
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      category: form.category,
      notes: form.notes.trim() || undefined,
    });

    refresh();
    setShowForm(false);
    setForm({
      name: "",
      city: "",
      date: tripStartDate || new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      category: "sightseeing",
      notes: "",
    });
  };

  const handleDelete = (activityId: string) => {
    deleteActivity(tripId, activityId);
    refresh();
  };

  const dayGroups = groupActivitiesByDay(activities, tripStartDate);

  // IDs of activities involved in any conflict
  const conflictIds = new Set(
    conflicts.flatMap((c) =>
      c.activityA.id === c.activityB.id
        ? [c.activityA.id]
        : [c.activityA.id, c.activityB.id]
    )
  );

  return (
    <div className="space-y-6">
      {/* Conflict Warnings */}
      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <h3 className="font-bold text-amber-800">
              Schedule Conflicts ({conflicts.length})
            </h3>
          </div>
          {conflicts.map((conflict, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-sm text-amber-800 bg-amber-100 rounded-lg px-3 py-2"
            >
              <span className="material-symbols-outlined text-base mt-0.5 shrink-0">
                error_outline
              </span>
              <p>{conflict.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Activity Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-5 py-2.5 font-semibold text-white text-sm transition hover:opacity-90"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Add Activity
        </button>
      </div>

      {/* Add Activity Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
        >
          <h3 className="font-bold text-[#172033]">New Activity</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Activity Name *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Eiffel Tower visit"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc] focus:ring-1 focus:ring-[#0058bc]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                City *
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Paris"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                min={tripStartDate}
                max={tripEndDate}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value as ActivityCategory })
                }
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {ACTIVITY_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any extra details..."
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
            />
          </div>

          {formError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {formError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-[#0058bc] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004ca0] transition"
            >
              Save Activity
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setFormError("");
              }}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {dayGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300">
            event_note
          </span>
          <h3 className="mt-4 text-xl font-bold text-[#172033]">
            No activities yet
          </h3>
          <p className="mt-2 text-slate-500 text-sm">
            Start building your itinerary by adding your first activity.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {dayGroups.map((day) => (
            <div key={day.date}>
              {/* Day Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0058bc] text-white">
                  <span className="material-symbols-outlined text-sm">
                    calendar_today
                  </span>
                </div>
                <div>
                  <p className="font-bold text-[#172033] text-sm uppercase tracking-wide">
                    {day.label}
                  </p>
                </div>
              </div>

              {/* Activity Cards (Timeline) */}
              <div className="relative ml-4 pl-6 border-l-2 border-slate-200 space-y-3">
                {day.activities.map((activity) => {
                  const color = ACTIVITY_CATEGORY_COLORS[activity.category];
                  const isConflict = conflictIds.has(activity.id);

                  return (
                    <div key={activity.id} className="relative group">
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[25px] top-4 h-4 w-4 rounded-full border-2 border-white"
                        style={{ backgroundColor: color }}
                      />

                      <div
                        className={`rounded-xl border bg-white p-4 transition hover:shadow-md ${
                          isConflict
                            ? "border-amber-300 bg-amber-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className="flex h-8 w-8 shrink-0 mt-0.5 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${color}18` }}
                            >
                              <span
                                className="material-symbols-outlined text-sm"
                                style={{ color }}
                              >
                                {ACTIVITY_CATEGORY_ICONS[activity.category]}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-[#172033]">
                                  {activity.name}
                                </p>
                                {isConflict && (
                                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                    <span className="material-symbols-outlined text-xs">
                                      warning
                                    </span>
                                    Conflict
                                  </span>
                                )}
                              </div>

                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    schedule
                                  </span>
                                  {activity.startTime} – {activity.endTime}
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    location_on
                                  </span>
                                  {activity.city}
                                </span>
                                <span
                                  className="rounded-full px-2 py-0.5 text-xs font-medium"
                                  style={{
                                    backgroundColor: `${color}15`,
                                    color,
                                  }}
                                >
                                  {ACTIVITY_CATEGORY_LABELS[activity.category]}
                                </span>
                              </div>

                              {activity.notes && (
                                <p className="mt-1.5 text-xs text-slate-400 italic">
                                  {activity.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(activity.id)}
                            className="opacity-0 group-hover:opacity-100 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                            title="Delete activity"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
