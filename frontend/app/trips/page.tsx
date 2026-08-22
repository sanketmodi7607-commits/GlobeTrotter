"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteTrip, getTrips, type Trip } from "../../lib/mockData";
import { getBudgetSummary } from "../../lib/budget";
import { getItinerary, detectConflicts } from "../../lib/itinerary";

export default function TripsListPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "draft">("all");

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    if (loggedIn !== "true") {
      router.push("/");
      return;
    }
    setTrips(getTrips());
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058bc]/20 border-t-[#0058bc]" />
      </main>
    );
  }

  const filtered =
    filter === "all" ? trips : trips.filter((t) => t.status === filter);

  const handleDelete = (trip: Trip) => {
    if (!window.confirm(`Delete “${trip.name}”? This cannot be undone.`)) return;
    deleteTrip(trip.id);
    setTrips((current) => current.filter((item) => item.id !== trip.id));
  };

  const fmt = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <span className="text-xl font-bold text-[#0058bc]">GlobeTrotter</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/dashboard" className="text-slate-600 hover:text-[#0058bc]">
              Dashboard
            </Link>
            <Link href="/trips" className="font-semibold text-[#0058bc]">
              My Trips
            </Link>
          </nav>

          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-5 py-2.5 font-semibold text-white text-sm shadow-lg shadow-[#0058bc]/20 transition hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Trip
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Title */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0058bc]">
            Your journeys
          </p>
          <h1 className="mt-2 text-4xl font-bold">My Trips</h1>
          <p className="mt-2 text-slate-500">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} planned
          </p>
        </div>

        {/* Filter Pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "upcoming", "completed", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                filter === f
                  ? "bg-[#0058bc] text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-[#0058bc] hover:text-[#0058bc]"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
            <span className="material-symbols-outlined text-5xl text-slate-300">
              travel_explore
            </span>
            <h3 className="mt-4 text-xl font-bold">No trips found</h3>
            <p className="mt-2 text-slate-500">
              {filter === "all"
                ? "Start planning your first adventure."
                : `You have no ${filter} trips.`}
            </p>
            <Link
              href="/trips/new"
              className="mt-5 inline-flex rounded-xl bg-[#0058bc] px-6 py-3 font-semibold text-white"
            >
              Create a trip
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((trip) => (
              <TripCard key={trip.id} trip={trip} fmt={fmt} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function TripCard({
  trip,
  fmt,
  onDelete,
}: {
  trip: Trip;
  fmt: (d: string) => string;
  onDelete: (trip: Trip) => void;
}) {
  const summary = getBudgetSummary(trip.id, trip.budget);
  const budgetPct = summary.percentUsed;
  const acts = getItinerary(trip.id);
  const conflictCount = detectConflicts(acts).length;


  return (
    <article
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Cover image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[#172033]">
            {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
          </span>
          {conflictCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
              ⚠ {conflictCount}
            </span>
          )}
          {budgetPct >= 80 && (
            <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
              {budgetPct}% used
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/trips/${trip.id}`} className="min-w-0">
            <h3 className="font-bold text-[#172033]">{trip.name}</h3>
            <p className="mt-1 text-xs text-slate-400">
              {fmt(trip.startDate)} – {fmt(trip.endDate)}
            </p>
          </Link>
          <Link href={`/trips/${trip.id}`} aria-label={`View ${trip.name}`} className="shrink-0">
            <span className="material-symbols-outlined text-slate-300 group-hover:text-[#0058bc] transition">arrow_forward</span>
          </Link>
        </div>

        {/* Cities */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trip.cities.slice(0, 3).map((city) => (
            <span
              key={city}
              className="rounded-full bg-[#e8f0ff] px-2.5 py-0.5 text-xs font-medium text-[#0058bc]"
            >
              {city}
            </span>
          ))}
          {trip.cities.length > 3 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
              +{trip.cities.length - 3}
            </span>
          )}
        </div>

        {/* Budget bar */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Budget</span>
            <span className="font-semibold text-[#172033]">
              ${trip.budget.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all ${
                budgetPct >= 100
                  ? "bg-red-500"
                  : budgetPct >= 80
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-[#0058bc] to-[#00b4d8]"
              }`}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Link
            href={`/trips/${trip.id}/edit`}
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-600 hover:border-[#0058bc] hover:text-[#0058bc]"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={() => onDelete(trip)}
            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
