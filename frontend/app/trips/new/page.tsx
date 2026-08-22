"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTrips, saveTrips } from "../../../lib/mockData";
import PlaceAutocomplete from "../../components/PlaceAutocomplete";

// This is the canonical "new trip" page under the /trips/ route.
// All new features and internal links use /trips/new.
// The old /trip/new page remains untouched.

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
];

export default function NewTripPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [cities, setCities] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const createTrip = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a trip name.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Please enter the travel dates.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    setLoading(true);

    // Pick a random cover image for variety
    const coverImage =
      COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];

    const newTrip = {
      id: Date.now().toString(),
      name: name.trim(),
      startDate,
      endDate,
      description: description.trim(),
      cities: cities
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean),
      budget: Number(budget) || 0,
      status: "upcoming" as const,
      coverImage,
    };

    const trips = getTrips();
    saveTrips([newTrip, ...trips]);

    router.push(`/trips/${newTrip.id}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <span className="text-xl font-bold text-[#0058bc]">
              GlobeTrotter
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-[#0058bc] transition"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0058bc]">
            New adventure
          </p>
          <h1 className="mt-2 text-4xl font-bold text-[#172033]">
            Plan a new trip
          </h1>
          <p className="mt-3 text-slate-500">
            Start with the basics — you can add your itinerary and expenses
            after creating the trip.
          </p>
        </div>

        <form
          onSubmit={createTrip}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
        >
          {/* Trip Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172033]">
              Trip name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Europe Summer 2026"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
            />
          </div>

          {/* Dates */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                Start date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#172033]">
                End date *
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>
          </div>

          {/* Cities */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172033]">
              Destinations
            </label>
            <PlaceAutocomplete
              value={cities}
              onChange={setCities}
            />
            <p className="mt-1.5 text-xs text-slate-400">
              Search and select a city, village, landmark, or region. Add more places by typing after a comma.
            </p>
          </div>

          {/* Budget */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172033]">
              Estimated budget
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-500">
                $
              </span>
              <input
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="2500"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none focus:border-[#0058bc]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#172033]">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to experience on this trip?"
              rows={4}
              className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[#0058bc]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-6 py-4 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Trip"}
            {!loading && (
              <span className="material-symbols-outlined">arrow_forward</span>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
