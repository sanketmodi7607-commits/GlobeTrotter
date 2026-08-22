"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getTrip, type Trip } from "../../../lib/mockData";
import { getBudgetSummary } from "../../../lib/budget";
import { getItinerary, detectConflicts } from "../../../lib/itinerary";
import BudgetTracker from "../../components/BudgetTracker";
import ItineraryPlanner from "../../components/ItineraryPlanner";
import ShareModal from "../../components/ShareModal";

type Tab = "overview" | "itinerary" | "budget";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    if (loggedIn !== "true") {
      router.push("/");
      return;
    }

    const found = getTrip(tripId);
    if (!found) {
      router.push("/dashboard");
      return;
    }

    setTrip(found);
    setLoading(false);
  }, [tripId, router]);

  const activities = trip ? getItinerary(trip.id) : [];
  const conflictCount = detectConflicts(activities).length;
  const budgetSummary = trip ? getBudgetSummary(trip.id, trip.budget) : null;
  const budgetPercent = budgetSummary ? budgetSummary.percentUsed : 0;


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058bc]/20 border-t-[#0058bc]" />
      </main>
    );
  }

  if (!trip) return null;

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const handleExport = () => {
    window.print();
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "info" },
    { key: "itinerary", label: "Itinerary", icon: "event_note" },
    { key: "budget", label: "Budget", icon: "payments" },
  ];

  return (
    <>
      {/* Print-only header injected via CSS class */}
      <div className="print-only-header hidden">
        <div style={{ padding: "24px 32px", borderBottom: "2px solid #0058bc" }}>
          <p style={{ fontSize: "24px", fontWeight: "bold", color: "#0058bc" }}>
            ✈ GlobeTrotter
          </p>
          <h1 style={{ fontSize: "32px", fontWeight: "bold", marginTop: "8px" }}>
            {trip.name}
          </h1>
          <p style={{ color: "#666", marginTop: "4px" }}>
            {fmt(trip.startDate)} → {fmt(trip.endDate)} · {trip.cities.join(", ")}
          </p>
        </div>
      </div>

      <main className="min-h-screen bg-[#f7f9fc] text-[#172033] print:bg-white">
        {/* NAVBAR — hidden on print */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-slate-500 hover:text-[#0058bc] transition"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>

            <span className="text-slate-300">/</span>

            <span className="text-sm font-semibold text-[#172033] truncate">
              {trip.name}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#172033] transition hover:border-[#0058bc] hover:text-[#0058bc]"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Share
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <span className="material-symbols-outlined text-sm">
                  print
                </span>
                Export
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-6 py-8 print:px-0 print:py-4">
          {/* TRIP HEADER */}
          <div className="relative mb-8 overflow-hidden rounded-2xl print:rounded-none print:mb-4">
            <img
              src={trip.coverImage}
              alt={trip.name}
              className="h-56 w-full object-cover print:h-32"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 print:p-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span
                    className={`mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      trip.status === "upcoming"
                        ? "bg-emerald-500 text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </span>
                  <h1 className="text-3xl font-bold text-white print:text-2xl">
                    {trip.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">
                        calendar_month
                      </span>
                      {fmt(trip.startDate)} → {fmt(trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      {trip.cities.join(", ")}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block text-right print:hidden">
                  <p className="text-xs text-white/60">Total Budget</p>
                  <p className="text-2xl font-bold text-white">
                    ${trip.budget.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TABS — hidden on print */}
          <div className="mb-6 flex gap-1 rounded-xl bg-white border border-slate-200 p-1 print:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-[#0058bc] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tab.icon}
                </span>
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Badges */}
                {tab.key === "itinerary" && conflictCount > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                    {conflictCount}
                  </span>
                )}
                {tab.key === "budget" && budgetPercent >= 80 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    !
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB CONTENT */}
          {/* Overview Tab */}
          {(activeTab === "overview" || true) && (
            <div className={activeTab === "overview" ? "block print:block" : "hidden print:block"}>
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left: Description + quick info */}
                <div className="lg:col-span-2 space-y-5">
                  {trip.description && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                      <h2 className="mb-3 font-bold text-[#172033]">About this trip</h2>
                      <p className="text-slate-600 leading-relaxed">
                        {trip.description}
                      </p>
                    </div>
                  )}

                  {/* Cities */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="mb-3 font-bold text-[#172033]">Cities</h2>
                    <div className="flex flex-wrap gap-2">
                      {trip.cities.map((city) => (
                        <span
                          key={city}
                          className="flex items-center gap-1.5 rounded-xl bg-[#e8f0ff] px-4 py-2 text-sm font-semibold text-[#0058bc]"
                        >
                          <span className="material-symbols-outlined text-sm">
                            location_on
                          </span>
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Budget compact on overview */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="font-bold text-[#172033]">Budget</h2>
                      <button
                        onClick={() => setActiveTab("budget")}
                        className="text-xs font-semibold text-[#0058bc] hover:underline print:hidden"
                      >
                        Manage →
                      </button>
                    </div>
                    <BudgetTracker
                      tripId={trip.id}
                      totalBudget={trip.budget}
                      compact
                    />
                  </div>
                </div>

                {/* Right: Quick facts */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 font-bold text-[#172033]">Trip Details</h3>
                    <div className="space-y-3">
                      <Detail
                        icon="calendar_month"
                        label="Start"
                        value={fmt(trip.startDate)}
                      />
                      <Detail
                        icon="event"
                        label="End"
                        value={fmt(trip.endDate)}
                      />
                      <Detail
                        icon="schedule"
                        label="Duration"
                        value={`${
                          Math.round(
                            (new Date(trip.endDate).getTime() -
                              new Date(trip.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        } days`}
                      />
                      <Detail
                        icon="location_city"
                        label="Cities"
                        value={String(trip.cities.length)}
                      />
                      <Detail
                        icon="payments"
                        label="Budget"
                        value={`$${trip.budget.toLocaleString()}`}
                      />
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 print:hidden">
                    <h3 className="mb-3 font-bold text-[#172033]">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setActiveTab("itinerary")}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium text-slate-700 transition hover:bg-[#e8f0ff] hover:text-[#0058bc]"
                      >
                        <span className="material-symbols-outlined text-sm text-[#0058bc]">
                          add_circle
                        </span>
                        Add activity
                      </button>
                      <button
                        onClick={() => setActiveTab("budget")}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium text-slate-700 transition hover:bg-[#e8f0ff] hover:text-[#0058bc]"
                      >
                        <span className="material-symbols-outlined text-sm text-[#0058bc]">
                          receipt_long
                        </span>
                        Track expense
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium text-slate-700 transition hover:bg-[#e8f0ff] hover:text-[#0058bc]"
                      >
                        <span className="material-symbols-outlined text-sm text-[#0058bc]">
                          share
                        </span>
                        Share trip
                      </button>
                      <button
                        onClick={handleExport}
                        className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium text-slate-700 transition hover:bg-[#e8f0ff] hover:text-[#0058bc]"
                      >
                        <span className="material-symbols-outlined text-sm text-[#0058bc]">
                          print
                        </span>
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Itinerary Tab */}
          {activeTab === "itinerary" && (
            <div className="print:hidden">
              <ItineraryPlanner
                tripId={trip.id}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === "budget" && (
            <div className="print:hidden">
              <BudgetTracker
                tripId={trip.id}
                totalBudget={trip.budget}
              />
            </div>
          )}

          {/* PRINT ONLY: Itinerary + Budget */}
          <div className="hidden print:block mt-8 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[#172033] mb-4 border-b pb-2">
                Itinerary
              </h2>
              <ItineraryPlanner
                tripId={trip.id}
                tripStartDate={trip.startDate}
                tripEndDate={trip.endDate}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#172033] mb-4 border-b pb-2">
                Budget
              </h2>
              <BudgetTracker tripId={trip.id} totalBudget={trip.budget} />
            </div>
          </div>
        </div>
      </main>

      {showShareModal && (
        <ShareModal trip={trip} onClose={() => setShowShareModal(false)} />
      )}
    </>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {label}
      </div>
      <span className="text-sm font-semibold text-[#172033]">{value}</span>
    </div>
  );
}
