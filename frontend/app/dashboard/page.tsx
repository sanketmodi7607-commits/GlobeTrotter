"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBudgetSummary } from "../../lib/budget";
import { getItinerary, type Activity } from "../../lib/itinerary";
import { destinations as featuredDestinations, getTrips, type Trip } from "../../lib/mockData";

type Destination = (typeof featuredDestinations)[number];

export default function Dashboard() {
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [userName, setUserName] = useState("Traveler");
  const [loading, setLoading] = useState(true);

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
      } catch {
        setUserName("Traveler");
      }
    }

    setTrips(getTrips());
    setDestinations(featuredDestinations);
    setLoading(false);
  }, [router]);

  // Aggregate budget across all trips
  let totalBudgetAcrossAll = 0;
  let totalSpentAcrossAll = 0;
  const breakdownAll = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    miscellaneous: 0,
  };

  for (const t of trips) {
    const s = getBudgetSummary(t.id, t.budget);
    totalBudgetAcrossAll += t.budget || 0;
    totalSpentAcrossAll += s.totalSpent;
    breakdownAll.transport += s.breakdown.transport;
    breakdownAll.accommodation += s.breakdown.accommodation;
    breakdownAll.food += s.breakdown.food;
    breakdownAll.activities += s.breakdown.activities;
    breakdownAll.miscellaneous += s.breakdown.miscellaneous;
  }

  const overallPercent =
    totalBudgetAcrossAll > 0
      ? Math.round((totalSpentAcrossAll / totalBudgetAcrossAll) * 100)
      : 0;

  // Find next upcoming activity across all trips
  let nextActivity: { activity: Activity; tripId: string } | null = null;
  for (const t of trips) {
    const itins = getItinerary(t.id);
    for (const a of itins) {
      const actDate = new Date(`${a.date}T${a.startTime}`);
      if (!nextActivity || actDate < new Date(`${nextActivity.activity.date}T${nextActivity.activity.startTime}`)) {
        nextActivity = { activity: a, tripId: t.id };
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("globetrotter_logged_in");
    router.push("/");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0058bc]/20 border-t-[#0058bc]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
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

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/dashboard"
              className="font-semibold text-[#0058bc]"
            >
              Dashboard
            </Link>
            <Link
              href="/trips"
              className="text-slate-600 hover:text-[#0058bc]"
            >
              My Trips
            </Link>
            <Link
              href="/profile"
              className="text-slate-600 hover:text-[#0058bc]"
            >
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="flex items-center gap-2 rounded-full p-1 transition hover:bg-slate-100"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0058bc] font-bold text-white shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden font-medium sm:block text-sm text-[#172033] mr-1">
                {userName}
              </span>
            </Link>

            <button
              onClick={logout}
              className="hidden text-sm font-medium text-slate-500 hover:text-red-500 lg:block ml-2"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* HERO */}
        <section className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#0058bc]">
              Your travel dashboard
            </p>
            <h1 className="text-4xl font-bold md:text-5xl">
              Welcome back, {userName.split(" ")[0]}!
            </h1>
            <p className="mt-3 max-w-xl text-slate-600">
              Ready to discover your next story? Continue planning
              your adventures or explore somewhere new.
            </p>
          </div>

          <Link
            href="/trips/new"
            className="flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-6 py-3.5 font-semibold text-white shadow-lg shadow-[#0058bc]/20 transition hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined">
              add
            </span>
            Plan New Trip
          </Link>
        </section>

        {/* STATS */}
        <section className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon="luggage"
            label="Total Trips"
            value={String(trips.length)}
          />
          <Stat
            icon="location_on"
            label="Cities Explored"
            value={String(
              new Set(trips.flatMap((t) => t.cities || [])).size
            )}
          />
          <Stat
            icon="calendar_month"
            label="Travel Days"
            value={String(
              trips.reduce((acc, t) => {
                if (!t.startDate || !t.endDate) return acc;
                const s = new Date(t.startDate).getTime();
                const e = new Date(t.endDate).getTime();
                if (isNaN(s) || isNaN(e)) return acc;
                return acc + Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
              }, 0)
            )}
          />
          <Stat
            icon="payments"
            label="Planned Budget"
            value={`$${trips.reduce((acc, t) => acc + (t.budget || 0), 0).toLocaleString()}`}
          />
        </section>

        {/* NEXT ACTIVITY BANNER (if any) */}
        {nextActivity && (
          <section className="mb-12 rounded-2xl border border-[#0058bc]/20 bg-gradient-to-r from-[#e8f0ff] to-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0058bc] text-white shadow-md">
                  <span className="material-symbols-outlined text-2xl">
                    schedule
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0058bc]">
                    Next Activity
                  </span>
                  <h3 className="text-xl font-bold text-[#172033]">
                    {nextActivity.activity.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {new Date(nextActivity.activity.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {nextActivity.activity.startTime} — {nextActivity.activity.endTime} · {nextActivity.activity.city}
                  </p>
                </div>
              </div>
              <Link
                href={`/trips/${nextActivity.tripId}`}
                className="flex items-center gap-1.5 rounded-xl bg-[#0058bc] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004ca0] w-fit"
              >
                <span>View Itinerary</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </section>
        )}

        {/* TRIPS */}
        <section className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Recent Trips
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pick up where you left off.
              </p>
            </div>
            <Link
              href="/trips"
              className="font-semibold text-[#0058bc]"
            >
              View all →
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300">
                travel_explore
              </span>
              <h3 className="mt-4 text-xl font-bold">
                No trips yet
              </h3>
              <p className="mt-2 text-slate-500">
                Start planning your first adventure.
              </p>
              <Link
                href="/trips/new"
                className="mt-5 inline-flex rounded-lg bg-[#0058bc] px-5 py-3 font-semibold text-white"
              >
                Create your first trip
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {trips.slice(0, 4).map((trip) => {
                const tripSummary = getBudgetSummary(trip.id, trip.budget);
                return (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={trip.coverImage || "https://images.unsplash.com/photo-1488646953014-85cb44e25828"}
                        alt={trip.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold">
                        {trip.status === "upcoming" ? "Upcoming" : trip.status || "Planned"}
                      </span>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold">
                            {trip.name}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#0058bc]">
                          arrow_forward
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {trip.cities && trip.cities.map((city) => (
                          <span
                            key={city}
                            className="rounded-full bg-[#e8f0ff] px-3 py-1 text-xs font-medium text-[#0058bc]"
                          >
                            {city}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                          <span className="text-xs text-slate-500">
                            Budget: ${tripSummary.totalSpent.toLocaleString()} / ${(trip.budget || 0).toLocaleString()}
                          </span>
                          <div className="mt-1.5 h-1.5 w-28 rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${tripSummary.percentUsed >= 100 ? "bg-red-500" : tripSummary.percentUsed >= 80 ? "bg-amber-500" : "bg-[#0058bc]"}`}
                              style={{ width: `${Math.min(tripSummary.percentUsed, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="font-bold text-[#0058bc]">
                          {tripSummary.percentUsed}% used
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* BUDGET + PLAN */}
        <section className="mb-12 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  Budget Overview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your total travel spending across all trips.
                </p>
              </div>
              {trips[0] && (
                <Link
                  href={`/trips/${trips[0].id}`}
                  className="text-xs font-semibold text-[#0058bc] hover:underline"
                >
                  Manage Budget →
                </Link>
              )}
            </div>

            <div className="mt-7 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">
                  ${totalSpentAcrossAll.toLocaleString()}
                </p>
                <p className="text-sm text-slate-500">
                  of ${totalBudgetAcrossAll.toLocaleString()} planned
                </p>
              </div>
              <span className={`font-bold ${overallPercent >= 100 ? "text-red-600" : overallPercent >= 80 ? "text-amber-600" : "text-[#00875a]"}`}>
                {overallPercent}%
              </span>
            </div>

            <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${overallPercent >= 100 ? "bg-red-500" : overallPercent >= 80 ? "bg-amber-500" : "bg-gradient-to-r from-[#0058bc] to-[#00b4d8]"}`}
                style={{ width: `${Math.min(overallPercent, 100)}%` }}
              />
            </div>

            <div className="mt-7 grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Budget label="Transport" value={`$${breakdownAll.transport.toLocaleString()}`} />
              <Budget label="Stay" value={`$${breakdownAll.accommodation.toLocaleString()}`} />
              <Budget label="Activities" value={`$${breakdownAll.activities.toLocaleString()}`} />
              <Budget label="Food & Dining" value={`$${breakdownAll.food.toLocaleString()}`} />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#0058bc] to-[#00a8c8] p-7 text-white">
            <span className="material-symbols-outlined text-4xl">
              flight
            </span>
            <h2 className="mt-6 text-2xl font-bold">
              Where will you go next?
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Build a personalized multi-city itinerary in just
              a few simple steps.
            </p>
            <Link
              href="/trips/new"
              className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#0058bc]"
            >
              Start planning
              <span className="material-symbols-outlined">
                arrow_forward
              </span>
            </Link>
          </div>
        </section>

        {/* DESTINATIONS */}
        <section className="pb-10">
          <h2 className="text-2xl font-bold">
            Recommended for You
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Places worth adding to your next adventure.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-52 overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold">
                    {destination.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {destination.country}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ff] text-[#0058bc]">
        <span className="material-symbols-outlined">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-sm text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Budget({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">
        {label}
      </p>
      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
