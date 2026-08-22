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