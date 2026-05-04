import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Leaf, LayoutDashboard, Plane, Users, Database } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FlightsLog from './components/FlightsLog';
import ResourcesDashboard from './components/ResourcesDashboard';
import JoinsDemo from './components/JoinsDemo';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Leaf color="#10b981" size={32} />
            <span className="gradient-text">GreenFlight</span>
          </div>
          
          <nav>
            <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/flights" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Plane size={20} /> Flight Records
            </NavLink>
            <NavLink to="/resources" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={20} /> Crew & Services
            </NavLink>
            <NavLink to="/joins" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
              <Database size={20} /> Database Joins
            </NavLink>

          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Overview</h1>
              <p className="text-muted">Monitor and optimize your airline's environmental impact.</p>
            </div>
            <button className="glass-btn primary" onClick={() => window.open('http://localhost:5000/api/sustainability/report/csv', '_blank')}>
              <Leaf size={18} /> Download ESG Report
            </button>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flights" element={<FlightsLog />} />
            <Route path="/resources" element={<ResourcesDashboard />} />
            <Route path="/joins" element={<JoinsDemo />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
