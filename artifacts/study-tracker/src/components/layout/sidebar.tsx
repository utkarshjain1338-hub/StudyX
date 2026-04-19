import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, ListTodo, History, LogOut, User, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export function Sidebar({ className, onLinkClick }: { className?: string; onLinkClick?: () => void }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { theme, toggleTheme } = useTheme();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "All Tasks", icon: ListTodo },
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
          <h1 className="font-serif font-semibold text-lg text-foreground tracking-tight">Scholar</h1>
          <p className="text-xs text-muted-foreground font-sans tracking-[0.15em] uppercase">Study Tracker</p>
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

      {/* Theme Toggle */}
      <div className="px-2 mb-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-border/60 bg-secondary/40 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
          aria-label="Toggle theme"
        >
          <span className="text-xs font-bold uppercase tracking-widest">
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </span>
          <div className="relative w-10 h-5 rounded-full bg-border/80 group-hover:bg-primary/20 transition-colors">
            <motion.div
              className={cn(
                "absolute top-0.5 h-4 w-4 rounded-full flex items-center justify-center",
                theme === "dark" ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/60%)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
              )}
              animate={{ x: theme === "dark" ? 22 : 2 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.span
                    key="moon"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-2.5 h-2.5 text-white" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="sun"
                    initial={{ scale: 0, rotate: 90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-2.5 h-2.5 text-amber-800" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.button>
      </div>

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
      )}
    </aside>
  );
}
