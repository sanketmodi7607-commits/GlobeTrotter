"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTrips, saveTrips } from "../../../lib/mockData";
import PlaceAutocomplete from "../../components/PlaceAutocomplete";

export default function NewTrip() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [cities, setCities] = useState("");
  const [error, setError] = useState("");

  const createTrip = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !startDate || !endDate) {
      setError("Please enter the trip name and travel dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before the start date.");
      return;
    }

    const newTrip = {
      id: Date.now().toString(),
      name,
      startDate,
      endDate,
      description,
      cities: cities
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean),
      budget: Number(budget) || 0,
      status: "upcoming" as const,
      coverImage:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
    };

    const trips = getTrips();

    saveTrips([newTrip, ...trips]);

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc]">

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white">
              <span className="material-symbols-outlined">
                flight_takeoff
              </span>
            </div>

            <span className="text-xl font-bold text-[#0058bc]">
              GlobeTrotter
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-[#0058bc]"
          >
            Cancel
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0058bc]">
            New adventure
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Create a new trip
          </h1>

          <p className="mt-3 text-slate-500">
            Tell us about your next adventure. You can build the
            itinerary later.
          </p>
        </div>

        <form
          onSubmit={createTrip}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >

          <div className="space-y-6">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Trip name
              </label>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Europe Summer 2026"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc] focus:ring-2 focus:ring-[#0058bc]/10"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Start date
                </label>

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  End date
                </label>

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
                />
              </div>

            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Destinations
              </label>

              <PlaceAutocomplete
                value={cities}
                onChange={setCities}
              />

              <p className="mt-2 text-xs text-slate-500">
                Search for a city, village, landmark, or region. Add another place after a comma.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Estimated budget
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>

                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="2500"
                  className="w-full rounded-xl border border-slate-300 py-3 pl-8 pr-4 outline-none focus:border-[#0058bc]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What do you want to experience on this trip?"
                rows={5}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-6 py-4 font-semibold text-white transition hover:opacity-90"
            >
              Create Trip

              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </button>

          </div>
        </form>
      </div>
    </main>
  );
}
