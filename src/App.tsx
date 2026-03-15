import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/context/DemoContext";
import { AppShell } from "@/components/layout/AppShell";
import { AnimatedRoutes } from "@/components/layout/AnimatedRoutes";
import { PwaManager } from "@/components/pwa/PwaManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PwaManager />
      <BrowserRouter>
        <DemoProvider>
          <AppShell>
            <AnimatedRoutes />
          </AppShell>
        </DemoProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
