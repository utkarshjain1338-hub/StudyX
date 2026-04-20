import { useState, useEffect } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useGetTaskStreaks, useMarkCompletion } from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, ArrowLeft, Heart, Skull, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function FocusMode() {
  const [match, params] = useRoute("/focus/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const taskId = params?.id ? parseInt(params.id) : null;

  const { data: taskStreaks } = useGetTaskStreaks();
  const task = taskStreaks?.find(t => t.taskId === taskId);

  const initialTime = (task?.targetMinutesPerDay || 25) * 60;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);

  // Boss Fight State
  const [bossMaxHp] = useState(initialTime);
  const [bossHp, setBossHp] = useState(initialTime);
  const [playerMaxHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [isDefeated, setIsDefeated] = useState(false);
  const [bossWarning, setBossWarning] = useState("");

  const markCompletion = useMarkCompletion({
    mutation: {
      onSuccess: () => {
        toast({ title: "Boss Defeated!", description: "You gained XP and loot! Task completed." });
        setIsDefeated(true);
        setIsRunning(false);
      }
    }
  });

  useEffect(() => {
    if (!taskId || (!task && taskStreaks)) {
      setLocation("/tasks");
    }
  }, [taskId, task, taskStreaks, setLocation]);

  // Tab visibility listener (Penalty for leaving tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isRunning) {
        setIsRunning(false);
        setPlayerHp(prev => Math.max(0, prev - 20)); // -20 HP penalty
        setBossWarning("The Boss attacks while you look away! (-20 HP)");
        toast({ title: "Focus Lost!", description: "You switched tabs! The boss attacked you.", variant: "destructive" });
        
        if (playerHp - 20 <= 0) {
          toast({ title: "You Died", description: "You lost all your HP. Try again.", variant: "destructive" });
          resetTimer();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isRunning, playerHp]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setBossHp((prev) => prev - 1);
        setBossWarning("");
      }, 1000);
    } else if (timeLeft === 0 && !isDefeated && isRunning) {
      setIsRunning(false);
      // Mark as completed
      if (taskId) {
        markCompletion.mutate({
          data: {
            taskId,
            date: format(new Date(), "yyyy-MM-dd"),
            minutesStudied: task?.targetMinutesPerDay ?? 25,
          }
        });
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isDefeated, taskId, task, markCompletion]);

  const toggleTimer = () => setIsRunning(!isRunning);
  
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    setBossHp(initialTime);
    setPlayerHp(playerMaxHp);
    setIsDefeated(false);
    setBossWarning("");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f] text-white flex flex-col items-center p-8 font-mono overflow-hidden selection:bg-primary">
      <div className="absolute inset-0 z-0 opacity-20 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link href="/tasks">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full w-12 h-12 bg-black/50 border border-white/10">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Battle UI */}
      <div className="w-full max-w-4xl flex justify-between items-start mt-8 z-10">
        
        {/* Player Stats */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg tracking-widest uppercase">
            <Heart className="w-6 h-6 fill-emerald-400" /> Player
          </div>
          <div className="w-48 h-4 bg-black border border-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
              animate={{ width: `${(playerHp / playerMaxHp) * 100}%` }}
              transition={{ type: "spring" }}
            />
          </div>
          <span className="text-xs text-gray-400">{playerHp} / {playerMaxHp} HP</span>
        </div>

        {/* Boss Stats */}
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-lg tracking-widest uppercase">
            {task.taskName} Boss <Skull className="w-6 h-6" />
          </div>
          <div className="w-64 md:w-96 h-4 bg-black border border-white/20 rounded-full overflow-hidden flex justify-end">
            <motion.div 
              className="h-full bg-rose-500 shadow-[0_0_10px_#f43f5e]"
              animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
              transition={{ type: "tween", duration: 1 }}
            />
          </div>
          <span className="text-xs text-gray-400">{bossHp} / {bossMaxHp} HP</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center flex-1 max-w-2xl w-full z-10"
      >
        <AnimatePresence>
          {bossWarning && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/4 flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400 px-6 py-3 rounded-full font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.3)]"
            >
              <ShieldAlert className="w-5 h-5" />
              {bossWarning}
            </motion.div>
          )}
        </AnimatePresence>

        {isDefeated ? (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-6xl font-black text-amber-400 uppercase tracking-widest drop-shadow-[0_0_30px_#f59e0b] mb-4">Victory!</h2>
            <p className="text-gray-300 text-xl mb-12">The boss has been defeated. XP added to your profile.</p>
            <Link href="/tasks">
              <Button size="lg" className="bg-primary text-primary-foreground text-xl font-bold px-12 py-6 uppercase tracking-widest hover:scale-105 transition-transform border-2 border-primary-foreground/20">
                Claim Loot
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div 
              animate={{ 
                scale: isRunning ? [1, 1.02, 1] : 1,
                textShadow: isRunning ? [`0 0 20px ${task.taskColor}40`, `0 0 60px ${task.taskColor}80`, `0 0 20px ${task.taskColor}40`] : `0 0 20px ${task.taskColor}20`
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none mb-16 text-white drop-shadow-2xl"
            >
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </motion.div>

            <div className="flex items-center gap-6">
              <Button 
                onClick={toggleTimer}
                disabled={playerHp <= 0}
                className="w-24 h-24 rounded-full shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all border-4 border-white/10 hover:scale-105"
                style={{ 
                  backgroundColor: isRunning ? 'hsl(var(--secondary))' : task.taskColor,
                  color: isRunning ? 'hsl(var(--foreground))' : 'white'
                }}
              >
                {isRunning ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-2" />}
              </Button>

              <Button 
                onClick={resetTimer}
                variant="outline"
                className="w-16 h-16 rounded-full border-white/20 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white transition-all"
              >
                <Square className="w-6 h-6" />
              </Button>
            </div>
          </>
        )}
      </motion.div>

      {/* Vibe coding fluid gradients */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 mix-blend-screen blur-[120px] transition-all duration-1000 z-0"
        style={{ 
          background: `radial-gradient(circle at 50% 50%, ${task.taskColor}, transparent 60%)`,
          transform: isRunning ? 'scale(1.1)' : 'scale(0.9)',
          opacity: isRunning ? 0.3 : 0.1
        }}
      />
    </div>
  );
}
