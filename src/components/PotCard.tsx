import type { Pot } from "@/lib/store";
import { Utensils, Plane, Sparkles, PiggyBank, Shield } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const ICONS = {
  food: Utensils,
  travel: Plane,
  misc: Sparkles,
  savings: PiggyBank,
  buffer: Shield,
} as const;

export function PotCard({ pot }: { pot: Pot }) {
  const Icon = ICONS[pot.key];
  const remaining = pot.allocated - pot.spent;
  const pct = pot.allocated > 0 ? Math.min(100, (pot.spent / pot.allocated) * 100) : 0;
  const over = pot.spent > pot.allocated;

  return (
    <div
      className="rounded-2xl p-5 border border-border/50 shadow-card relative overflow-hidden transition-transform hover:-translate-y-0.5"
      style={{ background: "var(--gradient-card)" }}
    >
      <div
        className="absolute -right-8 -top-8 size-32 rounded-full opacity-20 blur-2xl"
        style={{ background: pot.color }}
      />
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2.5">
          <div
            className="size-9 rounded-lg flex items-center justify-center"
            style={{ background: `color-mix(in oklab, ${pot.color} 18%, transparent)` }}
          >
            <Icon className="size-4" style={{ color: pot.color }} />
          </div>
          <div className="font-medium">{pot.label}</div>
        </div>
        <div
          className={`text-xs px-2 py-0.5 rounded-full ${
            over ? "bg-destructive/20 text-destructive" : "bg-muted/60 text-muted-foreground"
          }`}
        >
          {Math.round(pct)}%
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3 relative">
        <span className="font-display text-2xl font-bold">{formatCurrency(pot.spent)}</span>
        <span className="text-sm text-muted-foreground">/ {formatCurrency(pot.allocated)}</span>
      </div>

      <div className="h-2 rounded-full bg-muted/60 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: over ? "var(--color-destructive)" : pot.color,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Remaining</span>
        <span className={over ? "text-destructive font-medium" : "text-foreground"}>
          {formatCurrency(remaining)}
        </span>
      </div>
    </div>
  );
}
