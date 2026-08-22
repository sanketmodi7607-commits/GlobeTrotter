"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTripPage() {
  const router = useRouter();

  // Form state hooks
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedCities, setSelectedCities] = useState<string[]>(["Ahmedabad"]);
  const [cityInput, setCityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim() && !selectedCities.includes(cityInput.trim())) {
      setSelectedCities([...selectedCities, cityInput.trim()]);
      setCityInput("");
    }
  };

  const handleRemoveCity = (cityToRemove: string) => {
    setSelectedCities(selectedCities.filter((c) => c !== cityToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const savedUser = localStorage.getItem("globetrotter_user");
    let userEmail = "";
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        userEmail = user.email;
      } catch {
        userEmail = "";
      }
    }

    if (!userEmail) {
      setError("User session not found. Please log in again.");
      return;
    }

    setLoading(true);

    const tripPayload = {
      email: userEmail,
      name,
      description,
      startDate,
      endDate,
      budget: Number(budget) || 0,
      coverImage: coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      cities: selectedCities,
    };

    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tripPayload),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Failed to save trip to database");
      }
    } catch (err) {
      console.error("Error connecting to server:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033] pb-16">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <span className="text-xl font-bold text-[#0058bc]">GlobeTrotter</span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#0058bc]">
            Cancel & Return
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Plan a New Adventure</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fill in the details below to create and save your trip to the database.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Trip Name *</label>
            <input
              type="text"
              required
              placeholder="e.g., Summer in Europe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="What's the vibe of this trip?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
            />
          </div>

          {/* Dates Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Total Budget ($)</label>
            <input
              type="number"
              placeholder="e.g., 2500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
            />
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Cover Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-[#0058bc] focus:outline-none"
            />
          </div>

          {/* Cities Section */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Destination Cities</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Add a city (e.g., Paris)"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-[#0058bc] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCity}
                className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Add City
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ff] px-3.5 py-1 text-xs font-semibold text-[#0058bc]"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => handleRemoveCity(city)}
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0058bc]/20 transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? "Saving to Database..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}