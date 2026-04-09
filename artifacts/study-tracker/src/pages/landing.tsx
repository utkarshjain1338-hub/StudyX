import { Link } from "wouter";
import { BookOpen, Flame, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-serif font-semibold text-lg">Scholar</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-8">
          <Flame className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="font-serif text-5xl font-semibold text-foreground mb-5 max-w-xl leading-tight">
          Build your study habit, one day at a time
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mb-10 leading-relaxed">
          Track your daily study tasks, maintain streaks, and watch your consistency grow — your personal space for focused learning.
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="px-8">Start tracking for free</Button>
        </Link>

        <div className="mt-20 grid grid-cols-3 gap-10 max-w-2xl text-left">
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Daily streaks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Keep your daily streak alive by completing at least one task each day.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Task streaks</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every study task has its own individual streak so you stay consistent on each subject.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Weekly history</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See your study patterns at a glance with a 7-day activity view and progress stats.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
