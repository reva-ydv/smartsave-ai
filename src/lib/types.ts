/**
 * Core domain types — shared across services, store, and UI.
 * Mirrors the FastAPI response shapes documented in API_CONTRACT.md.
 */

export type PotKey = "food" | "travel" | "misc" | "savings" | "buffer";

export interface Pot {
  key: PotKey;
  label: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  category: PotKey;
  note?: string;
  date: string; // ISO string
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
