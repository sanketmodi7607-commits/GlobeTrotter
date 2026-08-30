"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TripPlanner from "./TripPlanner";
import { getTrip as getLocalTrip } from "../../../lib/mockData";

interface Trip {
  id?: string;
  _id?: string;
  name?: string;
  title: string;
  destination: string;
  startDate?: string;
  start_date?: string;
  endDate?: string;
  end_date?: string;
  budget?: number;
  total_budget?: number;
  description?: string;
  coverImage?: string;
  cover_photo_url?: string;
  cities?: string[];
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

        // 1. Try to fetch from API
        try {
          const res = await fetch(`/api/trips/${tripId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.trip) {
              const t = data.trip;
              setTrip({
                ...t,
                id: String(t.id),
                title: t.title || t.name || "Trip",
                destination: t.destination || (t.cities ? t.cities.join(", ") : "Destination"),
                startDate: t.startDate || t.start_date || "",
                endDate: t.endDate || t.end_date || "",
                budget: Number(t.budget || t.total_budget || 0),
                description: t.description || "",
                coverImage: t.coverImage || t.cover_photo_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80",
              });
              setLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          console.warn("API fetch error, trying local storage:", apiErr);
        }

        // 2. Fallback to localStorage
        const local = getLocalTrip(tripId);
        if (local) {
          setTrip({
            id: local.id,
            title: local.name,
            destination: local.cities?.join(", ") || "Destination",
            startDate: local.startDate,
            endDate: local.endDate,
            budget: local.budget,
            description: local.description,
            coverImage: local.coverImage,
            cities: local.cities,
          });
          setLoading(false);
          return;
        }

        setError("Trip not found.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trip");
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
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058bc]/20 border-t-[#0058bc]" />
          <p className="text-sm font-medium text-slate-500">Loading trip details…</p>
        </div>
      </main>
    );
  }

  if (error || !trip) {
    return (
      <main className="min-h-screen bg-[#f7f9fc] p-6 text-[#172033]">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-red-500">error</span>
          <h2 className="mt-3 text-xl font-bold">{error || "Trip not found"}</h2>
          <p className="mt-2 text-sm text-slate-500">The trip you are looking for does not exist or has been removed.</p>
          <Link
            href="/trips"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0058bc] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
          >
            ← Back to My Trips
          </Link>
        </div>
      </main>
    );
  }

  const tripTitle = trip.title || trip.name || "My Adventure";
  const tripDest = trip.destination || (trip.cities?.join(", ") ?? "Worldwide");
  const tripCover =
    trip.coverImage ||
    trip.cover_photo_url ||
    (tripDest.toLowerCase().includes("mumbai")
      ? "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80");

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

          <div className="flex items-center gap-4">
            <Link
              href="/trips"
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-[#0058bc]"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>All Trips</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        {/* HERO BANNER */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
          <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-900">
            <img
              src={tripCover}
              alt={tripTitle}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1 text-xs font-bold text-[#0058bc] shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  <span>{tripDest}</span>
                </span>

                <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl drop-shadow-sm">
                  {tripTitle}
                </h1>
              </div>

              {(trip.startDate || trip.endDate) && (
                <div className="rounded-2xl bg-white/90 backdrop-blur px-4 py-2.5 shadow-sm text-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Travel Dates</p>
                  <p className="mt-0.5 text-sm font-bold text-[#172033]">
                    {formatDate(trip.startDate || "")} {trip.endDate ? `→ ${formatDate(trip.endDate)}` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {trip.description && (
            <div className="border-t border-slate-100 p-6 bg-white">
              <p className="text-sm text-slate-600 leading-relaxed">
                {trip.description}
              </p>
            </div>
          )}
        </section>

        {/* TRIP PLANNER / ITINERARY */}
        <TripPlanner tripId={tripId} />
      </div>
    </main>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    // If date is in YYYY-MM-DD format
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
