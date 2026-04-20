import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, Lock, Sparkles, Zap, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Shop() {
  const currentXp = 1450; // Mock current XP
  
  const shopItems = [
    { id: 1, name: "Neon Cyan Theme", type: "Theme", cost: 500, icon: Zap, color: "text-cyan-400", bg: "bg-cyan-400/10", unlocked: true },
    { id: 2, name: "Inferno Red Theme", type: "Theme", cost: 1000, icon: Sparkles, color: "text-rose-500", bg: "bg-rose-500/10", unlocked: false },
    { id: 3, name: "Titan Shield Avatar", type: "Avatar", cost: 2000, icon: Shield, color: "text-indigo-400", bg: "bg-indigo-400/10", unlocked: false },
    { id: 4, name: "Emperor Crown Avatar", type: "Avatar", cost: 5000, icon: Crown, color: "text-amber-400", bg: "bg-amber-400/10", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-mono overflow-y-auto selection:bg-primary">
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <header className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full bg-black/50 border border-white/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
              Loot Shop
            </h1>
            <p className="text-sm text-gray-400 uppercase tracking-widest">Trade XP for Glory</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-black/50 border border-white/10 px-6 py-3 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-xl">{currentXp.toLocaleString()} XP</span>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {shopItems.map((item, i) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex flex-col p-6 rounded-2xl border transition-all ${item.unlocked ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/10 bg-black/60 hover:scale-105 hover:border-white/30'}`}
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${item.bg} border border-white/5`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
            
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">{item.type}</div>
            <h3 className="text-xl font-bold uppercase tracking-wider mb-6 flex-1">{item.name}</h3>
            
            {item.unlocked ? (
              <Button className="w-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 border border-emerald-500/50 uppercase tracking-widest font-bold">
                Equipped
              </Button>
            ) : (
              <Button 
                disabled={currentXp < item.cost}
                className={`w-full uppercase tracking-widest font-bold ${currentXp >= item.cost ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 'bg-gray-800 text-gray-500 border-gray-700'}`}
              >
                {currentXp < item.cost ? <Lock className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                {item.cost} XP
              </Button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
