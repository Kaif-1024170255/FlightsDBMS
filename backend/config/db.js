const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'flights_db',
    connectionLimit: 10
});

const promisePool = pool.promise();

promisePool.getConnection()
    .then(connection => {
        console.log('Successfully connected to the MySQL Database.');
        connection.release();
    })
    .catch(error => {
        console.error('Error connecting to MySQL Database: ', error);
    });

module.exports = promisePool;
