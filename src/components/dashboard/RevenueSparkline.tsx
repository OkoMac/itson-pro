import { seedMonthlyFinancials } from '@/data/seed';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function RevenueSparkline() {
  const data = seedMonthlyFinancials;
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const trend = ((latest.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);
  const isUp = latest.revenue >= prev.revenue;

  return (
    <div className="surface-raised border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">Revenue Trend</h2>
        </div>
        <span className={`text-[10px] font-mono ${isUp ? 'text-status-healthy' : 'text-status-critical'}`}>
          {isUp ? '+' : ''}{trend}%
        </span>
      </div>
      <div className="text-xl font-mono font-semibold text-foreground mb-2">
        R{(latest.revenue / 1000).toFixed(0)}k
      </div>
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="month" hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="surface-raised border border-border rounded p-2 text-xs shadow-lg">
                    <span className="text-foreground font-mono">R{(payload[0].value as number / 1000).toFixed(0)}k</span>
                  </div>
                );
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(217, 91%, 60%)"
              fill="hsl(217, 91%, 60%)"
              fillOpacity={0.1}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
