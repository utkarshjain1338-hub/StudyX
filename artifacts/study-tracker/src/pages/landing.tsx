import { Link } from "wouter";
import { BookOpen, Flame, CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <header className="px-4 md:px-8 py-6 flex items-center justify-between relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-serif font-semibold text-xl tracking-tight text-foreground">Scholar</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          <Link href="/sign-in">
            <Button variant="ghost" className="rounded-full px-6">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full px-6 shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
              Get started
            </Button>
          </Link>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center relative z-10">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(245,158,11,0.2)] relative"
        >
          <motion.div
             animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
             <Flame className="w-10 h-10 text-amber-500 drop-shadow-md" />
          </motion.div>
          <Sparkles className="w-5 h-5 text-amber-400 absolute -top-2 -right-2 animate-pulse" />
        </motion.div>
        
        <motion.h1 
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="font-serif text-6xl md:text-7xl font-semibold text-foreground mb-6 max-w-3xl leading-[1.1] tracking-tight"
        >
          Build your study habit, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-amber-500 animate-gradient">one day at a time</span>
        </motion.h1>
        
        <motion.p 
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="text-muted-foreground text-xl max-w-xl mb-12 leading-relaxed"
        >
          Track your daily study tasks, maintain streaks, and watch your consistency grow — your personal space for focused learning.
        </motion.p>
        
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <Link href="/sign-up">
            <Button size="lg" className="h-14 px-10 rounded-full text-lg shadow-xl shadow-primary/20 transition-all hover:shadow-primary/40 hover:-translate-y-1">
              Start tracking for free
            </Button>
          </Link>
        </motion.div>

        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl text-left w-full">
          {[
            { icon: Flame, title: "Daily streaks", desc: "Keep your daily streak alive by completing at least one task each day.", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: CheckCircle, title: "Task streaks", desc: "Every study task has its own individual streak so you stay consistent.", color: "text-green-500", bg: "bg-green-500/10" },
            { icon: TrendingUp, title: "Weekly history", desc: "See your study patterns at a glance with a 7-day activity view.", color: "text-primary", bg: "bg-primary/10" }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              custom={4 + i}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariant}
              whileHover={{ y: -5 }}
              className="glass p-8 rounded-3xl"
            >
              <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
