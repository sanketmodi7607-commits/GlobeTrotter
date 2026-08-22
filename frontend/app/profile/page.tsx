"use client";

import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getTrips, type Trip } from "../../lib/mockData";

interface UserProfile {
  id?: number | string;
  name: string;
  email: string;
  bio?: string;
  homeCity?: string;
  currency?: string;
  travelStyle?: string;
  joinedDate?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile>({
    name: "Traveler",
    email: "",
    bio: "Passionate explorer wandering the globe one city at a time.",
    homeCity: "New York, USA",
    currency: "USD ($)",
    travelStyle: "Cultural & Adventure",
    joinedDate: "August 2026",
  });

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    if (loggedIn !== "true") {
      router.push("/");
      return;
    }

    const savedUserStr = localStorage.getItem("globetrotter_user");
    let currentUser: UserProfile = {
      name: "Traveler",
      email: "",
      bio: "Passionate explorer wandering the globe one city at a time.",
      homeCity: "New York, USA",
      currency: "USD ($)",
      travelStyle: "Cultural & Adventure",
      joinedDate: "August 2026",
    };

    if (savedUserStr) {
      try {
        const parsed = JSON.parse(savedUserStr);
        currentUser = {
          ...currentUser,
          ...parsed,
        };
      } catch (e) {}
    }

    // Load any extra profile preferences stored for this user
    if (currentUser.email) {
      const extraProfileStr = localStorage.getItem(`globetrotter_profile_${currentUser.email.toLowerCase().trim()}`);
      if (extraProfileStr) {
        try {
          const parsedExtra = JSON.parse(extraProfileStr);
          currentUser = { ...currentUser, ...parsedExtra };
        } catch (e) {}
      }
    }

    setUser(currentUser);
    setTrips(getTrips());
    setLoading(false);
  }, [router]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSavedSuccess(false);

    // Save core user data
    const coreUser = {
      id: user.id,
      name: user.name.trim() || "Traveler",
      email: user.email.trim(),
    };
    localStorage.setItem("globetrotter_user", JSON.stringify(coreUser));

    // Save extended profile
    if (user.email) {
      localStorage.setItem(
        `globetrotter_profile_${user.email.toLowerCase().trim()}`,
        JSON.stringify(user)
      );
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

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

  const totalTrips = trips.length;
  const totalCities = new Set(trips.flatMap((t) => t.cities || [])).size;
  const totalDays = trips.reduce((acc, t) => {
    if (!t.startDate || !t.endDate) return acc;
    const s = new Date(t.startDate).getTime();
    const e = new Date(t.endDate).getTime();
    if (isNaN(s) || isNaN(e)) return acc;
    return acc + Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
  }, 0);
  const totalBudget = trips.reduce((acc, t) => acc + (t.budget || 0), 0);

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-white">
              <span className="material-symbols-outlined">flight_takeoff</span>
            </div>
            <span className="text-xl font-bold text-[#0058bc]">GlobeTrotter</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/dashboard" className="text-slate-600 hover:text-[#0058bc]">
              Dashboard
            </Link>
            <Link href="/trips" className="text-slate-600 hover:text-[#0058bc]">
              My Trips
            </Link>
            <Link href="/profile" className="font-semibold text-[#0058bc]">
              Profile
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0058bc]">
            Account Management
          </p>
          <h1 className="mt-1 text-4xl font-bold text-[#172033]">Personal Profile</h1>
          <p className="mt-2 text-slate-500">
            Manage your personal travel identity and account preferences.
          </p>
        </div>

        {/* HERO CARD */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-4xl font-bold text-white shadow-lg shadow-[#0058bc]/25">
              {user.name ? user.name.charAt(0).toUpperCase() : "T"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-[#172033]">{user.name}</h2>
                <span className="rounded-full bg-[#e8f0ff] px-3 py-1 text-xs font-semibold text-[#0058bc]">
                  Explorer
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{user.email || "No email provided"}</p>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">{user.bio}</p>
            </div>
          </div>

          {/* QUICK STATS IN PROFILE */}
          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Trips</span>
              <p className="mt-1 text-xl font-bold text-[#172033]">{totalTrips}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Cities Visited</span>
              <p className="mt-1 text-xl font-bold text-[#172033]">{totalCities}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Days on Road</span>
              <p className="mt-1 text-xl font-bold text-[#172033]">{totalDays}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400 font-medium">Total Budget</span>
              <p className="mt-1 text-xl font-bold text-[#172033]">${totalBudget.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* FEEDBACK BANNER */}
        {savedSuccess && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800 animate-fade-in">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <p className="text-sm font-semibold">Your profile information has been saved successfully!</p>
          </div>
        )}

        {/* PROFILE EDIT FORM */}
        <form onSubmit={handleSave} className="space-y-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h3 className="text-lg font-bold text-[#172033] mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0058bc]">person</span>
              Personal Details
            </h3>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  placeholder="e.g. Sanket Patil"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 cursor-not-allowed outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">Account login email address</p>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Bio / Travel Mantra
                </label>
                <textarea
                  rows={3}
                  value={user.bio}
                  onChange={(e) => setUser({ ...user, bio: e.target.value })}
                  placeholder="Tell us about your travel dreams and passion..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Home City / Country
                </label>
                <input
                  type="text"
                  value={user.homeCity}
                  onChange={(e) => setUser({ ...user, homeCity: e.target.value })}
                  placeholder="e.g. Mumbai, India"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Preferred Currency
                </label>
                <select
                  value={user.currency}
                  onChange={(e) => setUser({ ...user, currency: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="EUR (€)">EUR (€)</option>
                  <option value="GBP (£)">GBP (£)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="JPY (¥)">JPY (¥)</option>
                  <option value="CAD ($)">CAD ($)</option>
                  <option value="AUD ($)">AUD ($)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Travel Style
                </label>
                <select
                  value={user.travelStyle}
                  onChange={(e) => setUser({ ...user, travelStyle: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-[#172033] outline-none transition focus:border-[#0058bc] focus:bg-white focus:ring-2 focus:ring-[#0058bc]/10"
                >
                  <option value="Cultural & Adventure">Cultural & Adventure</option>
                  <option value="Solo Backpacker">Solo Backpacker</option>
                  <option value="Luxury & Relaxation">Luxury & Relaxation</option>
                  <option value="Family Vacations">Family Vacations</option>
                  <option value="Food & Culinary Tours">Food & Culinary Tours</option>
                  <option value="Nature & Wildlife">Nature & Wildlife</option>
                </select>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-slate-500 hover:text-[#0058bc] transition"
            >
              ← Back to Dashboard
            </Link>

            <button
              type="submit"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-8 py-3.5 font-semibold text-white shadow-lg shadow-[#0058bc]/20 transition hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
