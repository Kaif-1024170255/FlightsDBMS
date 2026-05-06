import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, CartesianGrid
} from 'recharts';
import { CloudRain, Recycle, Zap, Droplet } from 'lucide-react';

const mockChartData = [
  { name: 'Jan', co2: 4000, fuel: 2400 },
  { name: 'Feb', co2: 3000, fuel: 1398 },
  { name: 'Mar', co2: 2000, fuel: 9800 },
  { name: 'Apr', co2: 2780, fuel: 3908 },
  { name: 'May', co2: 1890, fuel: 4800 },
  { name: 'Jun', co2: 2390, fuel: 3800 },
];

const wasteData = [
  { name: 'Plastic',  kg: 35.5 },
  { name: 'Food',     kg: 13.0 },
  { name: 'Recycled', kg: 22.0 },
];

const tooltipStyle = {
  background: '#162019',
  border: '1px solid #2a3f30',
  borderRadius: '8px',
  fontSize: '0.8rem',
  color: '#d1fae5',
  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/sustainability/metrics')
      .then(res => { setMetrics(res.data); setLoading(false); })
      .catch(() => {
        setMetrics({ total_co2: 19125, total_recycled: 22, total_waste: 35.5, avg_score: 75.4, recycling_rate: 61.9 });
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-muted">Loading metrics…</p>;

  return (
    <div className="animate-fade-in">
      {/* KPI Row */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="kpi-card kpi-danger">
          <div className="kpi-icon danger"><CloudRain size={20} /></div>
          <div>
            <p className="kpi-label">Total CO₂ Emitted</p>
            <p className="kpi-value">{metrics.total_co2}<span>kg</span></p>
          </div>
        </div>

        <div className="kpi-card kpi-success">
          <div className="kpi-icon success"><Recycle size={20} /></div>
          <div>
            <p className="kpi-label">Recycling Rate</p>
            <p className="kpi-value">{metrics.recycling_rate}<span>%</span></p>
          </div>
        </div>

        <div className="kpi-card kpi-warning">
          <div className="kpi-icon warning"><Zap size={20} /></div>
          <div>
            <p className="kpi-label">Avg. Sustainability Score</p>
            <p className="kpi-value">{metrics.avg_score}<span>/ 100</span></p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="chart-grid">
        <div className="card">
          <p className="card-title">CO₂ Emissions vs Fuel Usage</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={mockChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3028" />
                <XAxis dataKey="name" stroke="#3d6b4a" tick={{ fontSize: 12, fill: '#6aaa7e' }} />
                <YAxis stroke="#3d6b4a" tick={{ fontSize: 12, fill: '#6aaa7e' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="co2"  name="CO₂ (kg)" stroke="#4ade80" fill="url(#gradCo2)"  strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="fuel" name="Fuel (L)" stroke="#34d399" fill="url(#gradFuel)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <p className="card-title">Waste Composition</p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={wasteData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f3028" />
                <XAxis dataKey="name" stroke="#3d6b4a" tick={{ fontSize: 12, fill: '#6aaa7e' }} />
                <YAxis stroke="#3d6b4a" tick={{ fontSize: 12, fill: '#6aaa7e' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="kg" name="Waste (kg)" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
