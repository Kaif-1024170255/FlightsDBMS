const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all resources for the frontend dropdowns
router.get('/', async (req, res) => {
    try {
        const [pilots] = await db.execute('SELECT * FROM Pilot');
        const [hostesses] = await db.execute('SELECT * FROM AirHostess');
        const [aircrafts] = await db.execute('SELECT * FROM Aircraft');
        const [foods] = await db.execute('SELECT * FROM Food');
        
        res.json({
            pilots,
            hostesses,
            aircrafts,
            foods
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Create new resources from the Crew Management Dashboard
router.post('/pilot', async (req, res) => {
    try {
        await db.execute('INSERT INTO Pilot (name, experience_years) VALUES (?, ?)', [req.body.name, req.body.experience_years || 0]);
        res.json({ message: 'Pilot created' });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/hostess', async (req, res) => {
    try {
        await db.execute('INSERT INTO AirHostess (name, experience_years) VALUES (?, ?)', [req.body.name, req.body.experience_years || 0]);
        res.json({ message: 'AirHostess created' });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/food', async (req, res) => {
    try {
        await db.execute('INSERT INTO Food (food_name, type, price, carbon_score, locally_sourced) VALUES (?, ?, ?, ?, ?)', 
        [req.body.food_name, req.body.type, req.body.price || 0, req.body.carbon_score || 0, req.body.locally_sourced || false]);
        res.json({ message: 'Food created' });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/aircraft', async (req, res) => {
    try {
        await db.execute('INSERT INTO Aircraft (model, fuel_efficiency) VALUES (?, ?)', [req.body.model, req.body.fuel_efficiency || 0]);
        res.json({ message: 'Aircraft created' });
    } catch (err) { res.status(500).send(err.message); }
});

// Delete resources
router.delete('/:type/:id', async (req, res) => {
    try {
        const table = req.params.type === 'pilot' ? 'Pilot' : req.params.type === 'hostess' ? 'AirHostess' : 'Food';
        const idCol = req.params.type === 'pilot' ? 'pilot_id' : req.params.type === 'hostess' ? 'hostess_id' : 'food_id';
        await db.execute(`DELETE FROM ${table} WHERE ${idCol}=?`, [req.params.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
