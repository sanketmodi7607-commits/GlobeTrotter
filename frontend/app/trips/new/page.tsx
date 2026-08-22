"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTripPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        throw new Error(data.message || "Failed to create trip");
      }

      // API can return either trip or id
      const tripId = data.trip?.id || data.trip?._id || data.id;

      if (!tripId) {
        throw new Error("Trip created but no trip ID was returned.");
      }

      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-3xl font-bold">Create New Trip</h1>

        <p className="mb-6 text-gray-600">
          Plan your next trip and build your itinerary.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <div>
            <label className="mb-1 block font-medium">
              Destination *
            </label>

            <input
              type="text"
              placeholder="Paris, France"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              {loading ? "Creating Trip..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}