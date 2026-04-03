USE flights_db;

SET FOREIGN_KEY_CHECKS = 0;

-- Clear previous data to prevent AUTO_INCREMENT ID mismatches
TRUNCATE TABLE Flight_Food;
TRUNCATE TABLE Waste_Record;
TRUNCATE TABLE Emission_Log;
TRUNCATE TABLE Fuel_Usage;
TRUNCATE TABLE Sustainability_Score;
TRUNCATE TABLE Flight_Hostess;
TRUNCATE TABLE Flight_Pilot;
TRUNCATE TABLE AirHostess;
TRUNCATE TABLE Pilot;
TRUNCATE TABLE Flight;
TRUNCATE TABLE Aircraft;
TRUNCATE TABLE Food;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert Aircraft with explicit IDs
INSERT INTO Aircraft (aircraft_id, model, fuel_efficiency) VALUES 
(1, 'Boeing 737 MAX', 3.0),
(2, 'Airbus A320neo', 2.8),
(3, 'Boeing 787 Dreamliner', 4.5);

-- Insert Flights with explicit IDs
INSERT INTO Flight (flight_id, flight_no, source, destination, departure_time, aircraft_id) VALUES 
(1, 'AI-101', 'Delhi', 'Mumbai', '2025-05-10 08:00:00', 1),
(2, 'AI-102', 'Delhi', 'London', '2025-05-11 14:00:00', 3),
(3, 'IG-201', 'Bangalore', 'Delhi', '2025-05-12 09:30:00', 2);

-- Insert Crew with explicit IDs
INSERT INTO Pilot (pilot_id, name, experience_years) VALUES 
(1, 'Captain Rajesh', 15), 
(2, 'Captain Anita', 8);

INSERT INTO AirHostess (hostess_id, name, experience_years) VALUES 
(1, 'Simran', 5), 
(2, 'Pooja', 3), 
(3, 'Neha', 7);

-- Assign Crew to Flights
INSERT INTO Flight_Pilot (flight_id, pilot_id) VALUES 
(1, 1), 
(2, 2), 
(3, 1);

INSERT INTO Flight_Hostess (flight_id, hostess_id) VALUES 
(1, 1), 
(1, 2), 
(2, 3), 
(3, 1);

-- Insert Food
INSERT INTO Food (food_id, food_name, type, price, carbon_score, locally_sourced) VALUES
(1, 'Vegan Pasta', 'Veg', 350.00, 1.2, TRUE),
(2, 'Chicken Sandwich', 'Non-Veg', 450.00, 5.5, FALSE),
(3, 'Fruit Salad', 'Veg', 200.00, 0.5, TRUE);

-- Load Food onto Flights
INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES
(1, 1, 50, 40, 2.5),
(1, 2, 50, 45, 1.0),
(2, 1, 100, 80, 5.0),
(2, 3, 50, 50, 0.0);

-- Insert Fuel Usage, Emissions, and Waste for completed flights
INSERT INTO Fuel_Usage (flight_id, litres_used) VALUES 
(1, 3500.00), 
(3, 4000.00);

INSERT INTO Emission_Log (flight_id, distance_km, fuel_used, co2_kg) VALUES 
(1, 1200.00, 3500.00, 8925.00), 
(3, 1700.00, 4000.00, 10200.00);

INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES 
(1, 15.5, 5.0, 12.0),
(3, 20.0, 8.0, 10.0);
