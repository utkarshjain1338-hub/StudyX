import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Calendar, Flame, Target, Circle, CheckCircle2, Tag } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import {
  useListTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useGetTaskStreaks,
  getListTasksQueryKey,
  getGetTaskStreaksQueryKey,
  getGetDashboardSummaryQueryKey
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const COLORS = [
  "#8B5CF6", // primary violet
  "#F59E0B", // amber
  "#10B981", // emerald
  "#3B82F6", // blue
  "#EC4899", // pink
  "#F43F5E", // rose
  "#6366F1", // indigo
  "#14B8A6", // teal
];

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

export default function Tasks() {
  const queryClient = useQueryClient();
  const { data: tasks, isLoading } = useListTasks();
  const { data: taskStreaks } = useGetTaskStreaks();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<any>(null);
  const [deletingTask, setDeletingTask] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: COLORS[0],
    category: "",
    targetMinutesPerDay: ""
  });

  const createTask = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStreaksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        setIsCreateOpen(false);
        resetForm();
      }
    }
  });

  const updateTask = useUpdateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStreaksQueryKey() });
        setIsEditOpen(false);
        setEditingTask(null);
        resetForm();
      }
    }
  });

  const deleteTask = useDeleteTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetTaskStreaksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        setIsDeleteOpen(false);
        setDeletingTask(null);
      }
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      category: "",
      targetMinutesPerDay: ""
    });
  };

  const openEdit = (task: any) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description || "",
      color: task.color,
      category: task.category || "",
      targetMinutesPerDay: task.targetMinutesPerDay?.toString() || ""
    });
    setIsEditOpen(true);
  };

  const openDelete = (task: any) => {
    setDeletingTask(task);
    setIsDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description || null,
      color: formData.color,
      category: formData.category || null,
      targetMinutesPerDay: formData.targetMinutesPerDay ? parseInt(formData.targetMinutesPerDay) : null
    };

    if (isEditOpen && editingTask) {
      updateTask.mutate({ id: editingTask.id, data: payload });
    } else {
      createTask.mutate({ data: payload });
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-8 max-w-4xl mx-auto"
    >
      <motion.header variants={itemVariants} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-2 font-sans text-lg">
            Manage your study habits and daily goals.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2 shrink-0 rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </motion.header>

      {tasks?.length === 0 ? (
        <motion.div variants={itemVariants} className="text-center py-20 px-4 border border-dashed border-border/60 rounded-3xl bg-background/30 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Target className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">No tasks defined</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-lg leading-relaxed">
            Create your first study task to start tracking your progress and building a streak.
          </p>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="rounded-full px-8 h-12 text-md">
            Create First Task
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {tasks?.map((task, i) => {
              const streakInfo = taskStreaks?.find(s => s.taskId === task.id);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="glass-card overflow-hidden border-0 shadow-md h-full flex flex-col group">
                    <div 
                      className="h-2.5 w-full transition-all duration-300 opacity-80 group-hover:opacity-100"
                      style={{ backgroundColor: task.color }}
                    />
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-xl text-foreground leading-tight tracking-tight">
                          {task.name}
                        </h3>
                        <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity translate-x-0 md:translate-x-2 md:group-hover:translate-x-0 duration-200">
                          <button 
                            onClick={() => openEdit(task)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDelete(task)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-auto pt-5 border-t border-border/40">
                        {streakInfo?.currentStreak ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-secondary/50 px-3 py-1.5 rounded-full" style={{ color: task.color }}>
                            <Flame className="w-4 h-4" />
                            <span>{streakInfo.currentStreak} day streak</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                            <Circle className="w-4 h-4" />
                            <span>Not started</span>
                          </div>
                        )}
                        
                        {task.category && (
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-background border border-border/50 text-foreground px-3 py-1.5 rounded-full shadow-sm">
                            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                            {task.category}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          setTimeout(resetForm, 200);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{isEditOpen ? 'Edit Task' : 'New Task'}</DialogTitle>
              <DialogDescription>
                {isEditOpen ? 'Update your task details below.' : 'Add a new habit or study subject to track.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input 
                  id="name" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. Read 10 pages, Practice French"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="What exactly needs to be done?"
                  className="resize-none h-20"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input 
                    id="category" 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Language, Math"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minutes">Target Minutes (Optional)</Label>
                  <Input 
                    id="minutes" 
                    type="number"
                    min="1"
                    value={formData.targetMinutesPerDay} 
                    onChange={e => setFormData({...formData, targetMinutesPerDay: e.target.value})}
                    placeholder="e.g. 30"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Color Indicator</Label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={cn(
                        "w-8 h-8 rounded-full transition-transform outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        formData.color === color ? "scale-110 ring-2 ring-ring ring-offset-2" : "hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); }}
                disabled={createTask.isPending || updateTask.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending || updateTask.isPending || !formData.name.trim()}>
                {isEditOpen ? 'Save Changes' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTask?.name}"? This action cannot be undone, and all completion history for this task will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTask.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (deletingTask) {
                  deleteTask.mutate({ id: deletingTask.id });
                }
              }}
              disabled={deleteTask.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
