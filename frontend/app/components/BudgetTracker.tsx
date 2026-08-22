"use client";

import { useState, useEffect } from "react";
import {
  getExpenses,
  addExpense,
  deleteExpense,
  getBudgetSummary,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  type Expense,
  type ExpenseCategory,
} from "../../lib/budget";

interface BudgetTrackerProps {
  tripId: string;
  totalBudget: number;
  compact?: boolean;
}

export default function BudgetTracker({
  tripId,
  totalBudget,
  compact = false,
}: BudgetTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "food" as ExpenseCategory,
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setExpenses(getExpenses(tripId));
  }, [tripId]);

  const summary = getBudgetSummary(tripId, totalBudget);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Please enter an expense name.");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }
    if (!form.date) {
      setFormError("Please select a date.");
      return;
    }

    addExpense({
      tripId,
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
    });

    setExpenses(getExpenses(tripId));
    setForm({
      name: "",
      category: "food",
      amount: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const handleDelete = (expenseId: string) => {
    deleteExpense(tripId, expenseId);
    setExpenses(getExpenses(tripId));
  };

  // Progress bar color based on percentage
  const getProgressColor = () => {
    if (summary.percentUsed >= 100) return "from-red-500 to-red-600";
    if (summary.percentUsed >= 80) return "from-amber-500 to-orange-500";
    return "from-[#0058bc] to-[#00b4d8]";
  };

  // ===== COMPACT VERSION (for dashboard) =====
  if (compact) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#172033]">Budget Overview</h3>
          {summary.percentUsed >= 100 && (
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Over budget
            </span>
          )}
          {summary.percentUsed >= 80 && summary.percentUsed < 100 && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Almost full
            </span>
          )}
        </div>

        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">
            ${summary.totalSpent.toLocaleString()} spent
          </span>
          <span className="font-semibold text-[#0058bc]">
            {summary.percentUsed}%
          </span>
        </div>

        <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
            style={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
          />
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>$0</span>
          <span>${totalBudget.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  // ===== FULL VERSION =====
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Budget</p>
          <p className="mt-1 text-2xl font-bold text-[#172033]">
            ${summary.totalBudget.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Spent</p>
          <p className={`mt-1 text-2xl font-bold ${summary.percentUsed >= 100 ? "text-red-600" : "text-[#172033]"}`}>
            ${summary.totalSpent.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Remaining</p>
          <p className={`mt-1 text-2xl font-bold ${summary.remaining < 0 ? "text-red-600" : "text-emerald-600"}`}>
            {summary.remaining < 0 ? "-" : ""}${Math.abs(summary.remaining).toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Used</p>
          <p className={`mt-1 text-2xl font-bold ${summary.percentUsed >= 100 ? "text-red-600" : summary.percentUsed >= 80 ? "text-amber-600" : "text-[#0058bc]"}`}>
            {summary.percentUsed}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-[#172033]">Budget Used</span>
          <span className={`text-sm font-bold ${summary.percentUsed >= 100 ? "text-red-600" : summary.percentUsed >= 80 ? "text-amber-600" : "text-[#0058bc]"}`}>
            ${summary.totalSpent.toLocaleString()} / ${summary.totalBudget.toLocaleString()}
          </span>
        </div>

        <div className="h-4 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700`}
            style={{ width: `${Math.min(summary.percentUsed, 100)}%` }}
          />
        </div>

        {/* Alerts */}
        {summary.percentUsed >= 100 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5">
            <span className="material-symbols-outlined text-red-600 text-xl">error</span>
            <p className="text-sm font-medium text-red-700">
              You&apos;ve exceeded your budget by ${Math.abs(summary.remaining).toLocaleString()}. Consider adjusting your plan.
            </p>
          </div>
        )}

        {summary.percentUsed >= 80 && summary.percentUsed < 100 && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2.5">
            <span className="material-symbols-outlined text-amber-600 text-xl">warning</span>
            <p className="text-sm font-medium text-amber-700">
              You&apos;ve used {summary.percentUsed}% of your budget. Only ${summary.remaining.toLocaleString()} remaining.
            </p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="font-bold text-[#172033] mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => {
            const spent = summary.breakdown[cat];
            const color = CATEGORY_COLORS[cat];
            const maxSpent = Math.max(...Object.values(summary.breakdown), 1);
            const barWidth = (spent / maxSpent) * 100;

            return (
              <div key={cat} className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <span
                    className="material-symbols-outlined text-sm"
                    style={{ color }}
                  >
                    {CATEGORY_ICONS[cat]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#172033]">
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span className="font-semibold text-[#172033]">
                      ${spent.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense List */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#172033]">
            Expenses ({expenses.length})
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#0058bc] to-[#00b4d8] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Expense
          </button>
        </div>

        {/* Add Expense Form */}
        {showForm && (
          <form
            onSubmit={handleAddExpense}
            className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3"
          >
            <h4 className="font-semibold text-sm text-[#172033]">New Expense</h4>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Expense Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Train ticket"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0058bc] focus:ring-1 focus:ring-[#0058bc]/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as ExpenseCategory })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
                >
                  {(Object.keys(CATEGORY_LABELS) as ExpenseCategory[]).map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0058bc]"
                />
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-600">{formError}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-[#0058bc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004ca0] transition"
              >
                Save Expense
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Expense items */}
        {expenses.length === 0 ? (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-300">
              receipt_long
            </span>
            <p className="mt-2 text-sm text-slate-500">
              No expenses yet. Add your first expense.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map((expense) => {
              const color = CATEGORY_COLORS[expense.category];
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 group"
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ color }}
                    >
                      {CATEGORY_ICONS[expense.category]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#172033] truncate">
                      {expense.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {CATEGORY_LABELS[expense.category]} ·{" "}
                      {new Date(expense.date + "T00:00:00").toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>

                  <span className="font-bold text-[#172033]">
                    ${expense.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="opacity-0 group-hover:opacity-100 ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition"
                    title="Delete expense"
                  >
                    <span className="material-symbols-outlined text-sm">
                      delete
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
