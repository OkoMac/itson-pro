import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DemoProvider } from "@/context/DemoContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { AnimatedRoutes } from "@/components/layout/AnimatedRoutes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthShell } from "@/components/auth/AuthShell";
import { PwaManager } from "@/components/pwa/PwaManager";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PwaManager />
      <BrowserRouter basename="/oip/clg">
        <AuthProvider>
          <Routes>
            {/* ── Auth routes (unauthenticated shell) ── */}
            <Route element={<AuthShell />}>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* ── Protected app routes with animated transitions ── */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DemoProvider>
                    <AppShell>
                      <AnimatedRoutes />
                    </AppShell>
                  </DemoProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
