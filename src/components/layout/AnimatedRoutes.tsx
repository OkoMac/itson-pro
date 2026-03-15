import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import CustomersPage from '@/pages/CustomersPage';
import FinancialsPage from '@/pages/FinancialsPage';
import EventsPage from '@/pages/EventsPage';
import DocumentsPage from '@/pages/DocumentsPage';
import ApprovalsPage from '@/pages/ApprovalsPage';
import RepairsPage from '@/pages/RepairsPage';
import StockPage from '@/pages/StockPage';
import TasksPage from '@/pages/TasksPage';
import AssistantPage from '@/pages/AssistantPage';
import ScenariosPage from '@/pages/ScenariosPage';
import NotFound from '@/pages/NotFound';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.12 } },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedPage><DashboardPage /></AnimatedPage>} />
        <Route path="/orders" element={<AnimatedPage><OrdersPage /></AnimatedPage>} />
        <Route path="/customers" element={<AnimatedPage><CustomersPage /></AnimatedPage>} />
        <Route path="/financials" element={<AnimatedPage><FinancialsPage /></AnimatedPage>} />
        <Route path="/events" element={<AnimatedPage><EventsPage /></AnimatedPage>} />
        <Route path="/documents" element={<AnimatedPage><DocumentsPage /></AnimatedPage>} />
        <Route path="/approvals" element={<AnimatedPage><ApprovalsPage /></AnimatedPage>} />
        <Route path="/repairs" element={<AnimatedPage><RepairsPage /></AnimatedPage>} />
        <Route path="/stock" element={<AnimatedPage><StockPage /></AnimatedPage>} />
        <Route path="/tasks" element={<AnimatedPage><TasksPage /></AnimatedPage>} />
        <Route path="/assistant" element={<AnimatedPage><AssistantPage /></AnimatedPage>} />
        <Route path="/scenarios" element={<AnimatedPage><ScenariosPage /></AnimatedPage>} />
        <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}
