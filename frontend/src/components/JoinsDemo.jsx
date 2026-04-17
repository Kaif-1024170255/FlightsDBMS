import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database } from 'lucide-react';

export default function JoinsDemo() {
    const [activeTab, setActiveTab] = useState('inner');
    const [data, setData] = useState(null);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const tabs = [
        { id: 'inner', label: 'INNER JOIN', desc: 'Returns records that have matching values in both tables. Here we find flights to aircraft mapping correctly.' },
        { id: 'left', label: 'LEFT JOIN', desc: 'Returns all records from the left table, and matched records from the right table. Here we see all aircraft models, even those not currently scheduled.' },
        { id: 'right', label: 'RIGHT JOIN', desc: 'Returns all records from the right table, and matched records from the left. Demonstrating matching scores strictly to active flights.' },
        { id: 'cross', label: 'CROSS JOIN', desc: 'Returns the Cartesian product of rows from tables in the join. Shows a theoretical pairing of all pilots with aircraft models.' }
    ];

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (type) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`http://localhost:5000/api/joins/${type}`);
            setData(res.data.data);
            setQuery(res.data.query);
        } catch (err) {
            setError('Failed to fetch join data from backend.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderTable = () => {
        if (!data || data.length === 0) return <p className="text-muted" style={{padding: '1rem 0'}}>No records match this query.</p>;
        
        const headers = Object.keys(data[0]);
        
        return (
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            {headers.map(h => (
                                <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600' }}>{h.toUpperCase().replace(/_/g, ' ')}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                {headers.map(h => (
                                    <td key={h} style={{ padding: '1rem' }}>
                                        {row[h] === null ? <span style={{color: 'rgba(255,255,255,0.3)', fontStyle: 'italic'}}>NULL</span> : typeof row[h] === 'boolean' ? (row[h] ? 'Yes' : 'No') : row[h]}
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
        <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '1.2rem', borderRadius: '16px' }}>
                    <Database size={36} className="text-primary" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: '2rem', background: 'linear-gradient(45deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Database Joins Demonstration</h2>
                    <p className="text-muted" style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Explore different SQL join types and their practical applications.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`glass-btn ${activeTab === tab.id ? 'primary' : ''}`}
                        style={{ flex: 1, minWidth: '150px', padding: '1rem' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ marginTop: 0, color: '#e2e8f0', fontSize: '1.4rem' }}>
                    {activeInfo.label} Explanation
                </h3>
                <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>{activeInfo.desc}</p>
                
                <h4 style={{ color: 'var(--primary-color)', marginTop: '2rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>Executed Query</h4>
                <pre style={{ 
                    background: 'rgba(0,0,0,0.4)', 
                    padding: '1.5rem', 
                    borderRadius: '12px', 
                    overflowX: 'auto',
                    border: '1px solid rgba(255,255,255,0.05)',
                    color: '#10b981',
                    fontSize: '1rem',
                    fontFamily: 'monospace',
                    lineHeight: '1.5'
                }}>
                    <code>{query || 'Loading query...'}</code>
                </pre>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ marginTop: 0, color: '#e2e8f0', marginBottom: '1.5rem', fontSize: '1.4rem' }}>Query Results</h3>
                {loading ? (
                    <div style={{display: 'flex', justifyContent: 'center', padding: '3rem 0'}}>
                        <p className="text-muted animate-pulse" style={{fontSize: '1.2rem'}}>Executing query on the database...</p>
                    </div>
                ) : error ? (
                    <p className="text-danger" style={{padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px'}}>{error}</p>
                ) : (
                    renderTable()
                )}
            </div>
        </div>
    );
}
