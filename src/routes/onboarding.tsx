import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { useStore, type SpendingStyle } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{ title: "Get started — SmartSave AI" }],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const navigate = useNavigate();
  const [income, setIncome] = useState("4000");
  const [goal, setGoal] = useState("800");
  const [style, setStyle] = useState<SpendingStyle>("moderate");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate({ to: "/login" });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const incomeNum = Number(income);
    const goalNum = Number(goal);
    if (!incomeNum || incomeNum <= 0) {
      toast.error("Enter a valid monthly income");
      return;
    }
    if (!goalNum || goalNum <= 0) {
      toast.error("Enter a valid savings goal");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    completeOnboarding({ income: incomeNum, savingsGoal: goalNum, spendingStyle: style });
    toast.success("Welcome! Your budget is ready.");
    navigate({ to: "/" });
  };

  return (
    <AuthLayout
      title="Let's set up your budget"
      subtitle="A few details to personalize your pots and savings."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="income">Monthly income</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-display text-lg">
              ₹
            </span>
            <Input
              id="income"
              type="number"
              min={0}
              className="pl-7"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal">Monthly savings goal</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-display text-lg">
              ₹
            </span>
            <Input
              id="goal"
              type="number"
              min={0}
              className="pl-7"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Spending style</Label>
          <Select value={style} onValueChange={(v) => setStyle(v as SpendingStyle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative — save more</SelectItem>
              <SelectItem value="moderate">Moderate — balanced</SelectItem>
              <SelectItem value="flexible">Flexible — enjoy more</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="size-4" /> Generate My Budget
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
