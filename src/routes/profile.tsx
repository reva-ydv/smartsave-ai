import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AuthGate } from "@/components/AuthGate";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogOut, Save, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile — SmartSave AI" }],
  }),
  component: () => (
    <AuthGate>
      <AppShell>
        <ProfilePage />
      </AppShell>
    </AuthGate>
  ),
});

function ProfilePage() {
  const user = useStore((s) => s.user);
  const income = useStore((s) => s.income);
  const savingsGoal = useStore((s) => s.savingsGoal);
  const updateProfile = useStore((s) => s.updateProfile);
  const logout = useStore((s) => s.logout);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [incomeInput, setIncomeInput] = useState(String(income));
  const [goalInput, setGoalInput] = useState(String(savingsGoal));

  // ✅ FIXED FUNCTION
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateProfile({
      user: { name: name.trim(), email: email.trim() },
      income: Number(incomeInput) || 0,
      savingsGoal: Number(goalInput) || 0,
    });

    toast.success("Profile updated");
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl space-y-8">
      <header className="flex items-center gap-4">
        <div
          className="size-14 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "var(--gradient-mint)" }}
        >
          <UserIcon className="size-6 text-primary-foreground" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Signed in as</div>
          <h1 className="font-display text-2xl font-bold">
            {user?.name || "Your profile"}
          </h1>
        </div>
      </header>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-border/50 shadow-card p-6 space-y-5"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="income">Monthly income</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="income"
                type="number"
                min={0}
                className="pl-7"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal">Savings goal</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ₹
              </span>
              <Input
                id="goal"
                type="number"
                min={0}
                className="pl-7"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button type="submit">
            <Save className="size-4" /> Save changes
          </Button>

          <Button type="button" variant="outline" onClick={handleLogout}>
            <LogOut className="size-4" /> Logout
          </Button>
        </div>
      </form>
    </div>
  );
}