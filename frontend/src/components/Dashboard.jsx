import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { CloudRain, Recycle, Zap, Droplet } from 'lucide-react';

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_co2: 0,
    total_recycled: 0,
    total_waste: 0,
    avg_score: 0,
    recycling_rate: 0
  });

  const [loading, setLoading] = useState(true);

  // Fallback mock data if API fails or backend isn't started
  const mockChartData = [
    { name: 'Jan', co2: 4000, fuel: 2400 },
    { name: 'Feb', co2: 3000, fuel: 1398 },
    { name: 'Mar', co2: 2000, fuel: 9800 },
    { name: 'Apr', co2: 2780, fuel: 3908 },
    { name: 'May', co2: 1890, fuel: 4800 },
    { name: 'Jun', co2: 2390, fuel: 3800 },
  ];

  useEffect(() => {
    // Attempt to fetch from backend
    axios.get('http://localhost:5000/api/sustainability/metrics')
      .then(res => {
        setMetrics(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend not reachable. Displaying mock data.", err);
        setMetrics({
          total_co2: 19125.00,
          total_recycled: 22.00,
          total_waste: 35.50,
          avg_score: 75.40,
          recycling_rate: 61.9
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-muted">Loading metrics...</div>;

  return (
    <div className="animate-fade-in">
      {/* KPI Cards */}
      <div className="dashboard-grid">
        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <CloudRain size={24} className="text-danger" />
            </div>
            <div>
              <p className="text-muted">Total CO₂ Emitted</p>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{metrics.total_co2} <span style={{fontSize: '1rem'}} className="text-muted">kg</span></h2>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <Recycle size={24} className="text-success" />
            </div>
            <div>
              <p className="text-muted">Recycling Rate</p>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{metrics.recycling_rate}%</h2>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
              <Zap size={24} className="text-warning" />
            </div>
            <div>
              <p className="text-muted">Avg. Sustainability Score</p>
              <h2 style={{ fontSize: '1.8rem', margin: 0 }}>{metrics.avg_score} <span style={{fontSize: '1rem'}} className="text-muted">/ 100</span></h2>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Array */}
      <div className="chart-grid">
        <div className="glass-panel">
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>CO₂ Emissions vs Fuel Usage Trend</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="co2" stroke="#10b981" fillOpacity={1} fill="url(#colorO)" />
                <Area type="monotone" dataKey="fuel" stroke="#3b82f6" fillOpacity={1} fill="url(#colorF)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
           <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>Waste Composition</h3>
           <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <BarChart data={[{name: 'Plastic', kg: 35.5}, {name: 'Food', kg: 13.0}, {name: 'Recycled', kg: 22.0}]}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="kg" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
