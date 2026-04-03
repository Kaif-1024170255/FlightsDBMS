-- Green Flight Management & Sustainability Analytics System
-- Initialize Database Schema
CREATE DATABASE IF NOT EXISTS flights_db;
USE flights_db;

-- 1. Aircraft Table
CREATE TABLE IF NOT EXISTS Aircraft (
    aircraft_id INT AUTO_INCREMENT PRIMARY KEY,
    model VARCHAR(100) NOT NULL,
    fuel_efficiency DECIMAL(10,2) COMMENT 'Fuel usage per km in liters'
);

-- 2. Flight Table
CREATE TABLE IF NOT EXISTS Flight (
    flight_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_no VARCHAR(20) NOT NULL UNIQUE,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    departure_time DATETIME NOT NULL,
    aircraft_id INT,
    FOREIGN KEY (aircraft_id) REFERENCES Aircraft(aircraft_id) ON DELETE SET NULL
);

-- 3. Pilot Table
CREATE TABLE IF NOT EXISTS Pilot (
    pilot_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL
);

-- 4. AirHostess Table
CREATE TABLE IF NOT EXISTS AirHostess (
    hostess_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL
);

-- 5. Flight_Pilot (M:N mapping)
CREATE TABLE IF NOT EXISTS Flight_Pilot (
    flight_id INT,
    pilot_id INT,
    PRIMARY KEY (flight_id, pilot_id),
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (pilot_id) REFERENCES Pilot(pilot_id) ON DELETE CASCADE
);

-- 6. Flight_Hostess (M:N mapping)
CREATE TABLE IF NOT EXISTS Flight_Hostess (
    flight_id INT,
    hostess_id INT,
    PRIMARY KEY (flight_id, hostess_id),
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (hostess_id) REFERENCES AirHostess(hostess_id) ON DELETE CASCADE
);

-- 7. Fuel_Usage Table
CREATE TABLE IF NOT EXISTS Fuel_Usage (
    fuel_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT,
    litres_used DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE
);

-- 8. Emission_Log Table
CREATE TABLE IF NOT EXISTS Emission_Log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT,
    distance_km DECIMAL(10,2) NOT NULL,
    fuel_used DECIMAL(10,2),
    co2_kg DECIMAL(10,2),
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE
);

-- 9. Waste_Record Table
CREATE TABLE IF NOT EXISTS Waste_Record (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT,
    plastic_kg DECIMAL(10,2) NOT NULL,
    food_kg DECIMAL(10,2) NOT NULL,
    recycled_kg DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE
);

-- 10. Sustainability_Score Table (1:1 with Flight)
CREATE TABLE IF NOT EXISTS Sustainability_Score (
    score_id INT AUTO_INCREMENT PRIMARY KEY,
    flight_id INT UNIQUE,
    score_value DECIMAL(5,2) DEFAULT 0,
    rating VARCHAR(50) DEFAULT 'Pending',
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE
);

-- 11. Food Table
CREATE TABLE IF NOT EXISTS Food (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(100) NOT NULL,
    type VARCHAR(50),
    price DECIMAL(10,2),
    carbon_score DECIMAL(5,2) COMMENT 'Lower is better',
    locally_sourced BOOLEAN
);

-- 12. Flight_Food (M:N mapping with quantities)
CREATE TABLE IF NOT EXISTS Flight_Food (
    flight_id INT,
    food_id INT,
    quantity_loaded INT NOT NULL,
    quantity_sold INT,
    waste_kg DECIMAL(10,2),
    PRIMARY KEY (flight_id, food_id),
    FOREIGN KEY (flight_id) REFERENCES Flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES Food(food_id) ON DELETE CASCADE
);
