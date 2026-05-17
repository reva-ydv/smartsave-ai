/**
 * Insights & alerts derived from transactions and pots.
 * Used by both the dashboard and chat assistant for dynamic responses.
 */
import type { Expense, Pot, PotKey } from "@/lib/types";

export interface Alert {
  key: PotKey;
  label: string;
  pct: number;
  over: boolean;
}

export interface Insights {
  alerts: Alert[];
  topCategory: { key: PotKey; label: string; total: number } | null;
  weeklySpend: number;
  avgDailySpend: number;
}

/**
 * Pot alerts when spending hits 80% or goes over.
 */
export function getAlerts(pots: Pot[]): Alert[] {
  return pots
    .filter((p) => p.allocated > 0 && p.spent / p.allocated >= 0.8 && p.key !== "savings")
    .map((p) => ({
      key: p.key,
      label: p.label,
      pct: Math.round((p.spent / p.allocated) * 100),
      over: p.spent > p.allocated,
    }));
}

/**
 * Behavioural insights from raw transactions.
 */
export function getInsights(transactions: Expense[], pots: Pot[]): Insights {
  const alerts = getAlerts(pots);

  // Top category by total spend
  const totals = new Map<PotKey, number>();
  for (const t of transactions) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
  }
  let topCategory: Insights["topCategory"] = null;
  for (const [key, total] of totals) {
    if (!topCategory || total > topCategory.total) {
      const pot = pots.find((p) => p.key === key);
      topCategory = { key, label: pot?.label ?? key, total };
    }
  }

  // Last 7 days
  const weekAgo = Date.now() - 7 * 86_400_000;
  const weeklySpend = transactions
    .filter((t) => new Date(t.date).getTime() >= weekAgo)
    .reduce((s, t) => s + t.amount, 0);

  const avgDailySpend = weeklySpend / 7;

  return { alerts, topCategory, weeklySpend, avgDailySpend };
}
