import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { PotCard } from "@/components/PotCard";
import { useStore, useTotals } from "@/lib/store";
import { TrendingUp, Wallet, PiggyBank, AlertTriangle, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SmartSave AI" },
      { name: "description", content: "Your AI-powered budgeting dashboard. Track pots, savings, and daily safe spending." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AuthGate>
      <AppShell>
        <Dashboard />
      </AppShell>
    </AuthGate>
  );
}

function Dashboard() {
  const { income, pots } = useStore();
  const { totalSpent, remaining, savingsProgress, dailySafe, daysLeft, alerts } = useTotals();
  const savings = pots.find((p) => p.key === "savings")!;

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl">
      <header>
        <div className="text-sm text-muted-foreground mb-1">Welcome back 👋</div>
        <h1 className="text-3xl lg:text-4xl font-bold">
          Your <span className="gradient-text">smart budget</span> overview
        </h1>
      </header>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Monthly Income" value={formatCurrency(income)} accent />
        <StatCard icon={TrendingUp} label="Spent so far" value={formatCurrency(totalSpent)}sub={`of ${formatCurrency(income)}`} />
        <StatCard
          icon={PiggyBank}
          label="Remaining balance"
          value={formatCurrency(remaining)}
          sub={`${daysLeft} days left`}
          tone={remaining < 0 ? "danger" : "success"}
        />
         <StatCard
    icon={Calendar}
    label="Daily safe spend"
    value={formatCurrency(dailySafe)}
    sub="recommended/day"
  />
      </div>

      {/* Savings progress */}
      <div
        className="rounded-2xl p-6 border border-border/50 shadow-card relative overflow-hidden"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-hero)", filter: "blur(80px)" }} />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Savings goal progress</div>
            <div className="font-display text-3xl font-bold">
                {formatCurrency(savings.spent)}
                <span className="text-muted-foreground text-xl font-normal">/ {formatCurrency(savings.allocated)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="font-display text-2xl font-bold gradient-text">{Math.round(savingsProgress)}%</div>
          </div>
        </div>
        <div className="relative h-3 rounded-full bg-muted/60 mt-4 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${savingsProgress}%`, background: "var(--gradient-mint)" }} />
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-5 flex gap-3">
          <AlertTriangle className="size-5 text-warning mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="font-medium text-warning">Spending alerts</div>
            <ul className="text-sm text-muted-foreground space-y-0.5">
              {alerts.map((a) => (
                <li key={a.key}>
                  <span className="text-foreground">{a.label}</span> is at <span className="font-semibold">{a.pct}%</span>
                  {a.over ? " — over budget!" : " of allocated budget."}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Pots */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Category pots</h2>
          <div className="text-sm text-muted-foreground">{pots.length} active</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {pots.map((p) => (
            <PotCard key={p.key} pot={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  tone?: "success" | "danger";
}) {
  const valueColor = accent
    ? "text-primary-foreground"
    : tone === "danger"
    ? "text-destructive"
    : tone === "success"
    ? "text-success"
    : "";
  return (
    <div
      className={`rounded-2xl p-5 border shadow-card transition-transform hover:-translate-y-0.5 ${
        accent ? "border-primary/30" : "border-border/50"
      }`}
      style={{ background: accent ? "var(--gradient-mint)" : "var(--gradient-card)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs uppercase tracking-wider ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
          {label}
        </span>
        <Icon className={`size-4 ${accent ? "text-primary-foreground" : "text-muted-foreground"}`} />
      </div>
      <div className={`font-display text-2xl font-bold ${valueColor}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{sub}</div>}
    </div>
  );
}
