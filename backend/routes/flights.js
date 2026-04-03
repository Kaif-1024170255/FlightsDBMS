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

router.post('/', async (req, res) => {
    const { flight_no, source, destination, departure_time, aircraft_id, pilot_ids, hostess_ids, foods } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.execute(
            'INSERT INTO Flight (flight_no, source, destination, departure_time, aircraft_id) VALUES (?, ?, ?, ?, ?)',
            [flight_no, source, destination, departure_time, aircraft_id || null]
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

        if (foods && foods.length > 0) {
            for (let f of foods) {
                await connection.execute('INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES (?, ?, ?, ?, ?)', 
                [flight_id, f.food_id, f.qty_loaded || 0, f.qty_sold || 0, f.waste_kg || 0]);
                await connection.execute('INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES (?, ?, ?, ?)',
                [flight_id, 0, f.waste_kg || 0, 0]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Flight created', flight_id });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to create flight' });
    } finally {
        connection.release();
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { flight_no, source, destination, departure_time, aircraft_id, pilot_ids, hostess_ids, foods } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        await connection.execute(
            'UPDATE Flight SET flight_no=?, source=?, destination=?, departure_time=?, aircraft_id=? WHERE flight_id=?',
            [flight_no, source, destination, departure_time, aircraft_id || null, id]
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
        if (foods && foods.length > 0) {
            for (let f of foods) {
                await connection.execute('INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES (?, ?, ?, ?, ?)', 
                [id, f.food_id, f.qty_loaded || 0, f.qty_sold || 0, f.waste_kg || 0]);
                await connection.execute('INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES (?, ?, ?, ?)',
                [id, 0, f.waste_kg || 0, 0]);
            }
        }

        await connection.commit();
        res.json({ message: 'Flight updated' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ error: 'Failed to update flight' });
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
