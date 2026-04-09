import { useMemo } from "react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, History as HistoryIcon, Clock, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";

import {
  useGetWeeklyHistory,
  useGetDashboardSummary,
  useListTasks,
  useGetTaskStreaks
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function History() {
  const { data: weeklyHistory, isLoading: isLoadingHistory } = useGetWeeklyHistory();
  const { data: tasks, isLoading: isLoadingTasks } = useListTasks();
  const { data: taskStreaks, isLoading: isLoadingStreaks } = useGetTaskStreaks();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();

  const isLoading = isLoadingHistory || isLoadingTasks || isLoadingStreaks || isLoadingSummary;

  // Generate an array of the last 30 days for a GitHub-style contribution graph
  const last30Days = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      days.push(subDays(today, i));
    }
    return days;
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  // Create a map of date strings to completion counts from weeklyHistory (we only have 7 days from API, but we'll map what we have)
  const historyMap = new Map(weeklyHistory?.map(h => [h.date, h]) || []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">History</h1>
        <p className="text-muted-foreground mt-2 font-sans">
          Look back at what you've achieved. Every session counts.
        </p>
      </header>

      {/* 30-Day Activity Heatmap (Using last 7 days data, rest empty since API only gives weekly) */}
      <Card className="border-none shadow-sm bg-card overflow-hidden">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Your study consistency over time</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-3xl font-serif font-bold text-foreground">{summary?.totalCompletionsAllTime || 0}</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-serif font-bold text-foreground">{Math.round(summary?.completionRateThisWeek || 0)}%</p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">This Week</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {last30Days.map((date, i) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayData = historyMap.get(dateStr);
              const count = dayData?.completedCount || 0;
              const hasActivity = count > 0;
              
              // Only color days we actually have data for from the weekly API, or leave blank
              // Since API only gives last 7 days, older days will appear empty in this UI until the API is expanded
              
              let intensityClass = "bg-secondary";
              if (count > 0) {
                if (count >= 3) intensityClass = "bg-primary text-primary-foreground";
                else if (count === 2) intensityClass = "bg-primary/70 text-primary-foreground";
                else intensityClass = "bg-primary/40 text-primary-foreground";
              }

              return (
                <div 
                  key={dateStr}
                  title={`${format(date, "MMM d, yyyy")}: ${count} completions`}
                  className={cn(
                    "w-8 h-8 rounded flex items-center justify-center text-xs font-medium transition-all duration-300 hover:scale-110 cursor-default",
                    intensityClass,
                    isSameDay(date, new Date()) && "ring-2 ring-offset-2 ring-primary ring-offset-background"
                  )}
                >
                  {count > 0 ? count : ""}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-end">
            <span>Less</span>
            <div className="w-3 h-3 rounded bg-secondary" />
            <div className="w-3 h-3 rounded bg-primary/40" />
            <div className="w-3 h-3 rounded bg-primary/70" />
            <div className="w-3 h-3 rounded bg-primary" />
            <span>More</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Streaks Leaderboard */}
        <Card className="border-none shadow-sm bg-card h-full">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-accent" />
              Active Streaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taskStreaks?.filter(t => t.currentStreak > 0).length === 0 ? (
              <div className="text-center py-10">
                <Flame className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">No active task streaks. Complete a task today to start one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {taskStreaks?.filter(t => t.currentStreak > 0)
                  .sort((a, b) => b.currentStreak - a.currentStreak)
                  .map((task, i) => (
                  <div key={task.taskId} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: task.taskColor }} />
                      <span className="font-medium text-foreground">{task.taskName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
                      <Flame className="w-3.5 h-3.5" />
                      {task.currentStreak} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Performance */}
        <Card className="border-none shadow-sm bg-card h-full">
          <CardHeader>
            <CardTitle className="font-serif text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Task Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.map(task => {
                const streakData = taskStreaks?.find(s => s.taskId === task.id);
                return (
                  <div key={task.id} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium" style={{ color: task.color }}>{task.name}</span>
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {task.category || 'Uncategorized'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-background rounded p-2 text-center border">
                        <p className="text-xs text-muted-foreground mb-0.5">Current Streak</p>
                        <p className="font-semibold text-foreground">{streakData?.currentStreak || 0}</p>
                      </div>
                      <div className="bg-background rounded p-2 text-center border">
                        <p className="text-xs text-muted-foreground mb-0.5">Longest Streak</p>
                        <p className="font-semibold text-foreground">{streakData?.longestStreak || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {tasks?.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-10">No tasks created yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
