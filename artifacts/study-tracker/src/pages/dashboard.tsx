import { useState } from "react";
import { format } from "date-fns";
import { Flame, CheckCircle2, Circle, AlertCircle, Plus, Calendar as CalendarIcon, Clock, Target, Trophy, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetDailyStreak,
  useGetDashboardSummary,
  useGetTaskStreaks,
  useGetWeeklyHistory,
  useMarkCompletion,
  useDeleteCompletion,
  useListCompletions,
  getListCompletionsQueryKey,
  getGetDailyStreakQueryKey,
  getGetDashboardSummaryQueryKey,
  getGetTaskStreaksQueryKey,
  getGetWeeklyHistoryQueryKey
} from "@workspace/api-client-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: streak, isLoading: isLoadingStreak } = useGetDailyStreak();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: taskStreaks, isLoading: isLoadingTasks } = useGetTaskStreaks();
  const { data: weeklyHistory, isLoading: isLoadingWeekly } = useGetWeeklyHistory();
  const { data: todayCompletions } = useListCompletions({ date: today });

  const queryClient = useQueryClient();

  const markCompletion = useMarkCompletion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskStreaksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCompletionsQueryKey({ date: today }) });
        queryClient.invalidateQueries({ queryKey: getGetDailyStreakQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyHistoryQueryKey() });
      }
    }
  });

  const deleteCompletion = useDeleteCompletion({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTaskStreaksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCompletionsQueryKey({ date: today }) });
        queryClient.invalidateQueries({ queryKey: getGetDailyStreakQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeeklyHistoryQueryKey() });
      }
    }
  });

  const handleToggleTask = (taskId: number, isCompleted: boolean) => {
    if (isCompleted) {
      // find the completion id
      const completion = todayCompletions?.find(c => c.taskId === taskId);
      if (completion) {
        deleteCompletion.mutate({ id: completion.id });
      }
    } else {
      markCompletion.mutate({ data: { taskId, date: today } });
    }
  };

  const isLoading = isLoadingStreak || isLoadingSummary || isLoadingTasks || isLoadingWeekly;

  if (isLoading) {
    return (
      <div className="p-8 space-y-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-1" />
          <Skeleton className="h-64 col-span-2" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.
        </h1>
        <p className="text-muted-foreground mt-2 font-sans">
          Your daily study space. {taskStreaks?.length ? "Here's what's on the agenda today." : "You haven't set up any tasks yet."}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Streak Card */}
        <Card className="col-span-1 border-none shadow-sm bg-card overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-500",
                streak?.isActiveToday
                  ? "bg-accent/20 text-accent shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Flame className={cn("w-12 h-12", streak?.isActiveToday && "animate-pulse")} />
            </motion.div>
            <h3 className="text-5xl font-serif font-bold mb-2 text-foreground">
              {streak?.currentStreak || 0}
            </h3>
            <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Day Streak
            </p>
            
            {streak?.isActiveToday ? (
              <p className="text-sm mt-4 text-accent font-medium bg-accent/10 px-3 py-1 rounded-full">
                You're on fire today!
              </p>
            ) : (
              <p className="text-sm mt-4 text-muted-foreground">
                Complete a task to extend it
              </p>
            )}
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="col-span-1 md:col-span-2 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Overview</CardTitle>
            <CardDescription>Your progress at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Today</span>
                </div>
                <div className="text-3xl font-bold font-serif text-foreground">
                  {summary?.completedToday || 0} <span className="text-xl text-muted-foreground">/ {summary?.totalTasks || 0}</span>
                </div>
                <div className="mt-2">
                  <Progress 
                    value={summary?.totalTasks ? ((summary?.completedToday || 0) / summary.totalTasks) * 100 : 0} 
                    className="h-1.5" 
                  />
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">Longest Streak</span>
                </div>
                <div className="text-3xl font-bold font-serif text-foreground">
                  {summary?.longestDailyStreak || 0} <span className="text-xl text-muted-foreground">days</span>
                </div>
              </div>

              <div className="bg-secondary/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">All Time</span>
                </div>
                <div className="text-3xl font-bold font-serif text-foreground">
                  {summary?.totalCompletionsAllTime || 0}
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium uppercase tracking-wider">This Week</span>
                </div>
                <div className="text-3xl font-bold font-serif text-foreground">
                  {Math.round(summary?.completionRateThisWeek || 0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="col-span-1 md:col-span-2 border-none shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="font-serif">Today's Tasks</CardTitle>
              <CardDescription>Click to mark as complete</CardDescription>
            </div>
            <Link href="/tasks" className="text-sm font-medium text-primary hover:underline">
              Manage Tasks
            </Link>
          </CardHeader>
          <CardContent>
            {taskStreaks?.length === 0 ? (
              <div className="text-center py-12 px-4 border border-dashed rounded-xl">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-1">No tasks yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create your first study task to start tracking.</p>
                <Link href="/tasks" className="inline-flex items-center justify-center bg-primary text-primary-foreground h-9 px-4 rounded-md text-sm font-medium transition-colors hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {taskStreaks?.map((task, i) => (
                    <motion.div
                      key={task.taskId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleToggleTask(task.taskId, task.isCompletedToday)}
                      className={cn(
                        "group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
                        task.isCompletedToday 
                          ? "bg-secondary/30 border-secondary/50 opacity-70 hover:opacity-100" 
                          : "bg-background border-border hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300"
                        style={{ backgroundColor: task.taskColor, opacity: task.isCompletedToday ? 0.3 : 1 }}
                      />
                      
                      <div className="flex items-center gap-4 pl-2">
                        <motion.div 
                          whileTap={{ scale: 0.8 }}
                          className={cn(
                            "flex items-center justify-center rounded-full w-6 h-6 shrink-0 transition-colors",
                            task.isCompletedToday ? "text-primary" : "text-muted-foreground group-hover:text-primary/50"
                          )}
                        >
                          {task.isCompletedToday ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                        </motion.div>
                        
                        <div>
                          <h4 className={cn(
                            "font-medium transition-all",
                            task.isCompletedToday ? "text-muted-foreground line-through decoration-muted-foreground/30" : "text-foreground"
                          )}>
                            {task.taskName}
                          </h4>
                          {task.currentStreak > 0 && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-medium" style={{ color: task.taskColor }}>
                              <Flame className="w-3 h-3" />
                              <span>{task.currentStreak} day streak</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Activity Grid */}
        <Card className="col-span-1 border-none shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="font-serif">Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {weeklyHistory?.map((day, i) => {
                const dateObj = new Date(day.date + "T00:00:00");
                const isToday = day.date === today;
                const hasActivity = day.completedCount > 0;
                
                return (
                  <div key={day.date} className="flex items-center gap-4">
                    <div className="w-10 text-xs font-medium text-muted-foreground text-right uppercase tracking-wider">
                      {isToday ? "TODAY" : format(dateObj, "EEE")}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div 
                        className={cn(
                          "h-8 rounded-md transition-all duration-500",
                          hasActivity ? "bg-primary" : "bg-secondary",
                          isToday && !hasActivity && "border border-primary/20 border-dashed"
                        )}
                        style={{ 
                          width: hasActivity ? `${Math.max(15, Math.min(100, (day.completedCount / Math.max(1, summary?.totalTasks || 1)) * 100))}%` : '8px',
                          opacity: hasActivity ? 0.8 + (day.completedCount * 0.1) : 1
                        }}
                      />
                      {hasActivity && (
                        <span className="text-xs font-medium text-muted-foreground">{day.completedCount}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t flex justify-between items-center text-sm text-muted-foreground">
              <Link href="/history" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <CalendarIcon className="w-4 h-4" />
                <span>View full history</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
