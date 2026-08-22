"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  name: string;
  email: string;
  password: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");
    const savedUser = localStorage.getItem("globetrotter_user");

    if (loggedIn !== "true" || !savedUser) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(savedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("globetrotter_logged_in");
    router.push("/");
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f3]">
        <p className="text-gray-500">
          Loading your journey...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3]">

      {/* NAVBAR */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4c95d]">
              ✈
            </div>

            <span className="text-xl font-bold text-[#163c35]">
              GlobeTrotter
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Log out
          </button>

        </div>
      </nav>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="rounded-3xl bg-[#163c35] p-8 text-white md:p-12">

          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[#f4c95d]">
            Welcome to GlobeTrotter
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Hey, {user.name}! 👋
          </h1>

          <p className="mt-4 max-w-2xl text-lg text-white/70">
            Ready to plan your next adventure?
            Create a personalized multi-city trip and
            start exploring the world.
          </p>

          <button className="mt-8 rounded-xl bg-[#f4c95d] px-6 py-3.5 font-bold text-[#163c35] transition hover:bg-[#ffd86e]">
            + Plan New Trip
          </button>

        </div>

        {/* CARDS */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">
              🗺️
            </div>

            <h2 className="text-xl font-bold text-[#163c35]">
              My Trips
            </h2>

            <p className="mt-2 text-gray-500">
              View and manage your upcoming adventures.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">
              🌎
            </div>

            <h2 className="text-xl font-bold text-[#163c35]">
              Explore Cities
            </h2>

            <p className="mt-2 text-gray-500">
              Discover destinations and find inspiration.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 text-3xl">
              💰
            </div>

            <h2 className="text-xl font-bold text-[#163c35]">
              Trip Budget
            </h2>

            <p className="mt-2 text-gray-500">
              Keep track of your travel expenses.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}