"use client";

import { FormEvent, useEffect, useState } from "react";

interface Stop {
  id?: string;
  _id?: string;
  dayNumber: number;
  title: string;
  description: string;
}

interface NewStop {
  dayNumber: number;
  title: string;
  description: string;
}

export default function TripPlanner({
  tripId,
}: {
  tripId: string;
}) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const [newStop, setNewStop] = useState<NewStop>({
    dayNumber: 1,
    title: "",
    description: "",
  });

  const fetchStops = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`/api/trips/${tripId}/stops`);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load itinerary");
      }

      setStops(data.stops || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load itinerary"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStops();
  }, [tripId]);

  const handleAddStop = async (e: FormEvent) => {
    e.preventDefault();

    if (!newStop.title.trim()) {
      setError("Please enter a stop title.");
      return;
    }

    try {
      setAdding(true);
      setError("");

      const res = await fetch(`/api/trips/${tripId}/stops`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStop),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to add stop");
      }

      setNewStop({
        dayNumber: newStop.dayNumber + 1,
        title: "",
        description: "",
      });

      await fetchStops();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add stop"
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    try {
      const res = await fetch(
        `/api/trips/${tripId}/stops/${stopId}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete stop");
      }

      await fetchStops();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete stop"
      );
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <p>Loading itinerary...</p>
      </div>
    );
  }

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          My Itinerary
        </h2>

        <p className="mt-1 text-gray-500">
          Add destinations and activities to each day.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Existing Stops */}
      <div className="mb-8 space-y-4">
        {stops.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-gray-500">
            No itinerary stops yet. Add your first stop below.
          </div>
        ) : (
          stops.map((stop) => (
            <div
              key={stop.id || stop._id}
              className="rounded-lg border-l-4 border-blue-500 bg-gray-50 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Day {stop.dayNumber}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {stop.title}
                  </h3>

                  {stop.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {stop.description}
                    </p>
                  )}
                </div>

                {(stop.id || stop._id) && (
                  <button
                    onClick={() =>
                      handleDeleteStop(
                        (stop.id || stop._id) as string
                      )
                    }
                    className="text-sm text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Stop */}
      <div className="border-t pt-6">
        <h3 className="mb-4 text-lg font-semibold">
          Add to Itinerary
        </h3>

        <form
          onSubmit={handleAddStop}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Day Number
            </label>

            <input
              type="number"
              min="1"
              value={newStop.dayNumber}
              onChange={(e) =>
                setNewStop({
                  ...newStop,
                  dayNumber: Number(e.target.value),
                })
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Stop Title
            </label>

            <input
              type="text"
              placeholder="Eiffel Tower"
              value={newStop.title}
              onChange={(e) =>
                setNewStop({
                  ...newStop,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>

            <textarea
              placeholder="Visit the Eiffel Tower and explore the surrounding area..."
              rows={3}
              value={newStop.description}
              onChange={(e) =>
                setNewStop({
                  ...newStop,
                  description: e.target.value,
                })
              }
              className="w-full resize-none rounded-lg border p-3"
            />
          </div>

          <button
            type="submit"
            disabled={adding}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {adding ? "Adding..." : "Add to Itinerary"}
          </button>
        </form>
      </div>
    </section>
  );
}