"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getTrips, type Trip } from "../../../lib/mockData";
import ShareModal from "../../components/ShareModal";

type Expense = {
  id: string;
  name: string;
  category: "transport" | "hotel" | "food" | "activity" | "other";
  amount: number;
  date: string;
};

const categoryInfo = {
  transport: {
    label: "Transport",
    emoji: "✈️",
  },
  hotel: {
    label: "Hotels",
    emoji: "🏨",
  },
  food: {
    label: "Food",
    emoji: "🍴",
  },
  activity: {
    label: "Activities",
    emoji: "🎯",
  },
  other: {
    label: "Misc",
    emoji: "📦",
  },
};

export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const tripId = String(params.id);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] =
    useState<Expense["category"]>("activity");

  useEffect(() => {
    const loggedIn = localStorage.getItem("globetrotter_logged_in");

    if (loggedIn !== "true") {
      router.push("/");
      return;
    }

    const trips = getTrips();
    const foundTrip = trips.find((item) => item.id === tripId);

    if (!foundTrip) {
      setTrip(null);
      setLoading(false);
      return;
    }

    setTrip(foundTrip);

    const savedExpenses = localStorage.getItem(
      `globetrotter_expenses_${tripId}`
    );

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch {
        setExpenses([]);
      }
    }

    setLoading(false);
  }, [tripId, router]);

  const saveExpenses = (updated: Expense[]) => {
    setExpenses(updated);

    localStorage.setItem(
      `globetrotter_expenses_${tripId}`,
      JSON.stringify(updated)
    );
  };

  const addExpense = () => {
    const amount = Number(expenseAmount);

    if (!expenseName.trim()) {
      alert("Please enter an expense name.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const newExpense: Expense = {
      id: Date.now().toString(),
      name: expenseName.trim(),
      amount,
      category: expenseCategory,
      date: new Date().toISOString().split("T")[0],
    };

    saveExpenses([...expenses, newExpense]);

    setExpenseName("");
    setExpenseAmount("");
    setExpenseCategory("activity");
    setShowExpenseForm(false);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter((expense) => expense.id !== id);
    saveExpenses(updated);
  };

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const budget = trip?.budget || 0;

  const percentUsed =
    budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  const categoryTotals = useMemo(() => {
    const totals = {
      transport: 0,
      hotel: 0,
      food: 0,
      activity: 0,
      other: 0,
    };

    expenses.forEach((expense) => {
      totals[expense.category] += expense.amount;
    });

    return totals;
  }, [expenses]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f9fc] px-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">🌍</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Trip not found
          </h1>

          <p className="mt-2 text-slate-500">
            We couldn't find this trip.
          </p>

          <Link
            href="/trips"
            className="mt-6 inline-flex rounded-xl bg-[#0058bc] px-6 py-3 font-semibold text-white"
          >
            Back to My Trips
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-[#172033]">

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0058bc] to-[#00b4d8] text-xl text-white">
              ✈️
            </div>

            <span className="text-xl font-bold text-[#0058bc]">
              GlobeTrotter
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/dashboard"
              className="text-slate-600 hover:text-[#0058bc]"
            >
              Dashboard
            </Link>

            <Link
              href="/trips"
              className="font-semibold text-[#0058bc]"
            >
              My Trips
            </Link>

            <Link
              href="/cities"
              className="text-slate-600 hover:text-[#0058bc]"
            >
              Explore
            </Link>
          </nav>

          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0058bc] font-bold text-white"
          >
            S
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* BACK */}
        <Link
          href="/trips"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0058bc]"
        >
          ← Back to My Trips
        </Link>

        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          className="float-right rounded-xl border border-[#0058bc] px-4 py-2 text-sm font-semibold text-[#0058bc] hover:bg-[#e8f0ff]"
        >
          Share trip
        </button>

        {/* HERO */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="relative h-[320px]">

            <img
              src={trip.coverImage}
              alt={trip.name}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 text-white">

              <span className="inline-flex rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-[#0058bc]">
                {trip.status === "upcoming"
                  ? "Upcoming Trip"
                  : trip.status}
              </span>

              <h1 className="mt-4 text-4xl font-bold md:text-5xl">
                {trip.name}
              </h1>

              <p className="mt-3 text-lg text-white/90">
                {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          {/* TRIP INFO */}
          <div className="grid gap-6 p-7 md:grid-cols-3">

            <InfoCard
              icon="📅"
              label="Travel Dates"
              value={`${formatDate(trip.startDate)} – ${formatDate(
                trip.endDate
              )}`}
            />

            <InfoCard
              icon="📍"
              label="Destinations"
              value={`${trip.cities.length} ${
                trip.cities.length === 1 ? "city" : "cities"
              }`}
            />

            <InfoCard
              icon="💰"
              label="Trip Budget"
              value={`$${budget.toLocaleString()}`}
            />
          </div>
        </section>

        {/* CITIES */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">

          <h2 className="text-2xl font-bold">
            Cities
          </h2>

          <div className="mt-5 flex flex-wrap gap-3">

            {trip.cities.map((city) => (
              <span
                key={city}
                className="rounded-xl bg-[#e8f0ff] px-5 py-3 font-semibold text-[#0058bc]"
              >
                📍 {city}
              </span>
            ))}

          </div>
        </section>

        {/* BUDGET */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-7 lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Budget Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your spending for this trip.
                </p>
              </div>

              <span
                className={`text-xl font-bold ${
                  percentUsed >= 100
                    ? "text-red-600"
                    : percentUsed >= 80
                    ? "text-amber-600"
                    : "text-[#00875a]"
                }`}
              >
                {percentUsed}%
              </span>
            </div>

            <div className="mt-7 flex items-end justify-between">

              <div>
                <p className="text-3xl font-bold">
                  ${totalSpent.toLocaleString()}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  spent of ${budget.toLocaleString()}
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-500">
                ${Math.max(budget - totalSpent, 0).toLocaleString()} left
              </p>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className={`h-full rounded-full transition-all ${
                  percentUsed >= 100
                    ? "bg-red-500"
                    : percentUsed >= 80
                    ? "bg-amber-500"
                    : "bg-gradient-to-r from-[#0058bc] to-[#00b4d8]"
                }`}
                style={{
                  width: `${Math.min(percentUsed, 100)}%`,
                }}
              />

            </div>

            {/* CATEGORY BREAKDOWN */}
            <div className="mt-8">

              <h3 className="text-lg font-bold">
                Category Breakdown
              </h3>

              <div className="mt-5 space-y-5">

                {(
                  Object.keys(categoryInfo) as Array<
                    keyof typeof categoryInfo
                  >
                ).map((category) => {

                  const amount = categoryTotals[category];

                  const percentage =
                    totalSpent > 0
                      ? Math.round((amount / totalSpent) * 100)
                      : 0;

                  return (
                    <div key={category}>

                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0ff] text-xl">
                            {categoryInfo[category].emoji}
                          </div>

                          <span className="font-medium">
                            {categoryInfo[category].label}
                          </span>

                        </div>

                        <span className="font-bold">
                          ${amount.toLocaleString()}
                        </span>

                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-[#0058bc]"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>
            </div>
          </div>

          {/* ADD EXPENSE */}
          <div className="rounded-2xl bg-gradient-to-br from-[#0058bc] to-[#00a8c8] p-7 text-white">

            <div className="text-4xl">
              💳
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Track your expenses
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/85">
              Keep your travel budget organized by adding expenses
              as you travel.
            </p>

            <button
              onClick={() => setShowExpenseForm(true)}
              className="mt-7 w-full rounded-xl bg-white px-5 py-3 font-bold text-[#0058bc] transition hover:bg-slate-100"
            >
              + Add Expense
            </button>

          </div>
        </section>

        {/* EXPENSE FORM */}
        {showExpenseForm && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">

            <div className="flex items-center justify-between">

              <h2 className="text-2xl font-bold">
                Add Expense
              </h2>

              <button
                onClick={() => setShowExpenseForm(false)}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Expense Name
                </label>

                <input
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="e.g. City tour"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Amount
                </label>

                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="250"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Category
                </label>

                <select
                  value={expenseCategory}
                  onChange={(e) =>
                    setExpenseCategory(
                      e.target.value as Expense["category"]
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#0058bc]"
                >
                  <option value="transport">✈️ Transport</option>
                  <option value="hotel">🏨 Hotels</option>
                  <option value="food">🍴 Food</option>
                  <option value="activity">🎯 Activities</option>
                  <option value="other">📦 Misc</option>
                </select>
              </div>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={addExpense}
                className="rounded-xl bg-[#0058bc] px-6 py-3 font-semibold text-white"
              >
                Add Expense
              </button>

              <button
                onClick={() => setShowExpenseForm(false)}
                className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700"
              >
                Cancel
              </button>

            </div>

          </section>
        )}

        {/* EXPENSES */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-bold">
                Expenses ({expenses.length})
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your expenses for this trip.
              </p>
            </div>

            <button
              onClick={() => setShowExpenseForm(true)}
              className="rounded-xl bg-[#0058bc] px-5 py-2.5 font-semibold text-white"
            >
              + Add
            </button>

          </div>

          {expenses.length === 0 ? (
            <div className="mt-8 rounded-xl bg-slate-50 p-8 text-center">

              <div className="text-5xl">
                💰
              </div>

              <h3 className="mt-3 font-bold">
                No expenses yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Add your first expense to start tracking your budget.
              </p>

            </div>
          ) : (
            <div className="mt-6 divide-y divide-slate-100">

              {expenses.map((expense) => {

                const info = categoryInfo[expense.category];

                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between gap-4 py-5"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ff] text-xl">
                        {info.emoji}
                      </div>

                      <div>

                        <h3 className="font-semibold">
                          {expense.name}
                        </h3>

                        <p className="text-sm text-slate-500">
                          {info.label} · {formatDate(expense.date)}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-5">

                      <span className="font-bold">
                        ${expense.amount.toLocaleString()}
                      </span>

                      <button
                        onClick={() => deleteExpense(expense.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          )}
        </section>

        {/* DESCRIPTION */}
        {trip.description && (
          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7">

            <h2 className="text-2xl font-bold">
              About this trip
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              {trip.description}
            </p>

          </section>
        )}

        <div className="h-10" />

      </div>
      {showShareModal && <ShareModal trip={trip} onClose={() => setShowShareModal(false)} />}
    </main>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5">

      <div className="text-2xl">
        {icon}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

function formatDate(date: string) {
  if (!date) return "Date not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
