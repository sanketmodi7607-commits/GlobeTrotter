"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TripPlanner from "./TripPlanner";

interface Trip {
  id?: string;
  _id?: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/trips/${tripId}`);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load trip");
        }

        setTrip(data.trip || data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trip"
        );
      } finally {
        setLoading(false);
      }
    };

    if (tripId) {
      fetchTrip();
    }
  }, [tripId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading trip...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl rounded-lg bg-red-50 p-5 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Trip not found.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push("/trips")}
          className="mb-5 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to My Trips
        </button>

        <section className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div>
              <p className="mb-1 text-sm font-medium text-blue-600">
                {trip.destination}
              </p>

              <h1 className="text-3xl font-bold">
                {trip.title}
              </h1>

              {trip.description && (
                <p className="mt-3 text-gray-600">
                  {trip.description}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">Travel Dates</p>

              <p className="mt-1 font-semibold">
                {trip.startDate} → {trip.endDate}
              </p>
            </div>
          </div>
        </section>

        <TripPlanner tripId={tripId} />
      </div>
    </main>
  );
}