import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, ListTodo, History, LogOut, User, Terminal, Target, Trophy, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export function Sidebar({ className, onLinkClick }: { className?: string; onLinkClick?: () => void }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "All Tasks", icon: ListTodo },
    { href: "/skill-tree", label: "Skill Tree", icon: Target },
    { href: "/leaderboard", label: "Guilds & Rank", icon: Trophy },
    { href: "/shop", label: "Loot Shop", icon: ShoppingCart },
    { href: "/history", label: "History", icon: History },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location === href;
  };

  return (
    <aside className={cn("w-64 glass-panel h-screen sticky top-0 hidden md:flex flex-col pt-8 pb-6 px-4 shrink-0 z-50", className)}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shadow-[0_0_20px_hsl(var(--primary)/20%)]">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-semibold text-lg text-foreground tracking-tight">STUDY X</h1>
          <p className="text-xs text-muted-foreground font-sans tracking-[0.15em] uppercase">App</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1.5 relative">
        {links.map((link) => {
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} onClick={onLinkClick}>
              <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer overflow-hidden",
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-xl bg-primary shadow-[0_0_20px_hsl(var(--primary)/30%)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                  />
                )}
                {!active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl bg-secondary/0 hover:bg-secondary/60"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  {link.label}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      {user && (
        <div className="border-t border-border/30 pt-4 px-0">
          <div className="flex items-center gap-3 px-2 mb-3 min-w-0">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-primary/25 shadow-md"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 ring-2 ring-primary/20">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-foreground truncate leading-tight">
                {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User"}
              </p>
              {user.primaryEmailAddress && user.fullName && (
                <p className="text-xs text-muted-foreground truncate opacity-70 mt-0.5">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTheme(theme === "dark" ? "command-center" : "dark")}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer font-medium"
            >
              <Terminal className="w-4 h-4" />
              {theme === "command-center" ? "Standard Mode" : "Command Center"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </motion.button>
          </div>
        </div>
      )}
    </aside>
  );
}
