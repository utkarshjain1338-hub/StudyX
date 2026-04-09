import { Link, useLocation } from "wouter";
import { BookOpen, LayoutDashboard, ListTodo, History, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, useClerk } from "@clerk/react";

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

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
          const active = isActive(link.href);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto border-t border-border/50 pt-4">
          <div className="flex items-center gap-3 px-2 mb-3">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "User"}
              </p>
              {user.primaryEmailAddress && user.fullName && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.primaryEmailAddress.emailAddress}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
