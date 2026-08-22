// ============================================================
// BUDGET TYPES & STORAGE HELPERS
// Replace these functions with API calls when the backend is ready.
// ============================================================

export type ExpenseCategory =
  | "transport"
  | "accommodation"
  | "food"
  | "activities"
  | "miscellaneous";

export interface Expense {
  id: string;
  tripId: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}

export interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentUsed: number;
  breakdown: BudgetBreakdown;
}

const STORAGE_KEY = "globetrotter_expenses";

// -------------------------------------------------------
// Storage helpers
// -------------------------------------------------------

function getAllExpenses(): Record<string, Expense[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAllExpenses(data: Record<string, Expense[]>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// -------------------------------------------------------
// Public API (mirrors future backend API shape)
// -------------------------------------------------------

export function getExpenses(tripId: string): Expense[] {
  const all = getAllExpenses();
  return all[tripId] ?? [];
}

export function saveExpenses(tripId: string, expenses: Expense[]): void {
  const all = getAllExpenses();
  all[tripId] = expenses;
  saveAllExpenses(all);
}

export function addExpense(expense: Omit<Expense, "id" | "createdAt">): Expense {
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const existing = getExpenses(expense.tripId);
  saveExpenses(expense.tripId, [newExpense, ...existing]);
  return newExpense;
}

export function deleteExpense(tripId: string, expenseId: string): void {
  const existing = getExpenses(tripId);
  saveExpenses(
    tripId,
    existing.filter((e) => e.id !== expenseId)
  );
}

// -------------------------------------------------------
// Budget calculation helpers
// -------------------------------------------------------

export function getBudgetSummary(
  tripId: string,
  totalBudget: number
): BudgetSummary {
  const expenses = getExpenses(tripId);

  const breakdown: BudgetBreakdown = {
    transport: 0,
    accommodation: 0,
    food: 0,
    activities: 0,
    miscellaneous: 0,
  };

  let totalSpent = 0;

  for (const expense of expenses) {
    breakdown[expense.category] += expense.amount;
    totalSpent += expense.amount;
  }

  const remaining = totalBudget - totalSpent;
  const percentUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return { totalBudget, totalSpent, remaining, percentUsed, breakdown };
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  transport: "Transport",
  accommodation: "Hotels",
  food: "Food",
  activities: "Activities",
  miscellaneous: "Misc",
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  transport: "🚕",
  accommodation: "🏨",
  food: "🍽️",
  activities: "🎯",
  miscellaneous: "📦",
};

/**
 * Human-readable "icon + label" for a category, safe to render directly
 * in the UI. Falls back to a formatted version of the raw value for any
 * category not in CATEGORY_LABELS, so internal snake_case identifiers
 * are never shown to the user.
 */
export function formatCategory(category: string): string {
  const known = category as ExpenseCategory;

  if (CATEGORY_LABELS[known] && CATEGORY_ICONS[known]) {
    return `${CATEGORY_ICONS[known]} ${CATEGORY_LABELS[known]}`;
  }

  const label = category
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return `📦 ${label || "Miscellaneous"}`;
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  transport: "#0058bc",
  accommodation: "#00b4d8",
  food: "#f59e0b",
  activities: "#10b981",
  miscellaneous: "#8b5cf6",
};