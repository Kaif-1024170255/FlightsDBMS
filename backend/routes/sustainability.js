const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get overall sustainability dashboard metrics
router.get('/metrics', async (req, res) => {
    try {
        const [co2Res] = await db.execute('SELECT SUM(co2_kg) as total_co2 FROM Emission_Log');
        const [wasteRes] = await db.execute('SELECT SUM(recycled_kg) as total_recycled, SUM(plastic_kg + food_kg) as total_waste FROM Waste_Record');
        const [avgScoreRes] = await db.execute('SELECT AVG(score_value) as avg_score FROM Sustainability_Score');

        const total_recycled = parseFloat(wasteRes[0].total_recycled || 0);
        const total_waste = parseFloat(wasteRes[0].total_waste || 0);

        const metrics = {
            total_co2: parseFloat(co2Res[0].total_co2 || 0),
            total_recycled: total_recycled,
            total_waste: total_waste,
            avg_score: avgScoreRes[0].avg_score ? parseFloat(avgScoreRes[0].avg_score).toFixed(2) : 0,
        };
        
        // Calculate recycling rate
        metrics.recycling_rate = (total_waste + total_recycled) > 0 
            ? ((total_recycled / (total_waste + total_recycled)) * 100).toFixed(1)
            : 0;

        res.json(metrics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
});

module.exports = router;
