import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, Expense, Pot, PotKey } from "@/lib/types";
import {generateBudget } from "@/lib/services/budget";
import {
  calculateSavings,
  calculateTotals,
  daysLeftInMonth,
} from "@/lib/services/savings";
import { getInsights } from "@/lib/services/insights";

// Re-export types for backwards compatibility with existing imports.
export type { ChatMessage, Expense, Pot, PotKey };

export interface User {
  name: string;
  email: string;
}

export type SpendingStyle = "conservative" | "moderate" | "flexible";

interface State {
  user: User | null;
  isAuthenticated: boolean;
  hasOnboarded: boolean;

  savingsGoal: number;
  spendingStyle: SpendingStyle;
  income: number;

  pots: Pot[];
  expenses: Expense[];

  aiExplanation: string;
  chat: ChatMessage[];

  // Auth
  login: (email: string, name?: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;

  // Onboarding (async)
  completeOnboarding: (data: {
    income: number;
    savingsGoal: number;
    spendingStyle: SpendingStyle;
  }) => Promise<void>;

  // Profile (async)
  updateProfile: (data: Partial<Pick<State, "user" | "income" | "savingsGoal">>) => Promise<void>;

  // Budget (async)
  setIncome: (income: number) => Promise<void>;
  generateBudget: (income: number) => Promise<void>;

  // Expenses (still local for now)
  addExpense: (e: Omit<Expense, "id">) => void;
  removeExpense: (id: string) => void;

  // Chat
  pushChat: (m: Omit<ChatMessage, "id">) => void;

  // Reset (async)
  reset: () => Promise<void>;
}
// Seed data for an instantly meaningful demo experience.
const SEED_INCOME = 4000;
const seedPots: Pot[] = [];

const seedExpenses: Expense[] = [
  { id: "e1", amount: 42, category: "food", note: "Groceries", date: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: "e2", amount: 18, category: "food", note: "Coffee runs", date: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "e3", amount: 120, category: "travel", note: "Train pass", date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "e4", amount: 60, category: "travel", note: "Uber", date: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "e5", amount: 95, category: "misc", note: "Books", date: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "e6", amount: 260, category: "food", note: "Restaurants", date: new Date(Date.now() - 86400000 * 6).toISOString() },
];

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasOnboarded: false,
      savingsGoal: 800,
      spendingStyle: "moderate" as SpendingStyle,
      income: SEED_INCOME,
      pots: seedPots,
      expenses: seedExpenses,
      aiExplanation: "",
      chat: [
        {
          id: "c0",
          role: "assistant",
          content:
            "Hi! I'm your SmartSave assistant. Ask me about savings, a specific category, daily limits, or where your money is going.",
        },
      ],
      login: (email, name) =>
        set({
          isAuthenticated: true,
          user: { email, name: name ?? email.split("@")[0] },
        }),
      signup: (name, email) =>
        set({
          isAuthenticated: true,
          hasOnboarded: false,
          user: { name, email },
        }),
      logout: () =>
        set({ isAuthenticated: false, user: null }),
      completeOnboarding: async ({ income, savingsGoal, spendingStyle }) => {
        const data = await generateBudget(income);
        set({
          hasOnboarded: true,
          income,
          savingsGoal,
          spendingStyle,
          pots: data.pots,
          aiExplanation: data.explanation,
        });
      },
      updateProfile: async (data) => {
        const updatedIncome = data.income ?? get().income;
        const budget = await generateBudget(updatedIncome);
        set((state) => ({
          ...state,
          ...data,
          income: updatedIncome,
          pots: budget.pots,
          aiExplanation: budget.explanation,
        }));
      },
      setIncome: async (income) => {
        const data = await generateBudget(income);
        set({
          income,
          pots: data.pots,
          aiExplanation: data.explanation,
        });
      },

      generateBudget: async (income) => {
        const data = await generateBudget(income);
        set({
          income,
          pots: data.pots,
          aiExplanation: data.explanation,
        });
      },
      addExpense: (e) => {
        const exp: Expense = { ...e, id: crypto.randomUUID() };
        set({
          expenses: [exp, ...get().expenses],
          pots: get().pots.map((p) =>
            p.key === e.category ? { ...p, spent: p.spent + e.amount } : p
          ),
        });
      },
      removeExpense: (id) => {
        const exp = get().expenses.find((e) => e.id === id);
        if (!exp) return;
        set({
          expenses: get().expenses.filter((e) => e.id !== id),
          pots: get().pots.map((p) =>
            p.key === exp.category ? { ...p, spent: Math.max(0, p.spent - exp.amount) } : p
          ),
        });
      },
      pushChat: (m) =>
        set({ chat: [...get().chat, { ...m, id: crypto.randomUUID() }] }),
      reset: async () => {
        const data = await generateBudget(SEED_INCOME);
        set({
          income: SEED_INCOME,
          pots: data.pots,
          expenses: [],
          aiExplanation: data.explanation,
          chat: [],
        });
      },
    }),
    { name: "smartsave-store" }
  )
);

/**
 * Derived selector — totals, savings progress, daily safe spend, and alerts.
 * Pure: composes service functions over current store state.
 */
export function useTotals() {
  const income = useStore((s) => s.income);
  const pots = useStore((s) => s.pots);
  const expenses = useStore((s) => s.expenses);

  const daysLeft = daysLeftInMonth();
  const { totalSpent, totalAllocated, remaining } = calculateTotals(income, pots);
  const { dailySafe, savingsProgress } = calculateSavings(pots, daysLeft);
  const insights = getInsights(expenses, pots);

  return {
    totalSpent,
    totalAllocated,
    remaining,
    savingsProgress,
    dailySafe,
    daysLeft,
    alerts: insights.alerts,
    insights,
  };
}
