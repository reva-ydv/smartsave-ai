import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, Wallet, Receipt, BarChart3, MessageCircle, Sparkles, User as UserIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/summary", label: "Summary", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const SIDE_EXTRA = [{ to: "/chat", label: "Assistant", icon: MessageCircle }] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const user = useStore((s) => s.user);
  const allNav = [...NAV.slice(0, 4), ...SIDE_EXTRA, NAV[4]];
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-border/50 glass p-6 sticky top-0 h-screen">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-mint)" }}>
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-lg font-bold leading-none">SmartSave</div>
            <div className="text-xs text-muted-foreground tracking-wider">AI BUDGETING</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {allNav.map(({ to, label, icon: Icon }) => {
            const active = loc.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-primary/15 text-primary shadow-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/profile"
          className="mt-auto p-3 rounded-xl border border-border/50 bg-card/40 flex items-center gap-3 hover:bg-card/70 transition-colors"
        >
          <div className="size-9 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "var(--gradient-mint)", color: "oklch(0.18 0.03 260)" }}>
            {(user?.name?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-muted-foreground truncate">{user?.email ?? "Not signed in"}</div>
          </div>
        </Link>
      </aside>

      {/* Mobile top nav */}
      <header className="md:hidden glass border-b border-border/50 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-mint)" }}>
            <Sparkles className="size-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold">SmartSave</span>
        </Link>
      </header>

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/50 grid grid-cols-5">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
