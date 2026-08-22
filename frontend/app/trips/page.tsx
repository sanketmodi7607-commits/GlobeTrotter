"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTrips as getLocalTrips, saveTrips, deleteTrip as deleteLocalTrip, type Trip as LocalTrip } from "../../lib/mockData";

interface Trip {
  id: string;
  name?: string;
  title?: string;
  destination?: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  budget?: number;
  total_budget?: number;
  description?: string;
  cities?: string[];
  coverImage?: string;
  cover_photo_url?: string;
  status?: string;
}

export default function TripsPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Traveler");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const savedUser = localStorage.getItem("globetrotter_user");
      let userEmail = "";
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setUserName(user.name || "Traveler");
          userEmail = user.email || "";
        } catch {}
      }

      // 1. Fetch from database API
      const emailParam = userEmail ? `?email=${encodeURIComponent(userEmail)}` : "";
      let apiTrips: Trip[] = [];
      try {
        const res = await fetch(`/api/trips${emailParam}`);
        if (res.ok) {
          const data = await res.json();
          apiTrips = data.trips || [];
        }
      } catch (e) {
        console.warn("Could not fetch API trips:", e);
      }

      // 2. Fetch local storage trips
      const localTrips = getLocalTrips().map((t) => ({
        ...t,
        title: t.name,
      }));

      // 3. Merge API trips and local trips, avoiding duplicates by ID or title
      const seen = new Set<string>();
      const merged: Trip[] = [];

      for (const t of [...apiTrips, ...localTrips]) {
        const key = String(t.id);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(t);
        }
      }

      setTrips(merged);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    if (loggedIn !== "true") {
      router.push("/");
      return;
    }
    fetchTrips();
  }, [router]);

  const handleDeleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this trip?")) {
      return;
    }

    try {
      // Delete from API
      await fetch(`/api/trips/${tripId}`, { method: "DELETE" }).catch(() => {});
      // Delete from local storage
      deleteLocalTrip(tripId);
      // Update UI state
      setTrips((prev) => prev.filter((t) => String(t.id) !== String(tripId)));
    } catch (err) {
      console.error("Failed to delete trip:", err);
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const titleText = (trip.title || trip.name || "").toLowerCase();
    const destText = (trip.destination || (trip.cities || []).join(" ")).toLowerCase();
    const q = searchQuery.toLowerCase();
    return titleText.includes(q) || destText.includes(q);
  });

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white shadow-md shadow-[#0058bc]/20">
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
            <Link href="/profile" className="text-slate-600 hover:text-[#0058bc]">
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0058bc] font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden font-medium sm:block text-sm text-[#172033]">
                {userName}
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0058bc]">
              Trip Management
            </span>
            <h1 className="mt-1 text-3xl font-bold md:text-4xl text-[#172033]">
              My Trips & Itineraries
            </h1>
            <p className="mt-2 text-slate-600">
              Explore your planned journeys, create new itineraries, and manage travel budgets.
            </p>
          </div>

          <Link
            href="/trips/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#0058bc]/20 transition hover:-translate-y-0.5 w-fit"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Create New Trip</span>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by destination or title (e.g. Mumbai, Paris)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0058bc] focus:ring-2 focus:ring-[#0058bc]/10"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            {filteredTrips.length} {filteredTrips.length === 1 ? "trip" : "trips"} found
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058bc]/20 border-t-[#0058bc]" />
              <p className="text-sm font-medium text-slate-500">Loading your trips…</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredTrips.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f0ff] text-[#0058bc]">
              <span className="material-symbols-outlined text-3xl">travel_explore</span>
            </div>
            <h2 className="mt-4 text-2xl font-bold text-[#172033]">
              {searchQuery ? "No matching trips found" : "No trips created yet"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any trips matching "${searchQuery}". Try a different city or term.`
                : "Start planning your first adventure! Choose a destination like Mumbai, Paris, or Tokyo and build your itinerary."}
            </p>

            <Link
              href="/trips/new"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0058bc] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#004ca0]"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create Your First Trip</span>
            </Link>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && filteredTrips.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip) => {
              const tripId = String(trip.id);
              const tripTitle = trip.title || trip.name || "Untitled Trip";
              const tripDest =
                trip.destination ||
                (trip.cities && trip.cities.length > 0 ? trip.cities.join(", ") : "Worldwide");
              const tripBudget = Number(trip.budget || trip.total_budget || 0);
              const tripCover =
                trip.coverImage ||
                trip.cover_photo_url ||
                (tripDest.toLowerCase().includes("mumbai")
                  ? "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
                  : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80");

              const startDateStr = trip.startDate || trip.start_date || "";
              const endDateStr = trip.endDate || trip.end_date || "";

              return (
                <div
                  key={tripId}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Cover Photo */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={tripCover}
                      alt={tripTitle}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#0058bc] shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        <span className="truncate max-w-[160px]">{tripDest}</span>
                      </span>

                      {tripBudget > 0 && (
                        <span className="rounded-full bg-black/60 backdrop-blur px-2.5 py-1 text-xs font-semibold text-white">
                          ${tripBudget.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h2 className="text-xl font-bold text-[#172033] line-clamp-1">
                        {tripTitle}
                      </h2>

                      {/* Travel Dates */}
                      {(startDateStr || endDateStr) && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <span className="material-symbols-outlined text-[16px] text-[#0058bc]">
                            calendar_month
                          </span>
                          <span>
                            {formatDate(startDateStr)} {endDateStr ? `→ ${formatDate(endDateStr)}` : ""}
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      {trip.description && (
                        <p className="mt-3 line-clamp-2 text-xs text-slate-600 leading-relaxed">
                          {trip.description}
                        </p>
                      )}

                      {/* Cities Tags */}
                      {trip.cities && trip.cities.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {trip.cities.slice(0, 3).map((city) => (
                            <span
                              key={city}
                              className="rounded-lg bg-[#e8f0ff] px-2.5 py-1 text-[11px] font-semibold text-[#0058bc]"
                            >
                              {city}
                            </span>
                          ))}
                          {trip.cities.length > 3 && (
                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                              +{trip.cities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center gap-2 border-t border-slate-100 pt-4">
                      <Link
                        href={`/trips/${tripId}`}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0058bc] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#004ca0]"
                      >
                        <span>View Trip</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteTrip(tripId, e)}
                        title="Delete Trip"
                        aria-label="Delete Trip"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
      const [y, m, d] = dateStr.trim().split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    const dt = new Date(dateStr);
    if (!isNaN(dt.getTime())) {
      return dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return String(dateStr);
  } catch {
    return String(dateStr);
  }
}
