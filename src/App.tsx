import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/context/DemoContext";
import { AppShell } from "@/components/layout/AppShell";
import DashboardPage from "./pages/DashboardPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import FinancialsPage from "./pages/FinancialsPage";
import EventsPage from "./pages/EventsPage";
import DocumentsPage from "./pages/DocumentsPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import RepairsPage from "./pages/RepairsPage";
import StockPage from "./pages/StockPage";
import TasksPage from "./pages/TasksPage";
import AssistantPage from "./pages/AssistantPage";
import ScenariosPage from "./pages/ScenariosPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DemoProvider>
          <AppShell>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/financials" element={<FinancialsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/repairs" element={<RepairsPage />} />
              <Route path="/stock" element={<StockPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="/scenarios" element={<ScenariosPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShell>
        </DemoProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
