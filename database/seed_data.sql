USE flights_db;

-- Insert Aircraft
INSERT INTO Aircraft (model, fuel_efficiency) VALUES 
('Boeing 737 MAX', 3.0),
('Airbus A320neo', 2.8),
('Boeing 787 Dreamliner', 4.5);

-- Insert Flights
INSERT INTO Flight (flight_no, source, destination, departure_time, aircraft_id) VALUES 
('AI-101', 'Delhi', 'Mumbai', '2025-05-10 08:00:00', 1),
('AI-102', 'Delhi', 'London', '2025-05-11 14:00:00', 3),
('IG-201', 'Bangalore', 'Delhi', '2025-05-12 09:30:00', 2);

-- Insert Crew
INSERT INTO Pilot (name, experience_years) VALUES ('Captain Rajesh', 15), ('Captain Anita', 8);
INSERT INTO AirHostess (name, experience_years) VALUES ('Simran', 5), ('Pooja', 3), ('Neha', 7);

-- Assign Crew to Flights
INSERT INTO Flight_Pilot (flight_id, pilot_id) VALUES (1, 1), (2, 2), (3, 1);
INSERT INTO Flight_Hostess (flight_id, hostess_id) VALUES (1, 1), (1, 2), (2, 3), (3, 1);

-- Insert Food
INSERT INTO Food (food_name, type, price, carbon_score, locally_sourced) VALUES
('Vegan Pasta', 'Veg', 350.00, 1.2, TRUE),
('Chicken Sandwich', 'Non-Veg', 450.00, 5.5, FALSE),
('Fruit Salad', 'Veg', 200.00, 0.5, TRUE);

-- Load Food onto Flights
INSERT INTO Flight_Food (flight_id, food_id, quantity_loaded, quantity_sold, waste_kg) VALUES
(1, 1, 50, 40, 2.5),
(1, 2, 50, 45, 1.0),
(2, 1, 100, 80, 5.0),
(2, 3, 50, 50, 0.0);

-- Insert Fuel Usage, Emissions, and Waste for completed flights
INSERT INTO Fuel_Usage (flight_id, litres_used) VALUES (1, 3500.00), (3, 4000.00);
INSERT INTO Emission_Log (flight_id, distance_km, fuel_used, co2_kg) VALUES 
(1, 1200.00, 3500.00, 8925.00), 
(3, 1700.00, 4000.00, 10200.00);

INSERT INTO Waste_Record (flight_id, plastic_kg, food_kg, recycled_kg) VALUES 
(1, 15.5, 5.0, 12.0),
(3, 20.0, 8.0, 10.0);
