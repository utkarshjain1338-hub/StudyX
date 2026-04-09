import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Edit2, Trash2, Calendar, Flame, Target, Circle, CheckCircle2, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-2 font-sans">
            Manage your study habits and daily goals.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </header>

      {tasks?.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-card">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-serif font-medium text-foreground mb-2">No tasks defined</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first study task to start tracking your progress and building a streak.
          </p>
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
            Create First Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {tasks?.map((task, i) => {
              const streakInfo = taskStreaks?.find(s => s.taskId === task.id);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <Card className="overflow-hidden border-none shadow-sm group hover:shadow-md transition-all">
                    <div 
                      className="h-2 w-full"
                      style={{ backgroundColor: task.color }}
                    />
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-lg text-foreground leading-tight">
                          {task.name}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openEdit(task)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDelete(task)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-border/50">
                        {streakInfo?.currentStreak ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: task.color }}>
                            <Flame className="w-3.5 h-3.5" />
                            <span>{streakInfo.currentStreak} day streak</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Circle className="w-3.5 h-3.5" />
                            <span>Not started</span>
                          </div>
                        )}
                        
                        {task.category && (
                          <div className="flex items-center gap-1.5 text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                            <Tag className="w-3 h-3" />
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
        </div>
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
    </div>
  );
}
