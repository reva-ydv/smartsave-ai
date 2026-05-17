/**
 * Dynamic chat reply generator.
 * Mocks the future POST /chat endpoint — answers using live app data.
 */
import type { Pot } from "@/lib/types";
import type { Insights } from "./insights";

import { formatCurrency } from "@/lib/utils";

export interface ChatContext {
  income: number;
  pots: Pot[];
  remaining: number;
  dailySafe: number;
  insights: Insights;
}

export function generateChatReply(question: string, ctx: ChatContext): string {
  const q = question.toLowerCase().trim();
  const { pots, remaining, dailySafe, income, insights } = ctx;

  const pot = (k: string) => pots.find((p) => p.key === k);

  // Savings questions
  if (/(save|saving|saved)/.test(q)) {
    const s = pot("savings");
    if (!s) return "No savings pot set up yet. Generate a budget first.";
    const pct = s.allocated > 0 ? Math.round((s.spent / s.allocated) * 100) : 0;
    return `You've saved **${formatCurrency(s.spent)}** of your **${formatCurrency(s.allocated)}** monthly target — that's **${pct}%**. Keep auto-transferring around **${formatCurrency(dailySafe)}** daily and you'll stay on track.`;
  }

  // Per-category questions
  for (const p of pots) {
    if (q.includes(p.key) || q.includes(p.label.toLowerCase())) {
      const left = p.allocated - p.spent;
      if (left < 0) {
        return `You're **${formatCurrency(-left)} over** your ${p.label} budget (${formatCurrency(p.spent)} of ${formatCurrency(p.allocated)}). Consider trimming this category for the rest of the month.`;
      }
      return `You have **${formatCurrency(left)} left** in your ${p.label} budget (${formatCurrency(p.spent)} spent of ${formatCurrency(p.allocated)}).`;
    }
  }

  // Daily / today
  if (/(daily|today|tonight|spend now)/.test(q)) {
    return `You can safely spend up to **${formatCurrency(dailySafe)} today** without breaking your monthly plan.`;
  }

  // Remaining balance
  if (/(balance|left|remaining|how much.*have)/.test(q)) {
    return `You have **${formatCurrency(remaining)} remaining** of your ${formatCurrency(income)} income this month.`;
  }

  // Overspending / alerts
  if (/(over|alert|warning|risk)/.test(q)) {
    if (insights.alerts.length === 0) {
      return `Good news — no categories are flagged. You're under 80% on every pot.`;
    }
    const lines = insights.alerts
      .map((a) => `• **${a.label}** at ${a.pct}%${a.over ? " (over!)" : ""}`)
      .join("\n");
    return `Heads up — these pots need attention:\n${lines}`;
  }

  // Top spending
  if (/(top|biggest|most|where.*money)/.test(q)) {
    if (!insights.topCategory) return "No expenses logged yet — add a few to see insights.";
    return `Your biggest category is **${insights.topCategory.label}** at **${formatCurrency(insights.topCategory.total)}** so far. Last 7 days you spent **${formatCurrency(insights.weeklySpend)}** total.`;
  }

  // Budget overview
  if (/(budget|plan|split|allocation)/.test(q)) {
    return `Your plan splits **${formatCurrency(income)}** into 5 pots: Savings 40%, Food 20%, Buffer 20%, Travel 10%, Misc 10%. Want me to suggest a tighter savings target?`;
  }

  // Default
  return `You have **${formatCurrency(remaining)}** remaining of **${formatCurrency(income)}** this month, with **${formatCurrency(dailySafe)}/day** safe to spend. Ask me about savings, a specific category, daily limits, or where your money is going.`;
}

export const CHAT_SUGGESTIONS = [
  "How am I doing on savings?",
  "How much can I spend today?",
  "Where is most of my money going?",
  "Any spending alerts?",
];
