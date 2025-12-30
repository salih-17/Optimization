import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import UploadPage from "@/pages/upload";
import ConfigurePage from "@/pages/configure";
import OptimizePage from "@/pages/optimize";
import ResultsPage from "@/pages/results";

function Router() {
  return (
    <Switch>
      <Route path="/" component={UploadPage} />
      <Route path="/configure" component={ConfigurePage} />
      <Route path="/optimize" component={OptimizePage} />
      <Route path="/results" component={ResultsPage} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-3 border-b border-border bg-card sticky top-0 z-50">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-hidden">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
