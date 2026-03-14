import { useNavigate } from 'react-router-dom';
import { useDemo } from '@/context/DemoContext';
import { KpiCardRow } from '@/components/dashboard/KpiCardRow';
import { OrdersAtRiskPanel } from '@/components/dashboard/OrdersAtRiskPanel';
import { WorkflowPressurePanel } from '@/components/dashboard/WorkflowPressurePanel';
import { EventTimelinePanel } from '@/components/dashboard/EventTimelinePanel';
import { ApprovalsPanel } from '@/components/dashboard/ApprovalsPanel';
import { AiSummaryPanel } from '@/components/dashboard/AiSummaryPanel';
import { RevenueSparkline } from '@/components/dashboard/RevenueSparkline';
import { BeforeAfterWidget } from '@/components/dashboard/BeforeAfterWidget';

const DashboardPage = () => {
  const { state } = useDemo();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <KpiCardRow onNavigate={navigate} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <OrdersAtRiskPanel />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="cursor-pointer" onClick={() => navigate('/orders')}>
              <WorkflowPressurePanel />
            </div>
            <div className="cursor-pointer" onClick={() => navigate('/financials')}>
              <RevenueSparkline />
            </div>
          </div>
          <BeforeAfterWidget />
        </div>
        <div className="space-y-4">
          <div className="cursor-pointer" onClick={() => navigate('/events')}>
            <EventTimelinePanel />
          </div>
          <div className="cursor-pointer" onClick={() => navigate('/approvals')}>
            <ApprovalsPanel />
          </div>
          <AiSummaryPanel />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
