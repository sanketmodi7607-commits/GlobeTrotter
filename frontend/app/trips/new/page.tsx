<<<<<<< HEAD
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Place = {
  name: string;
  details: string;
  type: string;
};

export default function NewTripPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [places, setPlaces] = useState<Place[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingPlaces, setSearchingPlaces] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search places as user types
  useEffect(() => {
    const query = destination.trim();

    if (query.length < 2) {
      setPlaces([]);
      setShowSuggestions(false);
      return;
    }

    const searchPlaces = async () => {
      try {
        setSearchingPlaces(true);

        const res = await fetch(
          `/api/places?q=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          throw new Error("Failed to search places");
        }

        const data = await res.json();

        setPlaces(data.places || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Place search error:", err);
        setPlaces([]);
      } finally {
        setSearchingPlaces(false);
      }
    };

    // Wait 300ms after typing before searching
    const timer = setTimeout(searchPlaces, 300);

    return () => clearTimeout(timer);
  }, [destination]);

  // Select suggestion
  const handleSelectPlace = (place: Place) => {
    setDestination(place.details || place.name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!title || !destination || !startDate || !endDate) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          destination,
          startDate,
          endDate,
          description,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to create trip"
        );
      }

      const tripId =
        data.trip?.id ||
        data.trip?._id ||
        data.id;

      if (!tripId) {
        throw new Error(
          "Trip created but no trip ID was returned."
        );
      }

      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">

        <h1 className="mb-2 text-3xl font-bold">
          Create New Trip
        </h1>

        <p className="mb-6 text-gray-600">
          Plan your next trip and build your itinerary.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Trip Title */}
          <div>
            <label className="mb-1 block font-medium">
              Trip Title *
            </label>

            <input
              type="text"
              placeholder="My Europe Trip"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="mb-1 block font-medium">
              Destination *
            </label>

            <input
              type="text"
              placeholder="Paris, France"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (places.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                // Give the click on a suggestion time to register
                setTimeout(() => {
                  setShowSuggestions(false);
                }, 200);
              }}
              autoComplete="off"
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Loading */}
            {searchingPlaces && (
              <div className="absolute right-3 top-10 text-sm text-gray-400">
                Searching...
              </div>
            )}

            {/* Dropdown */}
            {showSuggestions && places.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">

                {places.map((place, index) => (
                  <button
                    key={`${place.name}-${index}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectPlace(place);
                    }}
                    className="block w-full border-b border-gray-100 px-4 py-3 text-left last:border-b-0 hover:bg-blue-50"
                  >
                    <div className="font-medium text-gray-900">
                      {place.name}
                    </div>

                    {place.details && (
                      <div className="mt-1 text-sm text-gray-500">
                        {place.details}
                      </div>
                    )}

                    <div className="mt-1 text-xs capitalize text-gray-400">
                      {place.type}
                    </div>
                  </button>
                ))}

              </div>
            )}

            {/* No results */}
            {showSuggestions &&
              !searchingPlaces &&
              destination.trim().length >= 2 &&
              places.length === 0 && (
                <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border bg-white p-3 text-sm text-gray-500 shadow-lg">
                  No places found
                </div>
              )}
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label className="mb-1 block font-medium">
                Start Date *
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium">
                End Date *
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block font-medium">
              Description
            </label>

            <textarea
              placeholder="Describe your trip..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border px-5 py-3 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Creating Trip..."
                : "Create Trip"}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
}
=======
"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PlaceAutocomplete from "../../components/PlaceAutocomplete";
import { getTrips, saveTrips, type Trip } from "../../../lib/mockData";

const POPULAR_QUICK_PICKS = [
  { name: "Mumbai, India", label: "Mumbai 🇮🇳" },
  { name: "Paris, France", label: "Paris 🇫🇷" },
  { name: "Tokyo, Japan", label: "Tokyo 🇯🇵" },
  { name: "Goa, India", label: "Goa 🌴" },
  { name: "New York, USA", label: "New York 🗽" },
  { name: "Dubai, UAE", label: "Dubai 🇦🇪" },
  { name: "Rome, Italy", label: "Rome 🇮🇹" },
  { name: "London, UK", label: "London 🇬🇧" },
];

export default function NewTripPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState<string>("2500");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("Traveler");

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    if (loggedIn !== "true") {
      router.push("/");
      return;
    }

    const savedUser = localStorage.getItem("globetrotter_user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUserName(user.name || "Traveler");
      } catch {}
    }

    // Set default dates: 14 days from today
    const start = new Date();
    start.setDate(start.getDate() + 14);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  }, [router]);

  // Auto-generate title if title is empty when destination is chosen
  const handleDestinationChange = (newDest: string) => {
    setDestination(newDest);
    if (!title.trim() || title.startsWith("Trip to ") || title.startsWith("Exploring ")) {
      const cityName = newDest.split(",")[0].trim();
      if (cityName) {
        setTitle(`Trip to ${cityName}`);
      }
    }
  };

  // Calculate duration in days
  let durationDays = 0;
  if (startDate && endDate) {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (!isNaN(s) && !isNaN(e) && e >= s) {
      durationDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !destination.trim() || !startDate) {
      setError("Please fill in all required fields (Trip Title, Destination, and Start Date).");
      return;
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    try {
      setLoading(true);

      const savedUserStr = localStorage.getItem("globetrotter_user");
      const user = savedUserStr ? JSON.parse(savedUserStr) : null;
      const userEmail = user?.email || "traveler@globetrotter.app";

      const tripPayload = {
        email: userEmail,
        title: title.trim(),
        destination: destination.trim(),
        start_date: startDate,
        end_date: endDate || null,
        budget: Number(budget) || 0,
        description: description.trim(),
        coverImage: coverImage || undefined,
        cities: destination.split(",").map((s) => s.trim()).filter(Boolean),
      };

      // 1. Post to API route
      let tripId: string | null = null;
      let createdTrip: any = null;

      try {
        const res = await fetch("/api/trips", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tripPayload),
        });

        const data = await res.json();

        if (res.ok && (data.trip || data.id)) {
          createdTrip = data.trip || data;
          tripId = String(createdTrip.id || createdTrip._id || data.id);
        } else {
          console.warn("API response not ok, fallback to local storage:", data.error);
        }
      } catch (apiErr) {
        console.warn("API call failed, saving to local storage:", apiErr);
      }

      // 2. Generate local fallback ID if needed
      if (!tripId) {
        tripId = `trip_${Date.now()}`;
      }

      // 3. Sync to localStorage so Dashboard, My Trips, and Planner see it immediately
      const localTrip: Trip = {
        id: tripId,
        name: title.trim(),
        startDate,
        endDate: endDate || startDate,
        description: description.trim(),
        cities: destination.split(",").map((s) => s.trim()).filter(Boolean),
        budget: Number(budget) || 0,
        status: "upcoming",
        coverImage:
          createdTrip?.coverImage ||
          coverImage ||
          (destination.toLowerCase().includes("mumbai")
            ? "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
            : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80"),
      };

      const existingTrips = getTrips();
      const updatedTrips = [localTrip, ...existingTrips.filter((t) => t.id !== tripId)];
      saveTrips(updatedTrips);

      // 4. Redirect to trip details page
      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

          <div className="flex items-center gap-6">
            <Link
              href="/trips"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#0058bc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back to Trips</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0058bc]">
            <span>GlobeTrotter Planner</span>
            <span>•</span>
            <span>Step 1 of 2</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl text-[#172033]">
            Plan Your Next Adventure
          </h1>
          <p className="mt-2 text-slate-600">
            Choose your destination, set travel dates, and build your personalized itinerary.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            <span className="material-symbols-outlined text-xl text-red-500">error</span>
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {/* Main Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* 1. Destination Search Bar with Autocomplete Dropdown */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="destination" className="block text-sm font-bold text-[#172033]">
                  Destination <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-slate-400">Search city, landmark or region</span>
              </div>

              {/* Autocomplete Search Bar */}
              <PlaceAutocomplete
                id="destination"
                value={destination}
                onChange={handleDestinationChange}
                placeholder="Type a city (e.g. Mumbai, Paris, Tokyo, Goa)..."
                required
              />

              {/* Quick Pick Destination Pills */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Quick picks:</span>
                {POPULAR_QUICK_PICKS.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleDestinationChange(item.name)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      destination.includes(item.name.split(",")[0])
                        ? "bg-[#0058bc] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-[#e8f0ff] hover:text-[#0058bc]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Trip Title */}
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-bold text-[#172033]">
                Trip Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                  edit_note
                </span>
                <input
                  id="title"
                  type="text"
                  placeholder="e.g. Mumbai Summer Journey, European Getaway"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10"
                />
              </div>
            </div>

            {/* 3. Dates Range */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="mb-2 block text-sm font-bold text-[#172033]">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                    calendar_today
                  </span>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#172033] outline-none transition hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="mb-2 block text-sm font-bold text-[#172033]">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                    event
                  </span>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#172033] outline-none transition hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10"
                  />
                </div>
              </div>
            </div>

            {/* Duration Badge if calculated */}
            {durationDays > 0 && (
              <div className="flex items-center gap-2 rounded-xl bg-[#e8f0ff] px-4 py-2.5 text-xs font-semibold text-[#0058bc]">
                <span className="material-symbols-outlined text-[18px]">timelapse</span>
                <span>Trip Duration: {durationDays} {durationDays === 1 ? "day" : "days"}</span>
              </div>
            )}

            {/* 4. Estimated Budget */}
            <div>
              <label htmlFor="budget" className="mb-2 block text-sm font-bold text-[#172033]">
                Estimated Budget ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-[20px]">
                  payments
                </span>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  step="50"
                  placeholder="2500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                You can track expenses for transport, stay, food, and activities later.
              </p>
            </div>

            {/* 5. Trip Description */}
            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-bold text-[#172033]">
                Trip Description & Notes
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="What are the goals of this trip? Highlights, must-visit places, notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 text-sm font-medium text-[#172033] outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0058bc] focus:ring-4 focus:ring-[#0058bc]/10"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0058bc]/25 transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Creating Trip...</span>
                  </>
                ) : (
                  <>
                    <span>Create Trip & Start Planning</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
>>>>>>> 0f202f2f9f1f60fc95ac55c2dee749909a800cd4
