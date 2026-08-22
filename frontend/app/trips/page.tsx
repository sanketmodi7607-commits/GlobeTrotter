"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Trip {
  id?: string;
  _id?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export default function TripsPage() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/trips");

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load trips");
      }

      setTrips(data.trips || data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load trips"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">
              My Trips
<<<<<<< HEAD
            </h1>

            <p className="mt-1 text-gray-600">
              Manage and explore your travel plans.
=======
            </Link>
            <Link href="/profile" className="text-slate-600 hover:text-[#0058bc]">
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/trips/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-5 py-2.5 font-semibold text-white text-sm shadow-lg shadow-[#0058bc]/20 transition hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Trip
            </Link>
            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0058bc] font-bold text-white shadow-sm"
              title="Profile"
            >
              <span className="material-symbols-outlined text-xl">person</span>
            </Link>
          </div>
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
>>>>>>> 6886c67d45dff84d48a0337153de021dfb29aca2
            </p>
          </div>

          <button
            onClick={() => router.push("/trips/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
          >
            + Create New Trip
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <p>Loading your trips...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && trips.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold">
              No trips yet
            </h2>

            <p className="mt-2 text-gray-500">
              Create your first trip and start planning.
            </p>

            <button
              onClick={() => router.push("/trips/new")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              Create Your First Trip
            </button>
          </div>
        )}

        {/* Trips Grid */}
        {!loading && trips.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const tripId = trip.id || trip._id;

              return (
                <div
                  key={tripId}
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />

                  <div className="p-5">
                    <p className="text-sm font-medium text-blue-600">
                      {trip.destination}
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      {trip.title}
                    </h2>

                    <p className="mt-3 text-sm text-gray-500">
                      {trip.startDate} → {trip.endDate}
                    </p>

                    {trip.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                        {trip.description}
                      </p>
                    )}

                    <button
                      onClick={() =>
                        tripId &&
                        router.push(`/trips/${tripId}`)
                      }
                      className="mt-5 w-full rounded-lg border border-blue-600 px-4 py-2 font-medium text-blue-600 hover:bg-blue-600 hover:text-white"
                    >
                      View Trip
                    </button>
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