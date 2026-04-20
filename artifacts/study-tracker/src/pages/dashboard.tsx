import { useState } from "react";
import { format } from "date-fns";
import { Flame, CheckCircle2, Circle, AlertCircle, Plus, Calendar as CalendarIcon, Clock, Target, Trophy, TrendingUp, ListTodo } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
import { useTheme } from "@/components/theme-provider";

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

export default function Dashboard() {
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: streak, isLoading: isLoadingStreak } = useGetDailyStreak();
  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary();
  const { data: taskStreaks, isLoading: isLoadingTasks } = useGetTaskStreaks();
  const { data: weeklyHistory, isLoading: isLoadingWeekly } = useGetWeeklyHistory();
  const { data: todayCompletions } = useListCompletions({ date: today });
  const { theme } = useTheme();
  const isCommandCenter = theme === "command-center";

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
          <Skeleton className="h-64 col-span-1 rounded-3xl" />
          <Skeleton className="h-64 col-span-2 rounded-3xl" />
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    );
  }

  const completionPercent = summary?.totalTasks ? ((summary?.completedToday || 0) / summary.totalTasks) * 100 : 0;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 space-y-8 max-w-5xl mx-auto"
    >
      <motion.header variants={itemVariants} className="mb-10 mt-4">
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">
          {isCommandCenter ? "SYSTEM STATUS" : `Good ${new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}.`}
        </h1>
        <p className="text-muted-foreground mt-2 font-sans text-lg">
          {isCommandCenter 
            ? (taskStreaks?.length ? "Alerts requiring mitigation." : "System optimal. No active alerts.") 
            : (taskStreaks?.length ? "Here's what's on the agenda today." : "You haven't set up any tasks yet.")}
        </p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Streak Card */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="glass-card h-full overflow-hidden relative border-0 shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className={cn(
                  "w-28 h-28 rounded-[2rem] flex items-center justify-center mb-6 transition-all duration-700 relative",
                  streak?.isActiveToday
                    ? "bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]"
                    : "bg-muted text-muted-foreground/50"
                )}
              >
                {streak?.isActiveToday && (
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-[2rem] bg-amber-500/20 blur-xl"
                  />
                )}
                <Flame className={cn("w-14 h-14 relative z-10", streak?.isActiveToday && "animate-pulse drop-shadow-lg")} />
              </motion.div>
              <h3 className="text-6xl font-serif font-bold mb-2 text-foreground tracking-tighter">
                {streak?.currentStreak || 0}
              </h3>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Day Streak
              </p>
              
              <AnimatePresence mode="wait">
                {streak?.isActiveToday ? (
                  <motion.p 
                    key="active"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm mt-5 text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-4 py-1.5 rounded-full ring-1 ring-amber-500/20"
                  >
                    {isCommandCenter ? "CHAIN MAINTAINED" : "You're on fire today!"}
                  </motion.p>
                ) : (
                  <motion.p 
                    key="inactive"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm mt-5 text-muted-foreground"
                  >
                    {isCommandCenter ? "AWAITING MITIGATION" : "Complete a task to extend it"}
                  </motion.p>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Summary Stats */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
          <Card className="glass-card h-full border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-2xl">Overview</CardTitle>
              <CardDescription>Your progress at a glance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <motion.div whileHover={{ y: -2 }} className="bg-background/50 rounded-2xl p-5 flex flex-col gap-2 border border-border/30 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Target className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today</span>
                  </div>
                  <div className="text-4xl font-bold font-serif text-foreground">
                    {summary?.completedToday || 0} <span className="text-xl text-muted-foreground font-sans font-medium">/ {summary?.totalTasks || 0}</span>
                  </div>
                  <div className="mt-3 relative h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                    />
                  </div>
                </motion.div>
                
                <motion.div whileHover={{ y: -2 }} className="bg-background/50 rounded-2xl p-5 flex flex-col gap-2 border border-border/30 shadow-sm transition-all hover:shadow-md hover:border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-500 mb-1">
                    <Trophy className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Longest Streak</span>
                  </div>
                  <div className="text-4xl font-bold font-serif text-foreground">
                    {summary?.longestDailyStreak || 0} <span className="text-lg text-muted-foreground font-sans font-medium">days</span>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-background/50 rounded-2xl p-5 flex flex-col gap-2 border border-border/30 shadow-sm transition-all hover:shadow-md hover:border-blue-500/20">
                  <div className="flex items-center gap-2 text-blue-500 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">All Time</span>
                  </div>
                  <div className="text-4xl font-bold font-serif text-foreground">
                    {summary?.totalCompletionsAllTime || 0} <span className="text-lg text-muted-foreground font-sans font-medium">tasks</span>
                  </div>
                </motion.div>
                
                <motion.div whileHover={{ y: -2 }} className="bg-background/50 rounded-2xl p-5 flex flex-col gap-2 border border-border/30 shadow-sm transition-all hover:shadow-md hover:border-green-500/20">
                  <div className="flex items-center gap-2 text-green-500 mb-1">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">This Week</span>
                  </div>
                  <div className="text-4xl font-bold font-serif text-foreground">
                    {Math.round(summary?.completionRateThisWeek || 0)}%
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2">
          <Card className="glass-card border-0 shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle className="font-serif text-2xl">{isCommandCenter ? "ACTIVE ALERTS" : "Today's Tasks"}</CardTitle>
                <CardDescription>{isCommandCenter ? "Click to mitigate" : "Click to mark as complete"}</CardDescription>
              </div>
              <Link href="/tasks" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-4 py-2 rounded-full">
                {isCommandCenter ? "MANAGE ALERTS" : "Manage Tasks"}
              </Link>
            </CardHeader>
            <CardContent>
              {taskStreaks?.length === 0 ? (
                <div className="text-center py-16 px-4 border border-dashed border-border/60 rounded-3xl bg-background/30">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5">
                    <ListTodo className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{isCommandCenter ? "SYSTEM OPTIMAL" : "No tasks yet"}</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{isCommandCenter ? "No active alerts requiring mitigation." : "Create your first study task to start tracking your progress."}</p>
                  <Link href="/tasks" className="inline-flex items-center justify-center bg-primary text-primary-foreground h-11 px-6 rounded-full text-sm font-semibold transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5">
                    <Plus className="w-5 h-5 mr-2" />
                    {isCommandCenter ? "GENERATE ALERT" : "Create Task"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {taskStreaks?.map((task, i) => (
                      <motion.div
                        key={task.taskId}
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10, transition: { duration: 0.2 } }}
                        transition={{ 
                          opacity: { duration: 0.2 },
                          layout: { type: "spring", stiffness: 400, damping: 30 }
                        }}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        onClick={() => handleToggleTask(task.taskId, task.isCompletedToday)}
                        className={cn(
                          "group relative flex items-center justify-between p-5 rounded-2xl border transition-colors duration-300 cursor-pointer overflow-hidden",
                          task.isCompletedToday 
                            ? "bg-secondary/20 border-border/40 opacity-75" 
                            : "bg-background border-border/80 hover:border-primary/40 shadow-sm hover:shadow-md"
                        )}
                      >
                        <motion.div 
                          initial={false}
                          animate={{ 
                            backgroundColor: task.taskColor, 
                            opacity: task.isCompletedToday ? 0.2 : 1,
                            width: task.isCompletedToday ? "100%" : "6px" 
                          }}
                          className="absolute left-0 top-0 bottom-0 z-0"
                        />
                        
                        <div className="flex items-center gap-4 pl-3 relative z-10 w-full">
                          <motion.div 
                            initial={false}
                            animate={{
                              scale: task.isCompletedToday ? [1, 1.2, 1] : 1,
                              rotate: task.isCompletedToday ? [0, 10, 0] : 0,
                              color: task.isCompletedToday ? task.taskColor : "currentColor"
                            }}
                            className={cn(
                              "flex items-center justify-center rounded-full w-7 h-7 shrink-0 transition-colors",
                              !task.isCompletedToday && "text-muted-foreground group-hover:text-foreground/70"
                            )}
                          >
                            {task.isCompletedToday ? <CheckCircle2 className="w-7 h-7" /> : <Circle className="w-7 h-7" />}
                          </motion.div>
                          
                          <div className="flex-1">
                            <motion.h4 
                              initial={false}
                              animate={{
                                opacity: task.isCompletedToday ? 0.6 : 1,
                              }}
                              className={cn(
                                "font-semibold text-lg transition-all",
                                task.isCompletedToday ? "line-through decoration-muted-foreground/40 text-muted-foreground" : "text-foreground"
                              )}>
                              {task.taskName}
                            </motion.h4>
                            {task.currentStreak > 0 && (
                              <motion.div 
                                initial={false}
                                animate={{ opacity: task.isCompletedToday ? 0.6 : 1 }}
                                className="flex items-center gap-1.5 mt-1 text-xs font-bold uppercase tracking-wider" 
                                style={{ color: task.taskColor }}
                              >
                                <Flame className="w-3.5 h-3.5" />
                                <span>{task.currentStreak} day streak</span>
                              </motion.div>
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
        </motion.div>

        {/* Weekly Activity Grid */}
        <motion.div variants={itemVariants} className="col-span-1">
          <Card className="glass-card border-0 shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {weeklyHistory?.map((day, i) => {
                    const dateObj = new Date(day.date + "T00:00:00");
                    const isToday = day.date === today;
                    const hasActivity = day.completedCount > 0;
                    
                    return (
                      <motion.div 
                        key={day.date}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 + 0.3 }}
                        className="flex items-center gap-4 group"
                      >
                        <div className={cn(
                          "w-12 text-xs font-bold text-right uppercase tracking-wider transition-colors",
                          isToday ? "text-primary" : "text-muted-foreground group-hover:text-foreground/70"
                        )}>
                          {isToday ? "TODAY" : format(dateObj, "EEE")}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                          <motion.div 
                            initial={{ width: "8px" }}
                            animate={{ 
                              width: hasActivity ? `${Math.max(15, Math.min(100, (day.completedCount / Math.max(1, summary?.totalTasks || 1)) * 100))}%` : '8px',
                              opacity: hasActivity ? 0.8 + (day.completedCount * 0.1) : 1
                            }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 + 0.5 }}
                            className={cn(
                              "h-10 rounded-xl transition-colors duration-300 relative overflow-hidden",
                              hasActivity ? "bg-primary shadow-sm" : "bg-secondary",
                              isToday && !hasActivity && "border-2 border-primary/20 border-dashed"
                            )}
                          >
                            {hasActivity && (
                              <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            )}
                          </motion.div>
                          <AnimatePresence>
                            {hasActivity && (
                              <motion.span 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 + 1 }}
                                className="text-sm font-bold text-foreground w-4 text-center"
                              >
                                {day.completedCount}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
              <div className="mt-8 pt-6 border-t border-border/50 flex justify-between items-center text-sm">
                <Link href="/history" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium transition-colors p-2 -ml-2 rounded-lg hover:bg-secondary/50">
                  <CalendarIcon className="w-4 h-4" />
                  <span>View full history</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
