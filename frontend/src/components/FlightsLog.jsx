import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, PlaneTakeoff } from 'lucide-react';

export default function FlightsLog() {
  const [flights, setFlights]     = useState([]);
  const [resources, setResources] = useState({ pilots: [], hostesses: [], foods: [], aircrafts: [] });
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);

  const [formData, setFormData] = useState({
    flight_no: '', source: '', destination: '', departure_time: '',
    aircraft_id: '', fuel_used: '', distance_km: '', plastic_kg: '', recycled_kg: ''
  });

  const [selectedPilots,    setSelectedPilots]    = useState([]);
  const [selectedHostesses, setSelectedHostesses] = useState([]);
  const [selectedFoods,     setSelectedFoods]     = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsRes, resRes] = await Promise.all([
        axios.get('http://localhost:5000/api/flights'),
        axios.get('http://localhost:5000/api/resources'),
      ]);
      setFlights(flightsRes.data);
      setResources(resRes.data);
    } catch {
      setFlights([{
        flight_id: 1, flight_no: 'AI-101', source: 'Delhi', destination: 'Mumbai',
        departure_time: '2025-05-10T08:00:00Z', aircraft_model: 'Boeing 737 MAX',
        pilots: 'Capt. Rajesh', hostesses: 'Simran, Pooja',
        total_co2: 8925.0, total_waste: 20.5, score_value: 71.38, rating: 'Good (Eco-Friendly)'
      }]);
      setResources({
        pilots:    [{ pilot_id: 1, name: 'Capt. Rajesh' }, { pilot_id: 2, name: 'Capt. Anita' }],
        hostesses: [{ hostess_id: 1, name: 'Simran' },     { hostess_id: 2, name: 'Pooja' }],
        foods:     [{ food_id: 1, food_name: 'Vegan Pasta' }, { food_id: 2, food_name: 'Chicken Sandwich' }],
        aircrafts: [{ aircraft_id: 1, model: 'Boeing 737 MAX' }],
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = async (flight = null) => {
    if (flight) {
      try {
        const res = await axios.get(`http://localhost:5000/api/flights/${flight.flight_id}/details`);
        const d = res.data;
        setEditingFlight(flight);
        setFormData({
          flight_no: flight.flight_no, source: flight.source, destination: flight.destination,
          departure_time: new Date(flight.departure_time).toISOString().slice(0, 16),
          aircraft_id: flight.aircraft_id || '',
          fuel_used: d.fuel_used || '', distance_km: d.distance_km || '',
          plastic_kg: d.plastic_kg || '', recycled_kg: d.recycled_kg || ''
        });
        setSelectedPilots(d.pilot_ids || []);
        setSelectedHostesses(d.hostess_ids || []);
        setSelectedFoods(d.foods || []);
      } catch { alert('Failed to load flight details.'); return; }
    } else {
      setEditingFlight(null);
      setFormData({ flight_no: '', source: '', destination: '', departure_time: '', aircraft_id: '', fuel_used: '', distance_km: '', plastic_kg: '', recycled_kg: '' });
      setSelectedPilots([]); setSelectedHostesses([]); setSelectedFoods([]);
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, pilot_ids: selectedPilots, hostess_ids: selectedHostesses, foods: selectedFoods };
    try {
      if (editingFlight) await axios.put(`http://localhost:5000/api/flights/${editingFlight.flight_id}`, payload);
      else               await axios.post('http://localhost:5000/api/flights', payload);
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert(`Failed to save: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flight record?')) return;
    try { await axios.delete(`http://localhost:5000/api/flights/${id}`); fetchData(); }
    catch { alert('Failed to delete.'); }
  };

  const toggleArr = (setter, arr, id) =>
    setter(arr.includes(id) ? arr.filter(i => i !== id) : [...arr, id]);

  const addFood    = (id) => { if (!selectedFoods.find(f => f.food_id === id)) setSelectedFoods([...selectedFoods, { food_id: id, waste_kg: 0 }]); };
  const updateWaste = (id, val) => setSelectedFoods(selectedFoods.map(f => f.food_id === id ? { ...f, waste_kg: parseFloat(val) || 0 } : f));
  const removeFood = (id) => setSelectedFoods(selectedFoods.filter(f => f.food_id !== id));

  const getBadgeClass = (rating) => {
    if (!rating) return 'badge-orange';
    if (rating.includes('Excellent') || rating.includes('Good')) return 'badge-green';
    if (rating.includes('Average')   || rating.includes('Pending')) return 'badge-orange';
    return 'badge-red';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>
          <PlaneTakeoff size={18} style={{ color: 'var(--primary)' }} />
          All Flights
          <span style={{ fontWeight: 400, fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
            ({flights.length} records)
          </span>
        </h2>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={15} /> New Flight
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Date</th>
              <th>Aircraft</th>
              <th>CO₂ (kg)</th>
              <th>Waste (kg)</th>
              <th>Score</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading flights…</td></tr>
            ) : flights.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No flights scheduled yet.</td></tr>
            ) : flights.map(f => (
              <tr key={f.flight_id}>
                <td style={{ fontWeight: 600 }}>{f.flight_no}</td>
                <td>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {f.source} → {f.destination}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {new Date(f.departure_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{f.aircraft_model || '—'}</td>
                <td className="text-danger">{f.total_co2 ? Number(f.total_co2).toLocaleString() : '—'}</td>
                <td className="text-warning">{f.total_waste ? parseFloat(f.total_waste).toFixed(2) : '—'}</td>
                <td style={{ fontWeight: 600, color: f.score_value > 70 ? 'var(--success)' : 'var(--warning)' }}>
                  {f.score_value != null ? `${parseFloat(f.score_value).toFixed(1)}` : 'N/A'}
                </td>
                <td>
                  <span className={`badge ${getBadgeClass(f.rating)}`}>{f.rating || 'Pending'}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem 0.6rem', marginRight: '0.4rem', fontSize: '0.8rem' }}
                    onClick={() => openModal(f)}
                    title="Edit"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(f.flight_id)} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingFlight ? 'Edit Flight Record' : 'Schedule New Flight'}
            </h3>

            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left — Flight Info */}
                <div>
                  <p className="form-section-title">Flight Information</p>

                  <div className="form-group">
                    <label>Flight Number</label>
                    <input type="text" className="form-control" required
                      value={formData.flight_no}
                      onChange={e => setFormData({ ...formData, flight_no: e.target.value })} />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Origin</label>
                      <input type="text" className="form-control" required
                        value={formData.source}
                        onChange={e => setFormData({ ...formData, source: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Destination</label>
                      <input type="text" className="form-control" required
                        value={formData.destination}
                        onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Departure Date & Time</label>
                    <input type="datetime-local" className="form-control" required
                      value={formData.departure_time}
                      onChange={e => setFormData({ ...formData, departure_time: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label>Aircraft</label>
                    <select className="form-control"
                      value={formData.aircraft_id}
                      onChange={e => setFormData({ ...formData, aircraft_id: e.target.value })}>
                      <option value="">— Auto-assign —</option>
                      {resources.aircrafts.map(a => (
                        <option key={a.aircraft_id} value={a.aircraft_id}>{a.model}</option>
                      ))}
                    </select>
                  </div>

                  <p className="form-section-title" style={{ marginTop: '1.25rem' }}>Post-Flight Metrics</p>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Distance (km)</label>
                      <input type="number" step="0.1" className="form-control" placeholder="e.g. 1500"
                        value={formData.distance_km}
                        onChange={e => setFormData({ ...formData, distance_km: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Fuel Used (L)</label>
                      <input type="number" step="0.1" className="form-control" placeholder="e.g. 3500"
                        value={formData.fuel_used}
                        onChange={e => setFormData({ ...formData, fuel_used: e.target.value })} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Plastic Waste (kg)</label>
                      <input type="number" step="0.1" className="form-control" placeholder="e.g. 15.5"
                        value={formData.plastic_kg}
                        onChange={e => setFormData({ ...formData, plastic_kg: e.target.value })} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label>Recycled (kg)</label>
                      <input type="number" step="0.1" className="form-control" placeholder="e.g. 10.0"
                        value={formData.recycled_kg}
                        onChange={e => setFormData({ ...formData, recycled_kg: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Right — Crew & Food */}
                <div>
                  <p className="form-section-title">Crew Assignment</p>

                  <div className="form-group">
                    <label>Pilots</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {resources.pilots.map(p => (
                        <button type="button" key={p.pilot_id}
                          className={`tag-toggle ${selectedPilots.includes(p.pilot_id) ? 'selected' : ''}`}
                          onClick={() => toggleArr(setSelectedPilots, selectedPilots, p.pilot_id)}>
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Air Hostesses</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {resources.hostesses.map(h => (
                        <button type="button" key={h.hostess_id}
                          className={`tag-toggle ${selectedHostesses.includes(h.hostess_id) ? 'selected' : ''}`}
                          onClick={() => toggleArr(setSelectedHostesses, selectedHostesses, h.hostess_id)}>
                          {h.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="form-section-title" style={{ marginTop: '1.25rem' }}>Food & Waste</p>

                  <div className="form-group">
                    <label>Add Food Item</label>
                    <select className="form-control"
                      onChange={e => { if (e.target.value) addFood(parseInt(e.target.value)); e.target.value = ''; }}>
                      <option value="">— Select item —</option>
                      {resources.foods.map(f => (
                        <option key={f.food_id} value={f.food_id}>{f.food_name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedFoods.map(sf => {
                    const det = resources.foods.find(fr => fr.food_id === sf.food_id);
                    return (
                      <div key={sf.food_id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'var(--surface-alt)', border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius)', padding: '0.5rem 0.75rem', marginBottom: '0.4rem'
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{det?.food_name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="number" step="0.1" placeholder="Waste kg"
                            value={sf.waste_kg}
                            onChange={e => updateWaste(sf.food_id, e.target.value)}
                            style={{
                              width: 80, padding: '0.3rem 0.5rem', fontSize: '0.8rem',
                              border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                              background: 'var(--surface)', color: 'var(--text-main)',
                              fontFamily: 'inherit'
                            }} />
                          <button type="button" className="btn btn-danger"
                            style={{ padding: '0.2rem 0.4rem' }}
                            onClick={() => removeFood(sf.food_id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingFlight ? 'Update Flight' : 'Schedule Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
