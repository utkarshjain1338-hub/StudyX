import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useListTasks, useGetTaskStreaks } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { ArrowLeft, Book, Lock, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SkillTree() {
  const { data: tasks } = useListTasks();
  const { data: streaks } = useGetTaskStreaks();

  // Very simple layout logic: Group tasks by depth
  const nodes = useMemo(() => {
    if (!tasks) return [];
    
    // Calculate depths
    const depths = new Map<number, number>();
    const getDepth = (id: number): number => {
      if (depths.has(id)) return depths.get(id)!;
      const task = tasks.find(t => t.id === id);
      if (!task || !task.prerequisiteTaskId) {
        depths.set(id, 0);
        return 0;
      }
      const depth = getDepth(task.prerequisiteTaskId) + 1;
      depths.set(id, depth);
      return depth;
    };

    tasks.forEach(t => getDepth(t.id));

    // Group by depth
    const levels: Record<number, typeof tasks> = {};
    let maxDepth = 0;
    tasks.forEach(t => {
      const d = depths.get(t.id) || 0;
      if (!levels[d]) levels[d] = [];
      levels[d].push(t);
      if (d > maxDepth) maxDepth = d;
    });

    return { levels, maxDepth };
  }, [tasks]);

  const isUnlocked = (task: any) => {
    if (!task.prerequisiteTaskId) return true;
    const streakInfo = streaks?.find(s => s.taskId === task.prerequisiteTaskId);
    return streakInfo && streakInfo.currentStreak > 0;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-mono overflow-y-auto">
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <header className="flex items-center gap-4 mb-12 relative z-10">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full bg-black/50 border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
            Skill Tree
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest">Master nodes to unlock new paths</p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center gap-16 py-12">
        {nodes.levels && Object.keys(nodes.levels).map((depthStr) => {
          const depth = parseInt(depthStr);
          const levelTasks = nodes.levels[depth];
          
          return (
            <div key={depth} className="flex flex-wrap justify-center gap-8 md:gap-16 w-full relative">
              {/* Note: SVG lines between depths could be added here by calculating precise DOM coordinates, but for simplicity we rely on vertical visual grouping */}
              
              {levelTasks.map(task => {
                const unlocked = isUnlocked(task);
                const streakInfo = streaks?.find(s => s.taskId === task.id);
                const isActive = streakInfo && streakInfo.currentStreak > 0;

                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: depth * 0.2 }}
                    className="relative flex flex-col items-center"
                  >
                    {/* Connection Line Upwards */}
                    {task.prerequisiteTaskId && (
                      <div className={`absolute -top-16 w-0.5 h-16 ${unlocked ? 'bg-primary/50' : 'bg-white/10'} -z-10`} />
                    )}

                    <div 
                      className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center border-2 transition-all duration-300
                        ${unlocked 
                          ? `border-[${task.taskColor}] bg-black/50 shadow-[0_0_20px_${task.taskColor}30] hover:scale-105 hover:shadow-[0_0_30px_${task.taskColor}50] cursor-pointer` 
                          : 'border-white/10 bg-black/80 text-gray-600 grayscale cursor-not-allowed'
                        }`}
                      style={unlocked ? { borderColor: task.taskColor, color: task.taskColor } : {}}
                    >
                      {!unlocked ? (
                        <Lock className="w-8 h-8 mb-2" />
                      ) : isActive ? (
                        <Flame className="w-8 h-8 mb-2 drop-shadow-md" />
                      ) : (
                        <Book className="w-8 h-8 mb-2" />
                      )}
                      <span className="text-[10px] font-bold text-center uppercase tracking-wider px-2 line-clamp-2 leading-tight">
                        {task.taskName}
                      </span>
                    </div>

                    {/* Pre-req hint */}
                    {!unlocked && task.prerequisiteTaskId && (
                      <div className="absolute top-full mt-2 w-max text-[9px] text-gray-500 uppercase tracking-wider bg-black/80 px-2 py-1 rounded">
                        Requires Prerequisite
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          );
        })}
        
        {(!tasks || tasks.length === 0) && (
          <div className="text-gray-500 text-center uppercase tracking-widest mt-20">
            No active quests available in the Skill Tree.
          </div>
        )}
      </div>
    </div>
  );
}
