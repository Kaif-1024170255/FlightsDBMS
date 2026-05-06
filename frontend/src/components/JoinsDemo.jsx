import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database } from 'lucide-react';

export default function JoinsDemo() {
  const [activeTab, setActiveTab] = useState('inner');
  const [data,      setData]      = useState(null);
  const [query,     setQuery]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  const tabs = [
    { id: 'inner', label: 'INNER JOIN', desc: 'Returns only the records that have matching values in both tables. Here we find flights correctly mapped to their aircraft.' },
    { id: 'left',  label: 'LEFT JOIN',  desc: 'Returns all records from the left table and matched records from the right. Shows all aircraft models, even those not currently scheduled on a flight.' },
    { id: 'right', label: 'RIGHT JOIN', desc: 'Returns all records from the right table and matched records from the left. Demonstrates matching sustainability scores strictly to active flights.' },
    { id: 'cross', label: 'CROSS JOIN', desc: 'Returns the Cartesian product of both tables — every possible combination. Shows a theoretical pairing of all pilots with every aircraft model.' },
  ];

  useEffect(() => { fetchData(activeTab); }, [activeTab]);

  const fetchData = async (type) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/joins/${type}`);
      setData(res.data.data);
      setQuery(res.data.query);
    } catch (err) {
      setError('Failed to fetch join data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (!data || data.length === 0)
      return <p className="text-muted" style={{ padding: '1rem 0' }}>No records match this query.</p>;

    const headers = Object.keys(data[0]);

    return (
      <div className="data-table-wrapper" style={{ marginTop: '1rem' }}>
        <table className="data-table">
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h}>{h.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {headers.map(h => (
                  <td key={h}>
                    {row[h] === null
                      ? <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>NULL</span>
                      : typeof row[h] === 'boolean'
                        ? (row[h] ? 'Yes' : 'No')
                        : row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const activeInfo = tabs.find(t => t.id === activeTab);

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* JOIN type tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontFamily: 'monospace', fontSize: '0.85rem', fontWeight: 700 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description + Query */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <Database size={16} style={{ color: 'var(--primary)', marginTop: 2, flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
              {activeInfo.label}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {activeInfo.desc}
            </p>
          </div>
        </div>

        <p className="form-section-title" style={{ marginTop: '1rem' }}>Executed SQL Query</p>
        <pre style={{
          background: '#0f1a14',
          color: '#4ade80',
          padding: '1rem 1.25rem',
          borderRadius: 'var(--radius)',
          overflowX: 'auto',
          fontSize: '0.8rem',
          fontFamily: "'Courier New', Courier, monospace",
          lineHeight: 1.6,
          margin: 0,
        }}>
          <code>{query || 'Loading query…'}</code>
        </pre>
      </div>

      {/* Results */}
      <div className="card">
        <p className="card-title">Query Results</p>
        {loading ? (
          <p className="text-muted" style={{ padding: '1rem 0' }}>Executing query…</p>
        ) : error ? (
          <p className="text-danger" style={{ padding: '0.75rem', background: 'var(--danger-light)', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
            {error}
          </p>
        ) : renderTable()}
      </div>
    </div>
  );
}
