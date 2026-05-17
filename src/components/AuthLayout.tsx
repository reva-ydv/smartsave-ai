import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 justify-center mb-8">
          <div
            className="size-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-mint)" }}
          >
            <Sparkles className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-xl font-bold leading-none">SmartSave</div>
            <div className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">AI Budgeting</div>
          </div>
        </Link>

        <div
          className="rounded-2xl border border-border/50 shadow-card p-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{ background: "var(--gradient-card)" }}
        >
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>

        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
