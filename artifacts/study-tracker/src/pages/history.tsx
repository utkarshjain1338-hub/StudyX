import { useMemo } from "react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, History as HistoryIcon, Clock, CheckCircle2, Flame } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import {
  useGetWeeklyHistory,
  useGetDashboardSummary,
  useListTasks,
  useGetTaskStreaks
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

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
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  // Create a map of date strings to completion counts from weeklyHistory (we only have 7 days from API, but we'll map what we have)
  const historyMap = new Map(weeklyHistory?.map(h => [h.date, h]) || []);

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-5xl mx-auto space-y-8"
    >
      <motion.header variants={itemVariants} className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">History</h1>
        <p className="text-muted-foreground mt-2 font-sans text-lg">
          Look back at what you've achieved. Every session counts.
        </p>
      </motion.header>

      {/* 30-Day Activity Heatmap (Using last 7 days data, rest empty since API only gives weekly) */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-0 shadow-lg overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your study consistency over time</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-4xl font-serif font-bold text-foreground">{summary?.totalCompletionsAllTime || 0}</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Sessions</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-serif font-bold text-foreground">{Math.round(summary?.completionRateThisWeek || 0)}%</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">This Week</p>
              </div>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 pt-2">
              {last30Days.map((date, i) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayData = historyMap.get(dateStr);
                const count = dayData?.completedCount || 0;
                
                let intensityClass = "bg-secondary/40";
                if (count > 0) {
                  if (count >= 3) intensityClass = "bg-primary text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/40%)]";
                  else if (count === 2) intensityClass = "bg-primary/70 text-primary-foreground";
                  else intensityClass = "bg-primary/35 text-primary-foreground";
                }

                return (
                  <motion.div 
                    key={dateStr}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 + 0.1 }}
                    title={`${format(date, "MMM d, yyyy")}: ${count} completions`}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110 hover:z-10 cursor-default border border-border/20",
                      intensityClass,
                      isSameDay(date, new Date()) && "ring-2 ring-primary ring-offset-2 ring-offset-background z-20"
                    )}
                  >
                    {count > 0 ? count : ""}
                  </motion.div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 mt-6 text-xs font-medium text-muted-foreground justify-end uppercase tracking-widest">
              <span>Less</span>
              <div className="w-3 h-3 rounded-sm bg-secondary" />
              <div className="w-3 h-3 rounded-sm bg-primary/40" />
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              <div className="w-3 h-3 rounded-sm bg-primary" />
              <span>More</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Streaks Leaderboard */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500 animate-pulse" />
                Active Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {taskStreaks?.filter(t => t.currentStreak > 0).length === 0 ? (
                <div className="text-center py-10">
                  <Flame className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm font-medium">No active task streaks. Complete a task today to start one!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {taskStreaks?.filter(t => t.currentStreak > 0)
                      .sort((a, b) => b.currentStreak - a.currentStreak)
                      .map((task, i) => (
                      <motion.div 
                        key={task.taskId} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 + 0.4 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: task.taskColor }} />
                          <span className="font-semibold text-foreground text-lg">{task.taskName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm ring-1 ring-amber-500/20">
                          <Flame className="w-4 h-4" />
                          {task.currentStreak} days
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Task Performance */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-0 shadow-lg h-full">
            <CardHeader>
              <CardTitle className="font-serif text-2xl flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Task Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <AnimatePresence>
                  {tasks?.map((task, i) => {
                    const streakData = taskStreaks?.find(s => s.taskId === task.id);
                    return (
                      <motion.div 
                        key={task.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        className="p-4 rounded-xl bg-secondary/30 border border-border/30 hover:border-primary/20 transition-colors"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-lg" style={{ color: task.color }}>{task.name}</span>
                          <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest bg-background px-2 py-1 rounded-md">
                            {task.category || 'Uncategorized'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-background/80 rounded-lg p-3 text-center border border-border/50">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Current</p>
                            <p className="font-serif font-bold text-2xl text-foreground">{streakData?.currentStreak || 0}</p>
                          </div>
                          <div className="bg-background/80 rounded-lg p-3 text-center border border-border/50">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Longest</p>
                            <p className="font-serif font-bold text-2xl text-foreground">{streakData?.longestStreak || 0}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {tasks?.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm font-medium py-10">No tasks created yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
