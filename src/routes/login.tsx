import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — SmartSave AI" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const login = useStore((s) => s.login);
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const hasOnboarded = useStore((s) => s.hasOnboarded);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate({ to: hasOnboarded ? "/" : "/onboarding" });
  }, [isAuthenticated, hasOnboarded, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.includes("@")) next.email = "Enter a valid email";
    if (password.length < 4) next.password = "Min 4 characters";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    login(email);
    navigate({ to: "/" });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your SmartSave account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Login"}
        </Button>
      </form>
    </AuthLayout>
  );
}
