import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Utensils, Plane, Trash2, Plus } from 'lucide-react';

export default function ResourcesDashboard() {
  const [resources, setResources] = useState({ pilots: [], hostesses: [], foods: [], aircrafts: [] });
  const [loading, setLoading] = useState(true);

  const fetchResources = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/resources')
      .then(res => {
        setResources(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend not reachable. Displaying mock data.");
        setResources({
          pilots: [{ pilot_id: 1, name: 'Captain Rajesh', experience_years: 15 }],
          hostesses: [{ hostess_id: 1, name: 'Simran', experience_years: 5 }],
          foods: [{ food_id: 1, food_name: 'Vegan Pasta', type: 'Veg', price: 350, carbon_score: 1.2 }],
          aircrafts: [{ aircraft_id: 1, model: 'Boeing 737 MAX', fuel_efficiency: 3.0 }]
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (type, id) => {
    if (window.confirm('Delete this record?')) {
        try {
          await axios.delete(`http://localhost:5000/api/resources/${type}/${id}`);
          fetchResources();
        } catch (err) { alert("Failed to delete."); }
    }
  };

  const handleAddData = async (type) => {
     let name = prompt(`Enter new ${type} name:`);
     if (!name) return;
     let exp = prompt("Enter years of experience:");
     
     try {
       await axios.post(`http://localhost:5000/api/resources/${type}`, { name, experience_years: parseInt(exp) || 0 });
       fetchResources();
     } catch (err) { alert("Failed to add."); }
  };

  const handleAddFood = async () => {
    let name = prompt(`Enter new food name:`);
    if (!name) return;
    let type = prompt("Enter type (e.g. Veg/Non-Veg):");
    try {
      await axios.post(`http://localhost:5000/api/resources/food`, { food_name: name, type, price: 500, carbon_score: 2.0, locally_sourced: true });
      fetchResources();
    } catch (err) { alert("Failed to add food."); }
  };

  const handleAddAircraft = async () => {
    let model = prompt("Enter new Aircraft Model (e.g. Boeing 777):");
    if (!model) return;
    let efficiency = prompt("Enter fuel efficiency (L/km):");
    try {
      await axios.post(`http://localhost:5000/api/resources/aircraft`, { model, fuel_efficiency: parseFloat(efficiency) || 0 });
      fetchResources();
    } catch (err) { alert("Failed to add aircraft."); }
  };

  const RenderResourceCard = ({ title, icon, items, typeKey, idKey, nameField, infoField, addHandler }) => (
    <div className="glass-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'1.2rem' }}>{icon} {title}</h3>
        <button onClick={addHandler} style={{ background:'rgba(16, 185, 129, 0.2)', border:'none', color:'#10b981', padding: '0.4rem', borderRadius: '8px', cursor:'pointer' }}><Plus size={16}/></button>
      </div>
      <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
        <table className="glass-table">
            <tbody>
                {items.length === 0 && <tr><td className="text-muted">No records found.</td></tr>}
                {items.map(item => (
                    <tr key={item[idKey]}>
                        <td style={{ fontWeight: 500 }}>{item[nameField]}</td>
                        <td className="text-muted">{infoField(item)}</td>
                        {typeKey !== 'aircraft' && (
                            <td style={{textAlign: 'right'}}>
                                <button onClick={() => handleDelete(typeKey, item[idKey])} style={{ background:'transparent', border:'none', color:'#ef4444', cursor:'pointer' }}><Trash2 size={16}/></button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Crew & Services Management</h2>
      <div className="dashboard-grid">
        <RenderResourceCard title="Pilots Roster" icon={<Users size={20}/>} items={resources.pilots} typeKey="pilot" idKey="pilot_id" nameField="name" infoField={(i) => `${i.experience_years} yrs exp`} addHandler={() => handleAddData('pilot')} />
        <RenderResourceCard title="Hostess Roster" icon={<Users size={20}/>} items={resources.hostesses} typeKey="hostess" idKey="hostess_id" nameField="name" infoField={(i) => `${i.experience_years} yrs exp`} addHandler={() => handleAddData('hostess')} />
        <RenderResourceCard title="Food & Catering" icon={<Utensils size={20}/>} items={resources.foods} typeKey="food" idKey="food_id" nameField="food_name" infoField={(i) => `${i.type} • CSR: ${i.carbon_score}`} addHandler={handleAddFood} />
        <RenderResourceCard title="Aircraft Fleet" icon={<Plane size={20}/>} items={resources.aircrafts} typeKey="aircraft" idKey="aircraft_id" nameField="model" infoField={(i) => `${i.fuel_efficiency} L/km`} addHandler={handleAddAircraft} />
      </div>
    </div>
  );
}
