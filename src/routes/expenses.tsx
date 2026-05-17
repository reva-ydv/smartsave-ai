import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useStore, type PotKey } from "@/lib/store";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/expenses")({
  head: () => ({
    meta: [
      { title: "Expenses — SmartSave AI" },
      { name: "description", content: "Add and review your expenses. Pots update automatically." },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <ExpensesPage />
      </AppShell>
    </AuthGate>
  ),
});

function ExpensesPage() {
  const { pots, expenses, addExpense, removeExpense } = useStore();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<PotKey>("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(amount);
    if (!a || a <= 0) return toast.error("Enter a valid amount");
    addExpense({ amount: a, category, note, date: new Date(date).toISOString() });
    setAmount("");
    setNote("");
    toast.success(`$${a} added to ${category}`);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl">
      <header>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          Track <span className="gradient-text">expenses</span>
        </h1>
        <p className="text-muted-foreground">Log spending and watch your pots update in real time.</p>
      </header>

      <form
        onSubmit={submit}
        className="rounded-2xl p-6 border border-border/50 shadow-card grid grid-cols-1 md:grid-cols-5 gap-3"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="md:col-span-1">
          <label className="text-xs text-muted-foreground mb-1 block">Amount</label>
          <div className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-input/60 border border-border">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent w-full outline-none"
              placeholder="0"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PotKey)}
            className="w-full px-3 py-2.5 rounded-lg bg-input/60 border border-border outline-none"
          >
            {pots.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground mb-1 block">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input/60 border border-border outline-none"
            placeholder="e.g. Lunch with team"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-input/60 border border-border outline-none"
          />
        </div>
        <div className="md:col-span-5">
          <button
            type="submit"
            className="w-full px-6 py-3 rounded-xl font-medium text-primary-foreground inline-flex items-center justify-center gap-2 hover:opacity-90 shadow-glow"
            style={{ background: "var(--gradient-mint)" }}
          >
            <Plus className="size-4" /> Add expense
          </button>
        </div>
      </form>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent expenses</h2>
          {expenses.length > 0 && (
            <span className="text-xs text-muted-foreground">{expenses.length} total</span>
          )}
        </div>
        <div className="rounded-2xl border border-border/50 shadow-card overflow-hidden" style={{ background: "var(--gradient-card)" }}>
          {expenses.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto size-12 rounded-full bg-muted/40 flex items-center justify-center mb-3">
                <Plus className="size-5 text-muted-foreground" />
              </div>
              <div className="font-medium mb-1">No expenses yet</div>
              <p className="text-sm text-muted-foreground">Add your first expense above to start tracking.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/50">
              {expenses.map((e) => {
                const pot = pots.find((p) => p.key === e.category)!;
                return (
                  <li key={e.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors animate-in fade-in duration-300">
                    <div
                      className="size-10 rounded-lg shrink-0"
                      style={{ background: `color-mix(in oklab, ${pot.color} 25%, transparent)`, border: `1px solid ${pot.color}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{e.note || pot.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {pot.label} · {new Date(e.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="font-display font-semibold text-destructive">−${e.amount.toLocaleString()}</div>
                    <button
                      onClick={() => removeExpense(e.id)}
                      className="text-muted-foreground hover:text-destructive p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
