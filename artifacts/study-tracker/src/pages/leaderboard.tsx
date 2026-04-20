import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Star, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  // In a real implementation, we would fetch top users and guilds from an API.
  // We'll mock the data for this UI demonstration.
  
  const mockTopUsers = [
    { rank: 1, name: "StudyMaster99", xp: 14500, avatar: "🧙‍♂️" },
    { rank: 2, name: "FocusNinja", xp: 12200, avatar: "🥷" },
    { rank: 3, name: "You (Player 1)", xp: 8400, avatar: "🧑‍💻" },
    { rank: 4, name: "LearnBot", xp: 6000, avatar: "🤖" },
    { rank: 5, name: "PomodoroKing", xp: 5100, avatar: "👑" },
  ];

  const mockTopGuilds = [
    { rank: 1, name: "The Scholars", xp: 154000, members: 12 },
    { rank: 2, name: "Night Owls", xp: 120500, members: 8 },
    { rank: 3, name: "Code Breakers", xp: 95000, members: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8 font-mono overflow-y-auto selection:bg-primary">
      <div className="absolute inset-0 z-0 opacity-10 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      <header className="flex items-center gap-4 mb-12 relative z-10">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white rounded-full bg-black/50 border border-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
            Leaderboards
          </h1>
          <p className="text-sm text-gray-400 uppercase tracking-widest">Global Rankings & Guilds</p>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Global Leaderboard */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Trophy className="w-8 h-8 text-amber-400" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Global Top 5</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {mockTopUsers.map((user, i) => (
              <motion.div 
                key={user.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl border ${user.rank === 3 ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'border-white/10 bg-black/40'} hover:scale-[1.02] transition-transform`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center font-black rounded-full ${user.rank === 1 ? 'bg-amber-400 text-black' : user.rank === 2 ? 'bg-gray-300 text-black' : user.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                    #{user.rank}
                  </div>
                  <div className="text-2xl">{user.avatar}</div>
                  <div className="font-bold uppercase tracking-wider">{user.name}</div>
                </div>
                <div className="flex items-center gap-2 text-primary font-black">
                  {user.xp.toLocaleString()} <Star className="w-4 h-4 fill-primary" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Guild Leaderboard */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Users className="w-8 h-8 text-cyan-400" />
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">Top Guilds</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            {mockTopGuilds.map((guild, i) => (
              <motion.div 
                key={guild.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/40 hover:scale-[1.02] hover:border-cyan-400/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center font-black rounded-full ${guild.rank === 1 ? 'bg-amber-400 text-black' : guild.rank === 2 ? 'bg-gray-300 text-black' : guild.rank === 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-400'}`}>
                    #{guild.rank}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold uppercase tracking-wider text-cyan-400">{guild.name}</div>
                    <div className="text-xs text-gray-500 uppercase">{guild.members} Members</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-primary font-black">
                  {guild.xp.toLocaleString()} <Star className="w-4 h-4 fill-primary" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button className="w-full mt-4 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-xl h-14 uppercase font-bold tracking-widest">
            <Users className="w-5 h-5 mr-2" /> Join or Create Guild
          </Button>
        </div>
      </div>
    </div>
  );
}
