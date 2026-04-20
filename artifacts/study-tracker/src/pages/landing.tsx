import { Link } from "wouter";
import { Gamepad2, Flame, Sword, Shield, Trophy, Star, Sparkles, Zap, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, type Variants } from "framer-motion";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.15, duration: 0.6, type: "spring", bounce: 0.4 },
  }),
};

const floatVariant: Variants = {
  animate: (custom: number) => ({
    y: ["-10px", "10px", "-10px"],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 3 + custom,
      repeat: Infinity,
      ease: "easeInOut"
    }
  })
};

const pulseVariant: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0px 0px 0px rgba(var(--primary), 0)",
      "0px 0px 20px rgba(var(--primary), 0.5)",
      "0px 0px 0px rgba(var(--primary), 0)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col relative overflow-hidden font-mono selection:bg-primary selection:text-primary-foreground">
      
      {/* Animated Cyber Grid Background */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Floating Game Assets */}
      <motion.div custom={1} variants={floatVariant} animate="animate" className="absolute top-[15%] left-[10%] text-amber-400 z-0 opacity-60">
        <Star className="w-16 h-16" />
      </motion.div>
      <motion.div custom={2} variants={floatVariant} animate="animate" className="absolute bottom-[25%] right-[15%] text-emerald-400 z-0 opacity-60">
        <Shield className="w-20 h-20" />
      </motion.div>
      <motion.div custom={0.5} variants={floatVariant} animate="animate" className="absolute top-[30%] right-[10%] text-blue-400 z-0 opacity-60">
        <Zap className="w-12 h-12" />
      </motion.div>
      <motion.div custom={1.5} variants={floatVariant} animate="animate" className="absolute bottom-[20%] left-[20%] text-rose-500 z-0 opacity-60">
        <Sword className="w-14 h-14" />
      </motion.div>

      <header className="px-4 md:px-8 py-6 flex items-center justify-between relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <span className="font-black text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
            STUDY X
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="flex items-center gap-4 uppercase font-bold text-sm tracking-wider"
        >
          <Link href="/sign-in">
            <Button variant="ghost" className="hover:text-primary hover:bg-primary/10">Log In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-transparent hover:border-white shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all">
              New Game
            </Button>
          </Link>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center relative z-10">
        
        {/* Main Title Area */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="relative inline-block mb-8"
        >
          <motion.div 
            className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <h1 className="relative font-black text-6xl md:text-8xl tracking-tighter uppercase italic drop-shadow-2xl text-white">
            Level Up Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary animate-gradient bg-[length:200%_auto]">
              Intelligence
            </span>
          </h1>
        </motion.div>

        <motion.p
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="text-gray-400 text-lg md:text-2xl max-w-2xl mb-12 uppercase tracking-wide border-y border-white/10 py-4 bg-black/30 backdrop-blur-sm"
        >
          Defeat procrastination. <br/> Gain XP by completing daily quests. <br/> Build an unbreakable combo streak.
        </motion.p>

        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
        >
          <Link href="/sign-up">
            <motion.div variants={pulseVariant} animate="animate">
              <Button size="lg" className="h-16 px-12 rounded-none bg-primary text-primary-foreground text-xl font-black uppercase tracking-widest border-4 border-primary-foreground/20 hover:border-white hover:scale-105 transition-all">
                <Sparkles className="w-6 h-6 mr-3" />
                Press Start
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Feature Cards as "Classes / Mechanics" */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
          {[
            { 
              icon: Flame, 
              title: "Combo Streaks", 
              desc: "Maintain your daily multiplier. Miss a day, and your combo breaks. Keep the fire burning.", 
              color: "text-amber-500", 
              border: "border-amber-500/30",
              bg: "bg-amber-500/10" 
            },
            { 
              icon: Crosshair, 
              title: "Quest Targets", 
              desc: "Set specific time limits and goals for your study sessions. Hit the bullseye for maximum XP.", 
              color: "text-cyan-400", 
              border: "border-cyan-400/30",
              bg: "bg-cyan-400/10" 
            },
            { 
              icon: Trophy, 
              title: "Rank Up", 
              desc: "Review past material with our Spaced Repetition engine to solidify your knowledge base.", 
              color: "text-emerald-400", 
              border: "border-emerald-400/30",
              bg: "bg-emerald-400/10" 
            }
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              custom={3 + i}
              initial="hidden"
              animate="visible"
              variants={fadeUpVariant}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`p-8 rounded-xl bg-[#111] border-2 ${feature.border} relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${feature.bg} blur-xl`} />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full ${feature.bg} flex items-center justify-center mb-6 border ${feature.border}`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed font-sans font-medium">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
