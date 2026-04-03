const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all flights with deep relational data
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT f.flight_id, f.flight_no, f.source, f.destination, f.departure_time, f.aircraft_id,
                   a.model as aircraft_model,
                   s.score_value, s.rating,
                   GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as pilots,
                   GROUP_CONCAT(DISTINCT ah.name SEPARATOR ', ') as hostesses,
                   SUM(DISTINCT e.co2_kg) as total_co2,
                   SUM(DISTINCT w.plastic_kg + w.food_kg) as total_waste
            FROM Flight f
            LEFT JOIN Aircraft a ON f.aircraft_id = a.aircraft_id
            LEFT JOIN Sustainability_Score s ON f.flight_id = s.flight_id
            LEFT JOIN Flight_Pilot fp ON f.flight_id = fp.flight_id
            LEFT JOIN Pilot p ON fp.pilot_id = p.pilot_id
            LEFT JOIN Flight_Hostess fh ON f.flight_id = fh.flight_id
            LEFT JOIN AirHostess ah ON fh.hostess_id = ah.hostess_id
            LEFT JOIN Emission_Log e ON f.flight_id = e.flight_id
            LEFT JOIN Waste_Record w ON f.flight_id = w.flight_id
            GROUP BY f.flight_id
            ORDER BY f.departure_time DESC
        `;
        const [rows] = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch flights' });
    }
});

// Fetch detailed mapping arrays for Editing a Flight
router.get('/:id/details', async (req, res) => {
    try {
        const { id } = req.params;
        const [pilots] = await db.execute('SELECT pilot_id FROM Flight_Pilot WHERE flight_id=?', [id]);
        const [hostesses] = await db.execute('SELECT hostess_id FROM Flight_Hostess WHERE flight_id=?', [id]);
        const [foods] = await db.execute('SELECT food_id, waste_kg FROM Flight_Food WHERE flight_id=?', [id]);
        const [emissions] = await db.execute('SELECT distance_km FROM Emission_Log WHERE flight_id=?', [id]);
        const [fuel] = await db.execute('SELECT litres_used FROM Fuel_Usage WHERE flight_id=?', [id]);
        const [waste] = await db.execute('SELECT plastic_kg, recycled_kg FROM Waste_Record WHERE flight_id=?', [id]);

        res.json({
            pilot_ids: pilots.map(p => p.pilot_id),
            hostess_ids: hostesses.map(h => h.hostess_id),
            foods: foods,
            distance_km: emissions[0]?.distance_km || '',
            fuel_used: fuel[0]?.litres_used || '',
            plastic_kg: waste[0]?.plastic_kg || '',
            recycled_kg: waste[0]?.recycled_kg || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch details' });
    }
});

router.post('/', async (req, res) => {
    const { flight_no, source, destination, departure_time, aircraft_id, pilot_ids, hostess_ids, foods, fuel_used, distance_km } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const formatted_time = new Date(departure_time);
        
        const [result] = await connection.execute(
            'INSERT INTO Flight (flight_no, source, destination, departure_time, aircraft_id) VALUES (?, ?, ?, ?, ?)',
            [flight_no, source, destination, formatted_time, aircraft_id || null]
        );
        const flight_id = result.insertId;

        if (pilot_ids && pilot_ids.length > 0) {
            for (let pid of pilot_ids) {
                await connection.execute('INSERT INTO Flight_Pilot (flight_id, pilot_id) VALUES (?, ?)', [flight_id, pid]);
            }
        }
        
        if (hostess_ids && hostess_ids.length > 0) {
            for (let hid of hostess_ids) {
                await connection.execute('INSERT INTO Flight_Hostess (flight_id, hostess_id) VALUES (?, ?)', [flight_id, hid]);
            }
        }

        let total_food_waste = 0;
        if (foods && foods.length > 0) {
            for (let f of foods) {
                total_food_waste += parseFloat(f.waste_kg || 0);
                await connection.execute('INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES (?, ?, ?, ?, ?)', 
                [flight_id, f.food_id, f.qty_loaded || 0, f.qty_sold || 0, f.waste_kg || 0]);
            }
        }
        
        // Consolidate waste record
        const plastic = parseFloat(req.body.plastic_kg) || 0;
        const recycled = parseFloat(req.body.recycled_kg) || 0;
        if (total_food_waste > 0 || plastic > 0 || recycled > 0) {
            await connection.execute('INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES (?, ?, ?, ?)',
            [flight_id, plastic, total_food_waste, recycled]);
        }

        if (fuel_used || distance_km) {
            const f_used = parseFloat(fuel_used) || 0;
            const d_km = parseFloat(distance_km) || 0;
            const co2_kg = f_used * 2.55;
            await connection.execute('INSERT INTO Fuel_Usage (flight_id, litres_used) VALUES (?, ?)', [flight_id, f_used]);
            await connection.execute('INSERT INTO Emission_Log (flight_id, distance_km, fuel_used, co2_kg) VALUES (?, ?, ?, ?)', 
                [flight_id, d_km, f_used, co2_kg]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Flight created', flight_id });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { flight_no, source, destination, departure_time, aircraft_id, pilot_ids, hostess_ids, foods, fuel_used, distance_km } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const formatted_time = new Date(departure_time);

        await connection.execute(
            'UPDATE Flight SET flight_no=?, source=?, destination=?, departure_time=?, aircraft_id=? WHERE flight_id=?',
            [flight_no, source, destination, formatted_time, aircraft_id || null, id]
        );

        await connection.execute('DELETE FROM Flight_Pilot WHERE flight_id=?', [id]);
        if (pilot_ids && pilot_ids.length > 0) {
            for (let pid of pilot_ids) {
                await connection.execute('INSERT INTO Flight_Pilot (flight_id, pilot_id) VALUES (?, ?)', [id, pid]);
            }
        }

        await connection.execute('DELETE FROM Flight_Hostess WHERE flight_id=?', [id]);
        if (hostess_ids && hostess_ids.length > 0) {
            for (let hid of hostess_ids) {
                await connection.execute('INSERT INTO Flight_Hostess (flight_id, hostess_id) VALUES (?, ?)', [id, hid]);
            }
        }

        await connection.execute('DELETE FROM Flight_Food WHERE flight_id=?', [id]);
        await connection.execute('DELETE FROM Waste_Record WHERE flight_id=?', [id]); // Reset waste to re-calculate foods safely
        
        let total_food_waste = 0;
        if (foods && foods.length > 0) {
            for (let f of foods) {
                total_food_waste += parseFloat(f.waste_kg || 0);
                await connection.execute('INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES (?, ?, ?, ?, ?)', 
                [id, f.food_id, f.qty_loaded || 0, f.qty_sold || 0, f.waste_kg || 0]);
            }
        }

        const plastic = parseFloat(req.body.plastic_kg) || 0;
        const recycled = parseFloat(req.body.recycled_kg) || 0;
        if (total_food_waste > 0 || plastic > 0 || recycled > 0) {
            await connection.execute('INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES (?, ?, ?, ?)',
            [id, plastic, total_food_waste, recycled]);
        }

        await connection.execute('DELETE FROM Fuel_Usage WHERE flight_id=?', [id]);
        await connection.execute('DELETE FROM Emission_Log WHERE flight_id=?', [id]);
        if (fuel_used || distance_km) {
            const f_used = parseFloat(fuel_used) || 0;
            const d_km = parseFloat(distance_km) || 0;
            const co2_kg = f_used * 2.55;
            await connection.execute('INSERT INTO Fuel_Usage (flight_id, litres_used) VALUES (?, ?)', [id, f_used]);
            await connection.execute('INSERT INTO Emission_Log (flight_id, distance_km, fuel_used, co2_kg) VALUES (?, ?, ?, ?)', 
                [id, d_km, f_used, co2_kg]);
        }

        await connection.commit();
        res.json({ message: 'Flight updated' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM Flight WHERE flight_id=?', [id]);
        res.json({ message: 'Flight deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete flight' });
    }
});

module.exports = router;
