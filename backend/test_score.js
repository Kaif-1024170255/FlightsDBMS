async function check() {
    const db = require('./config/db');
    const [rows] = await db.execute('SELECT * FROM Sustainability_Score WHERE flight_id=1');
    console.log(rows);
    process.exit(0);
}
check();
