import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, PlaneTakeoff, Info } from 'lucide-react';

export default function FlightsLog() {
  const [flights, setFlights] = useState([]);
  const [resources, setResources] = useState({ pilots: [], hostesses: [], foods: [], aircrafts: [] });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  
  const [formData, setFormData] = useState({
    flight_no: '', source: '', destination: '', departure_time: '', aircraft_id: '', fuel_used: '', distance_km: ''
  });
  
  const [selectedPilots, setSelectedPilots] = useState([]);
  const [selectedHostesses, setSelectedHostesses] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]); // [{ food_id, waste_kg }]

  const fetchData = async () => {
    setLoading(true);
    try {
      const [flightsRes, resRes] = await Promise.all([
        axios.get('http://localhost:5000/api/flights'),
        axios.get('http://localhost:5000/api/resources')
      ]);
      setFlights(flightsRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.warn("Backend not reachable. Displaying mock data.");
      setFlights([
        { flight_id: 1, flight_no: 'AI-101', source: 'Delhi', destination: 'Mumbai', departure_time: '2025-05-10T08:00:00Z', aircraft_model: 'Boeing 737 MAX', pilots: 'Captain Rajesh', hostesses: 'Simran, Pooja', total_co2: 8925.0, total_waste: 20.5, score_value: 71.38, rating: 'Good (Eco-Friendly)' }
      ]);
      setResources({
        pilots: [{ pilot_id: 1, name: 'Captain Rajesh' }, { pilot_id: 2, name: 'Captain Anita' }],
        hostesses: [{ hostess_id: 1, name: 'Simran' }, { hostess_id: 2, name: 'Pooja' }],
        foods: [{ food_id: 1, food_name: 'Vegan Pasta' }, { food_id: 2, food_name: 'Chicken Sandwich' }],
        aircrafts: [{ aircraft_id: 1, model: 'Boeing 737 MAX' }]
      });
    }
    setLoading(false);
  };

  useEffect(() => { fetchData() }, []);

  const openModal = async (flight = null) => {
    if (flight) {
      try {
        const res = await axios.get(`http://localhost:5000/api/flights/${flight.flight_id}/details`);
        const details = res.data;
        setEditingFlight(flight);
        setFormData({
          flight_no: flight.flight_no, source: flight.source, destination: flight.destination,
          departure_time: new Date(flight.departure_time).toISOString().slice(0, 16), 
          aircraft_id: flight.aircraft_id || '',
          fuel_used: details.fuel_used || '',
          distance_km: details.distance_km || ''
        });
        setSelectedPilots(details.pilot_ids || []);
        setSelectedHostesses(details.hostess_ids || []);
        setSelectedFoods(details.foods || []);
      } catch (e) {
          alert("Failed to load flight details.");
          return;
      }
    } else {
      setEditingFlight(null);
      setFormData({ flight_no: '', source: '', destination: '', departure_time: '', aircraft_id: '', fuel_used: '', distance_km: '' });
      setSelectedPilots([]); setSelectedHostesses([]); setSelectedFoods([]);
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = { ...formData, pilot_ids: selectedPilots, hostess_ids: selectedHostesses, foods: selectedFoods };
    try {
      if (editingFlight) await axios.put(`http://localhost:5000/api/flights/${editingFlight.flight_id}`, payload);
      else await axios.post(`http://localhost:5000/api/flights`, payload);
      setModalOpen(false);
      fetchData();
    } catch (err) { 
        const msg = err.response?.data?.error || err.message;
        alert(`Failed to save flight. Backend says: ${msg}`); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try { await axios.delete(`http://localhost:5000/api/flights/${id}`); fetchData(); } 
      catch (err) { alert("Failed to delete flight."); }
    }
  };

  const toggleArr = (setter, arr, id) => {
    if (arr.includes(id)) setter(arr.filter(i => i !== id));
    else setter([...arr, id]);
  };

  const addFood = (id) => {
    if (!selectedFoods.find(f => f.food_id === id)) setSelectedFoods([...selectedFoods, {food_id: id, waste_kg: 0}]);
  };
  const updateWaste = (id, val) => {
    setSelectedFoods(selectedFoods.map(f => f.food_id === id ? { ...f, waste_kg: parseFloat(val) || 0} : f));
  };
  const removeFood = (id) => {
    setSelectedFoods(selectedFoods.filter(f => f.food_id !== id));
  };

  const getBadgeClass = (rating) => {
    if (!rating) return 'badge-orange';
    if (rating.includes('Excellent') || rating.includes('Good')) return 'badge-green';
    if (rating.includes('Average') || rating.includes('Pending')) return 'badge-orange';
    return 'badge-red';
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Flight Operations Log</h2>
        <button className="glass-btn primary" onClick={() => openModal()}><Plus size={16}/> New Flight</button>
      </div>

      <div className="dashboard-grid">
        {loading ? <p className="text-muted">Loading Flights...</p> : 
          flights.map(f => (
            <div className="flip-card" key={f.flight_id}>
              <div className="flip-card-inner">
                {/* Front */}
                <div className="flip-card-front">
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <h3 style={{ fontSize: '1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <PlaneTakeoff size={20} className="text-success" /> {f.flight_no}
                      </h3>
                      <span className={`badge ${getBadgeClass(f.rating)}`}>{f.rating || 'Pending'}</span>
                    </div>
                    <p className="text-muted" style={{ marginTop: '0.5rem' }}>{f.source} ➔ {f.destination}</p>
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>{new Date(f.departure_time).toLocaleString()}</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                     <p>Sustainability Score</p>
                     <h2 style={{ color: f.score_value > 70 ? '#10b981' : '#f59e0b' }}>{f.score_value === null ? 'N/A' : `${parseFloat(f.score_value).toFixed(1)}/100`}</h2>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
                     <Info size={14} style={{verticalAlign: 'middle'}}/> Hover for Data Insights
                  </p>
                </div>
                {/* Back */}
                <div className="flip-card-back">
                   <div style={{ display:'flex', justifyContent:'flex-end', gap:'0.5rem', marginBottom: '0.5rem' }}>
                      <button onClick={(e) => { e.stopPropagation(); openModal(f); }} style={{ background: 'none', border:'none', color:'#3b82f6', cursor:'pointer' }}><Edit size={18}/></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(f.flight_id); }} style={{ background: 'none', border:'none', color:'#ef4444', cursor:'pointer' }}><Trash2 size={18}/></button>
                   </div>
                   <h4 style={{ color: '#10b981', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom:'0.5rem' }}>Relational Data Deep-Dive</h4>
                   <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span className="text-muted">Aircraft:</span><span>{f.aircraft_model || 'Unknown'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span className="text-muted">Assigned Pilots:</span><span style={{ textAlign:'right' }}>{f.pilots || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span className="text-muted">Hostesses:</span><span style={{ textAlign:'right' }}>{f.hostesses || 'None'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                         <span className="text-muted">Total CO₂:</span><span className="text-danger">{f.total_co2 ? `${f.total_co2} kg` : 'Untracked'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                         <span className="text-muted">Total Waste:</span><span className="text-warning">{f.total_waste ? `${parseFloat(f.total_waste).toFixed(2)} kg` : 'Untracked'}</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* CRUD Modal with Multi-Selection */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto', maxWidth: '800px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{editingFlight ? 'Edit Flight & Roster' : 'Draft New Flight'}</h3>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Left Col: Basics */}
                <div>
                   <h4 className="text-muted" style={{ marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom:'0.5rem'}}>Flight Info</h4>
                  <div className="form-group">
                    <label>Flight Number</label>
                    <input type="text" className="form-control" required value={formData.flight_no} onChange={e => setFormData({...formData, flight_no: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Origin</label><input type="text" className="form-control" required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} /></div>
                    <div className="form-group" style={{ flex: 1 }}><label>Dest</label><input type="text" className="form-control" required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} /></div>
                  </div>
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input type="datetime-local" className="form-control" required value={formData.departure_time} onChange={e => setFormData({...formData, departure_time: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Assigned Aircraft Model</label>
                    <select className="form-control" value={formData.aircraft_id} onChange={e => setFormData({...formData, aircraft_id: e.target.value})}>
                      <option value="">-- Let system assign --</option>
                      {resources.aircrafts.map(a => <option key={a.aircraft_id} value={a.aircraft_id}>{a.model}</option>)}
                    </select>
                  </div>
                  <h4 className="text-muted" style={{ marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom:'0.5rem'}}>Flight Post-Metrics</h4>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Distance (km)</label>
                        <input type="number" step="0.1" className="form-control" value={formData.distance_km} onChange={e => setFormData({...formData, distance_km: e.target.value})} placeholder="(e.g. 1500)"/>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label>Fuel Used (Liters)</label>
                        <input type="number" step="0.1" className="form-control" value={formData.fuel_used} onChange={e => setFormData({...formData, fuel_used: e.target.value})} placeholder="(e.g. 3500)"/>
                    </div>
                  </div>
                </div>

                {/* Right Col: Staff & Food */}
                <div>
                  <h4 className="text-muted" style={{ marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom:'0.5rem'}}>Crew Integration</h4>
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                     <label>Select Available Pilots</label>
                     <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                        {resources.pilots.map(p => (
                            <button type="button" key={p.pilot_id} 
                               style={{ border: selectedPilots.includes(p.pilot_id) ? '1px solid #10b981' : '1px solid #334155', background: selectedPilots.includes(p.pilot_id) ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                               onClick={() => toggleArr(setSelectedPilots, selectedPilots, p.pilot_id)}>{p.name}</button>
                        ))}
                     </div>
                  </div>
                  <div className="form-group" style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                     <label>Select Air Hostesses</label>
                     <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                        {resources.hostesses.map(h => (
                            <button type="button" key={h.hostess_id} 
                               style={{ border: selectedHostesses.includes(h.hostess_id) ? '1px solid #10b981' : '1px solid #334155', background: selectedHostesses.includes(h.hostess_id) ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: '#f8fafc', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                               onClick={() => toggleArr(setSelectedHostesses, selectedHostesses, h.hostess_id)}>{h.name}</button>
                        ))}
                     </div>
                  </div>

                  <h4 className="text-muted" style={{ marginBottom: '1rem', marginTop: '1.5rem', borderBottom: '1px solid #1e293b', paddingBottom:'0.5rem'}}>Food & Waste Record</h4>
                  <div className="form-group">
                     <select className="form-control" onChange={e => { if(e.target.value) addFood(parseInt(e.target.value)); e.target.value = ''; }} style={{ marginBottom: '1rem' }}>
                        <option value="">+ Add Food Item to Flight...</option>
                        {resources.foods.map(f => <option key={f.food_id} value={f.food_id}>{f.food_name}</option>)}
                     </select>
                     
                     {selectedFoods.map(sf => {
                         const fDetails = resources.foods.find(fr => fr.food_id === sf.food_id);
                         return (
                            <div key={sf.food_id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                               <span>{fDetails?.food_name}</span>
                               <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                                  <input type="number" step="0.1" placeholder="Waste kg" style={{ width: '80px', padding: '0.25rem', background: '#0f172a', color:'#fff', border: '1px solid #334155', borderRadius: '4px'}} 
                                     value={sf.waste_kg} onChange={e => updateWaste(sf.food_id, e.target.value)} title="Record Waste amount in KG"/>
                                  <button type="button" onClick={() => removeFood(sf.food_id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer' }}><Trash2 size={14}/></button>
                               </div>
                            </div>
                         );
                     })}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="glass-btn" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="glass-btn primary">{editingFlight ? 'Update' : 'Schedule'} Flight Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
