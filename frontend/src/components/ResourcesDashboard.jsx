import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Utensils, Plane, Trash2, Plus } from 'lucide-react';

export default function ResourcesDashboard() {
  const [resources, setResources] = useState({ pilots: [], hostesses: [], foods: [], aircrafts: [] });
  const [loading, setLoading]     = useState(true);

  const fetchResources = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/resources')
      .then(res => { setResources(res.data); setLoading(false); })
      .catch(() => {
        setResources({
          pilots:    [{ pilot_id: 1, name: 'Capt. Rajesh', experience_years: 15 }],
          hostesses: [{ hostess_id: 1, name: 'Simran', experience_years: 5 }],
          foods:     [{ food_id: 1, food_name: 'Vegan Pasta', type: 'Veg', price: 350, carbon_score: 1.2 }],
          aircrafts: [{ aircraft_id: 1, model: 'Boeing 737 MAX', fuel_efficiency: 3.0 }],
        });
        setLoading(false);
      });
  };

  useEffect(() => { fetchResources(); }, []);

  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await axios.delete(`http://localhost:5000/api/resources/${type}/${id}`); fetchResources(); }
    catch { alert('Failed to delete.'); }
  };

  const handleAddData = async (type) => {
    const name = prompt(`Enter new ${type} name:`);
    if (!name) return;
    const exp = prompt('Years of experience:');
    try {
      await axios.post(`http://localhost:5000/api/resources/${type}`, { name, experience_years: parseInt(exp) || 0 });
      fetchResources();
    } catch { alert('Failed to add.'); }
  };

  const handleAddFood = async () => {
    const name = prompt('Enter food name:');
    if (!name) return;
    const type = prompt('Type (Veg / Non-Veg):');
    try {
      await axios.post('http://localhost:5000/api/resources/food', { food_name: name, type, price: 500, carbon_score: 2.0, locally_sourced: true });
      fetchResources();
    } catch { alert('Failed to add food.'); }
  };

  const handleAddAircraft = async () => {
    const model = prompt('Aircraft model (e.g. Boeing 777):');
    if (!model) return;
    const eff = prompt('Fuel efficiency (L/km):');
    try {
      await axios.post('http://localhost:5000/api/resources/aircraft', { model, fuel_efficiency: parseFloat(eff) || 0 });
      fetchResources();
    } catch { alert('Failed to add aircraft.'); }
  };

  const ResourceCard = ({ title, icon: Icon, items, typeKey, idKey, nameField, infoField, addHandler }) => (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Card header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border-light)',
        background: 'var(--surface-alt)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
          <Icon size={16} style={{ color: 'var(--primary)' }} />
          {title}
          <span style={{ fontWeight: 400, fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
            ({items.length})
          </span>
        </div>
        <button className="btn btn-icon" onClick={addHandler} title={`Add ${title}`}>
          <Plus size={14} />
        </button>
      </div>

      {/* Table */}
      <div style={{ maxHeight: 240, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <p style={{ padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No records found.</p>
        ) : (
          <table className="glass-table" style={{ width: '100%' }}>
            <tbody>
              {items.map(item => (
                <tr key={item[idKey]}>
                  <td style={{ padding: '0.7rem 1.25rem', fontWeight: 500, fontSize: '0.875rem' }}>
                    {item[nameField]}
                  </td>
                  <td style={{ padding: '0.7rem 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {infoField(item)}
                  </td>
                  {typeKey !== 'aircraft' && (
                    <td style={{ padding: '0.7rem 1.25rem', textAlign: 'right' }}>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.2rem 0.45rem' }}
                        onClick={() => handleDelete(typeKey, item[idKey])}
                        title="Remove">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  if (loading) return <p className="text-muted">Loading resources…</p>;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="resources-grid">
        <ResourceCard
          title="Pilots Roster" icon={Users}
          items={resources.pilots} typeKey="pilot" idKey="pilot_id"
          nameField="name" infoField={i => `${i.experience_years} yrs experience`}
          addHandler={() => handleAddData('pilot')} />

        <ResourceCard
          title="Cabin Crew" icon={Users}
          items={resources.hostesses} typeKey="hostess" idKey="hostess_id"
          nameField="name" infoField={i => `${i.experience_years} yrs experience`}
          addHandler={() => handleAddData('hostess')} />

        <ResourceCard
          title="Food & Catering" icon={Utensils}
          items={resources.foods} typeKey="food" idKey="food_id"
          nameField="food_name" infoField={i => `${i.type} · Carbon: ${i.carbon_score}`}
          addHandler={handleAddFood} />

        <ResourceCard
          title="Aircraft Fleet" icon={Plane}
          items={resources.aircrafts} typeKey="aircraft" idKey="aircraft_id"
          nameField="model" infoField={i => `${i.fuel_efficiency} L/km`}
          addHandler={handleAddAircraft} />
      </div>
    </div>
  );
}
