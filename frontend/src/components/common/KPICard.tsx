import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  trendUp?: boolean;
  icon: React.ElementType;
}

export default function KPICard({ label, value, trend, trendUp = true, icon: Icon }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon">
          <Icon size={18} />
        </div>
      </div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-trend ${trendUp ? 'up' : 'down'}`}>
        {trendUp ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
        {trend}
        <span className="kpi-trend-label">vs last month</span>
      </div>
    </div>
  );
}

