/**
 * Savings & daily-spend recommendation logic.
 * Mirrors GET /get-savings-recommendation on the backend.
 */
import type { Pot } from "@/lib/types";

export function daysLeftInMonth(today = new Date()): number {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return lastDay - today.getDate() + 1;
}

/**
 * Safe daily spending across non-savings pots for the rest of the month.
 */
export function calculateSavings(pots: Pot[], remainingDays: number) {
  const flexibleRemaining = pots
    .filter((p) => p.key !== "savings")
    .reduce((s, p) => s + Math.max(0, p.allocated - p.spent), 0);

  const dailySafe = Math.max(0, Math.floor(flexibleRemaining / Math.max(1, remainingDays)));
  const savingsPot = pots.find((p) => p.key === "savings");
  const savingsProgress =
    savingsPot && savingsPot.allocated > 0
      ? Math.min(100, (savingsPot.spent / savingsPot.allocated) * 100)
      : 0;

  return {
    dailySafe,
    flexibleRemaining,
    savingsProgress,
    savingsTarget: savingsPot?.allocated ?? 0,
    savedSoFar: savingsPot?.spent ?? 0,
  };
}

/**
 * Aggregate totals derived from income and pots.
 */
export function calculateTotals(income: number, pots: Pot[]) {
  const totalSpent = pots.reduce((s, p) => s + p.spent, 0);
  const totalAllocated = pots.reduce((s, p) => s + p.allocated, 0);
  const remaining = income - totalSpent;
  return { totalSpent, totalAllocated, remaining };
}
