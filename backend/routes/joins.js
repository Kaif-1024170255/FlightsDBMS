const express = require('express');
const router = express.Router();
const db = require('../config/db');

// INNER JOIN
router.get('/inner', async (req, res) => {
    try {
        const query = `SELECT Flight.flight_no, Flight.source, Flight.destination, Aircraft.model, Aircraft.fuel_efficiency
FROM Flight
INNER JOIN Aircraft ON Flight.aircraft_id = Aircraft.aircraft_id
ORDER BY Flight.departure_time DESC LIMIT 10;`;
        const [rows] = await db.execute(query);
        res.json({ query, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LEFT JOIN
router.get('/left', async (req, res) => {
    try {
        const query = `SELECT Aircraft.model, Aircraft.fuel_efficiency, Flight.flight_no, Flight.departure_time
FROM Aircraft
LEFT JOIN Flight ON Aircraft.aircraft_id = Flight.aircraft_id
ORDER BY Aircraft.model LIMIT 15;`;
        const [rows] = await db.execute(query);
        res.json({ query, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// RIGHT JOIN
router.get('/right', async (req, res) => {
    try {
        const query = `SELECT Flight.flight_no, Sustainability_Score.score_value, Sustainability_Score.rating
FROM Sustainability_Score
RIGHT JOIN Flight ON Sustainability_Score.flight_id = Flight.flight_id
ORDER BY Flight.departure_time DESC LIMIT 15;`;
        const [rows] = await db.execute(query);
        res.json({ query, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CROSS JOIN
router.get('/cross', async (req, res) => {
    try {
        const query = `SELECT Pilot.name AS pilot_name, Aircraft.model AS aircraft_model
FROM Pilot
CROSS JOIN Aircraft
LIMIT 20;`;
        const [rows] = await db.execute(query);
        res.json({ query, data: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
