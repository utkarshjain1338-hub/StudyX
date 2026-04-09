import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { Sidebar } from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import History from "@/pages/history";

function Router() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 w-full overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/history" component={History} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
