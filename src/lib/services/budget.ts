
import type { Pot, PotKey } from "@/lib/types";

export const DEFAULT_RATIOS: Record<PotKey, number> = {
  savings: 0.4,
  food: 0.2,
  buffer: 0.2,
  travel: 0.1,
  misc: 0.1,
};

export const POT_META: Record<PotKey, { label: string; color: string }> = {
  food: { label: "Food", color: "var(--pot-food)" },
  travel: { label: "Travel", color: "var(--pot-travel)" },
  misc: { label: "Misc", color: "var(--pot-misc)" },
  savings: { label: "Savings", color: "var(--pot-savings)" },
  buffer: { label: "Buffer", color: "var(--pot-buffer)" },
};


export async function generateBudget(income: number): Promise<{
  pots: Pot[];
  explanation: string;
}> {
  const res = await fetch("http://127.0.0.1:8000/generate-budget", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ income }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate budget");
  }

  const data = await res.json();

  return {
    pots: data.pots,
    explanation: data.explanation,
  };
}

export function explainBudget(income: number): string {
  return `Based on your monthly income of $${income.toLocaleString()}, we recommend a 40/20/20/10/10 split. **Savings (40%)** builds a strong cushion, **Food (20%)** covers essentials, **Buffer (20%)** absorbs unexpected costs, and **Travel/Misc (10% each)** keep lifestyle flexibility intact.`;
}