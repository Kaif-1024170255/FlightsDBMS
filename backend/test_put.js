async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/flights/1', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                flight_no: 'AI-101',
                source: 'Delhi',
                destination: 'Mumbai',
                departure_time: '2025-05-10T08:00',
                aircraft_id: 1,
                pilot_ids: [1],
                hostess_ids: [1, 2],
                foods: [],
                fuel_used: 5000,
                distance_km: 1500
            })
        });
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("Response:", data);
    } catch (err) {
        console.error("Failed:", err.message);
    }
}
test();
