"use client";

import { useEffect, useRef } from "react";
import { type Trip } from "../../lib/mockData";
import { getBudgetSummary } from "../../lib/budget";
import { getItinerary, groupActivitiesByDay } from "../../lib/itinerary";

interface ShareModalProps {
  trip: Trip;
  onClose: () => void;
}

export default function ShareModal({ trip, onClose }: ShareModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // -------------------------------------------------------
  // Build shareable text summary
  // -------------------------------------------------------
  const buildSummaryText = (): string => {
    const fmt = (d: string) =>
      new Date(d + "T00:00:00").toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    const summary = getBudgetSummary(trip.id, trip.budget);
    const activities = getItinerary(trip.id);
    const days = groupActivitiesByDay(activities, trip.startDate);

    let text = `✈️ ${trip.name}\n`;
    text += `${"═".repeat(40)}\n`;
    text += `📅 ${fmt(trip.startDate)} → ${fmt(trip.endDate)}\n`;
    text += `📍 ${trip.cities.join(", ")}\n`;
    if (trip.description) text += `📝 ${trip.description}\n`;
    text += `\n`;

    text += `💰 BUDGET\n`;
    text += `─────────────────────\n`;
    text += `Total Budget: $${trip.budget.toLocaleString()}\n`;
    text += `Total Spent:  $${summary.totalSpent.toLocaleString()}\n`;
    text += `Remaining:    $${summary.remaining.toLocaleString()}\n`;
    text += `Used:         ${summary.percentUsed}%\n`;
    text += `\n`;

    if (days.length > 0) {
      text += `🗓️ ITINERARY\n`;
      text += `─────────────────────\n`;
      for (const day of days) {
        text += `\n${day.label.toUpperCase()}\n`;
        for (const act of day.activities) {
          text += `  ${act.startTime}–${act.endTime}  ${act.name}`;
          if (act.city) text += ` (${act.city})`;
          text += `\n`;
        }
      }
      text += `\n`;
    }

    text += `─────────────────────\n`;
    text += `Shared via GlobeTrotter 🌍\n`;

    return text;
  };

  const shareLink = `${typeof window !== "undefined" ? window.location.origin : "https://globetrotter.app"}/trips/${trip.id}`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(buildSummaryText());
      showToast("Summary copied to clipboard!");
    } catch {
      showToast("Failed to copy. Please copy manually.");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      showToast("Link copied to clipboard!");
    } catch {
      showToast("Failed to copy. Please copy manually.");
    }
  };

  const showToast = (msg: string) => {
    const toast = document.createElement("div");
    toast.textContent = msg;
    toast.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] rounded-xl bg-[#172033] text-white px-6 py-3 text-sm font-semibold shadow-xl transition-opacity";
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  const summary = getBudgetSummary(trip.id, trip.budget);
  const activities = getItinerary(trip.id);
  const days = groupActivitiesByDay(activities, trip.startDate);

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0058bc]">
              share
            </span>
            <h2 className="font-bold text-[#172033]">Share Trip</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Trip Overview */}
          <div className="rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
              Trip Summary
            </p>
            <h3 className="text-2xl font-bold">{trip.name}</h3>
            <p className="mt-1 text-sm text-white/80">
              {fmt(trip.startDate)} → {fmt(trip.endDate)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {trip.cities.map((city) => (
                <span
                  key={city}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>

          {/* Budget Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Budget
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="font-bold text-[#172033]">
                  ${summary.totalBudget.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Spent</p>
                <p className="font-bold text-[#172033]">
                  ${summary.totalSpent.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Used</p>
                <p className="font-bold text-[#0058bc]">
                  {summary.percentUsed}%
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0058bc] to-[#00b4d8]"
                style={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
              />
            </div>
          </div>

          {/* Itinerary Preview */}
          {days.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Itinerary Preview
              </p>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {days.map((day) => (
                  <div key={day.date}>
                    <p className="text-xs font-bold text-slate-600 mb-1">
                      {day.label}
                    </p>
                    <div className="space-y-1 pl-2">
                      {day.activities.map((act) => (
                        <p key={act.id} className="text-xs text-slate-500">
                          {act.startTime} — {act.name}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share Link */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Share Link
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="material-symbols-outlined text-slate-400 text-sm">
                link
              </span>
              <p className="flex-1 text-xs text-slate-500 truncate font-mono">
                {shareLink}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopySummary}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-5 py-3 font-semibold text-white text-sm transition hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">
              content_copy
            </span>
            Copy Trip Summary
          </button>

          <button
            onClick={handleCopyLink}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-[#172033] text-sm transition hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-sm">link</span>
            Copy Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
