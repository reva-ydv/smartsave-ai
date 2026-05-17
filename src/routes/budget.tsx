import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useStore } from "@/lib/store";
import { useState, useEffect  } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/budget")({
  head: () => ({
    meta: [
      { title: "Budget Generator — SmartSave AI" },
      { name: "description", content: "Generate AI-powered category allocations from your monthly income." },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <BudgetPage />
      </AppShell>
    </AuthGate>
  ),
});

function BudgetPage() {
  const { income, pots, aiExplanation, generateBudget } = useStore();
  const [draft, setDraft] = useState(income.toString());
  useEffect(() => {
  setDraft(income.toString());
}, [income]);

  const submit = async(e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(draft);
    if (!v || v <= 0) {
      toast.error("Enter a valid income amount");
      return;
    }
    await generateBudget(v);
    toast.success("Budget regenerated!");
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl">
      <header>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          Smart <span className="gradient-text">budget generator</span>
        </h1>
        <p className="text-muted-foreground">Enter your monthly income — we'll allocate across pots intelligently.</p>
      </header>

      <form onSubmit={submit} className="rounded-2xl p-6 border border-border/50 shadow-card" style={{ background: "var(--gradient-card)" }}>
        <label className="text-sm text-muted-foreground mb-2 block">Monthly income</label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-input/60 border border-border focus-within:border-primary transition-colors">
            <span className="text-muted-foreground font-display text-xl">₹</span>
            <input
              type="number"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="bg-transparent flex-1 outline-none font-display text-xl"
              placeholder="4000"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-medium text-primary-foreground inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-glow"
            style={{ background: "var(--gradient-mint)" }}
          >
            <Wand2 className="size-4" /> Generate
          </button>
        </div>
      </form>

      {/* AI explanation */}
      <div className="rounded-2xl p-6 border border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">AI Explanation</span>
        </div>
        <p
          className="text-sm leading-relaxed text-foreground/90"
          dangerouslySetInnerHTML={{ __html: aiExplanation.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>') }}
        />
      </div>

      {/* Allocation breakdown */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Allocation breakdown</h2>
        <div className="rounded-2xl p-6 border border-border/50 shadow-card space-y-4" style={{ background: "var(--gradient-card)" }}>
          {pots.map((p) => {
            const pct = (p.allocated / Math.max(1, income)) * 100;
            return (
              <div key={p.key}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium">{p.label}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(p.allocated)} <span className="text-xs">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted/60 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
