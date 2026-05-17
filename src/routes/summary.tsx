import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/summary")({
  head: () => ({
    meta: [
      { title: "Monthly Summary — SmartSave AI" },
      { name: "description", content: "See planned vs actual spending across categories with charts." },
    ],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <SummaryPage />
      </AppShell>
    </AuthGate>
  ),
});

function SummaryPage() {
  const { pots, income } = useStore();

  const barData = pots.map((p) => ({
    name: p.label,
    Planned: p.allocated,
    Actual: p.spent,
    color: p.color,
  }));

  const pieData = pots
    .filter((p) => p.spent > 0)
    .map((p) => ({ name: p.label, value: p.spent, color: p.color }));

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl">
      <header>
        <h1 className="text-3xl lg:text-4xl font-bold mb-2">
          Monthly <span className="gradient-text">summary</span>
        </h1>
        <p className="text-muted-foreground">Planned vs actual spending across all pots.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className="lg:col-span-2 rounded-2xl p-6 border border-border/50 shadow-card"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Planned vs Actual</h2>
            <span className="text-xs text-muted-foreground">Income: ${income.toLocaleString()}</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="oklch(0.7 0.02 260)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.21 0.025 260)",
                    border: "1px solid oklch(0.3 0.025 260)",
                    borderRadius: 12,
                    color: "white",
                  }}
                  cursor={{ fill: "oklch(1 0 0 / 5%)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Planned" fill="oklch(0.4 0.04 260)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Actual" fill="oklch(0.84 0.18 165)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          className="rounded-2xl p-6 border border-border/50 shadow-card"
          style={{ background: "var(--gradient-card)" }}
        >
          <h2 className="font-semibold mb-4">Spending mix</h2>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
              No spending yet.
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {pieData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="oklch(0.16 0.02 260)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.21 0.025 260)",
                      border: "1px solid oklch(0.3 0.025 260)",
                      borderRadius: 12,
                      color: "white",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Variance table</h2>
        <div className="rounded-2xl border border-border/50 shadow-card overflow-hidden" style={{ background: "var(--gradient-card)" }}>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground uppercase tracking-wider">
              <tr className="border-b border-border/50">
                <th className="text-left p-4">Pot</th>
                <th className="text-right p-4">Planned</th>
                <th className="text-right p-4">Actual</th>
                <th className="text-right p-4">Variance</th>
                <th className="text-right p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {pots.map((p) => {
                const variance = p.allocated - p.spent;
                const over = variance < 0;
                return (
                  <tr key={p.key} className="border-b border-border/30 last:border-0">
                    <td className="p-4 font-medium flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                      {p.label}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">${p.allocated.toLocaleString()}</td>
                    <td className="p-4 text-right">${p.spent.toLocaleString()}</td>
                    <td className={`p-4 text-right font-medium ${over ? "text-destructive" : "text-success"}`}>
                      {over ? "−" : "+"}${Math.abs(variance).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          over ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                        }`}
                      >
                        {over ? "Over" : "On track"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
