import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, ListTodo, History, Flame, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "All Tasks", icon: ListTodo },
    { href: "/history", label: "History", icon: History },
  ];

  return (
    <aside className="w-64 border-r border-border/50 bg-card h-screen sticky top-0 flex flex-col pt-8 pb-6 px-4 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-semibold text-lg text-foreground">Scholar</h1>
          <p className="text-xs text-muted-foreground font-sans tracking-wide uppercase">Study Tracker</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
