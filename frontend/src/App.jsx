import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Plane, LayoutDashboard, BookOpen, Users, Database, Download } from 'lucide-react';
import Dashboard from './components/Dashboard';
import FlightsLog from './components/FlightsLog';
import ResourcesDashboard from './components/ResourcesDashboard';
import JoinsDemo from './components/JoinsDemo';

const PAGE_TITLES = {
  '/':          { title: 'Overview',          sub: 'Sustainability metrics and fleet performance at a glance.' },
  '/flights':   { title: 'Flight Records',    sub: 'Log, edit, and monitor all scheduled flight operations.' },
  '/resources': { title: 'Crew & Services',   sub: 'Manage pilots, hostesses, aircraft, and catering.' },
  '/joins':     { title: 'Database Joins',    sub: 'Live SQL JOIN demonstrations across the data model.' },
};

function AppShell() {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || PAGE_TITLES['/'];

  return (
    <div className="app-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Plane size={18} />
          </div>
          <div>
            <span className="sidebar-logo-text">FlightOps</span>
            <span className="sidebar-logo-sub">Management System</span>
          </div>
        </div>

        <p className="nav-section-label">Navigation</p>
        <nav>
          <NavLink to="/"         className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={17} /> Overview
          </NavLink>
          <NavLink to="/flights"  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <BookOpen size={17} /> Flight Records
          </NavLink>
          <NavLink to="/resources" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Users size={17} /> Crew & Services
          </NavLink>
          <NavLink to="/joins"    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <Database size={17} /> Database Joins
          </NavLink>
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>{page.title}</h1>
            <p>{page.sub}</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => window.open('http://localhost:5000/api/sustainability/report/csv', '_blank')}
          >
            <Download size={15} /> Export ESG Report
          </button>
        </div>

        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/flights"   element={<FlightsLog />} />
          <Route path="/resources" element={<ResourcesDashboard />} />
          <Route path="/joins"     element={<JoinsDemo />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
