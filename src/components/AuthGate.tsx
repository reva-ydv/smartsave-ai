import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

/**
 * Client-side auth guard. Redirects to /login when unauthenticated,
 * and to /onboarding when authenticated but not yet set up.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const navigate = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    } else if (!hasOnboarded && loc.pathname !== "/onboarding") {
      navigate({ to: "/onboarding" });
    }
  }, [isAuthenticated, hasOnboarded, loc.pathname, navigate]);

  if (!isAuthenticated) return null;
  if (!hasOnboarded && loc.pathname !== "/onboarding") return null;
  return <>{children}</>;
}
