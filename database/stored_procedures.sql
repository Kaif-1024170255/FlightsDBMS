USE flights_db;

-- 1. Procedure to accurately recalculate the Sustainability Score
DELIMITER //

DROP PROCEDURE IF EXISTS Calculate_Sustainability_Score //

CREATE PROCEDURE Calculate_Sustainability_Score(IN p_flight_id INT)
BEGIN
    DECLARE v_co2 DECIMAL(10,2) DEFAULT 0;
    DECLARE v_waste DECIMAL(10,2) DEFAULT 0;
    DECLARE v_recycled DECIMAL(10,2) DEFAULT 0;
    DECLARE v_score DECIMAL(5,2) DEFAULT 100.00;
    DECLARE v_rating VARCHAR(50);

    -- Get total CO2
    SELECT COALESCE(SUM(co2_kg), 0) INTO v_co2 FROM Emission_Log WHERE flight_id = p_flight_id;
    
    -- Get waste
    SELECT COALESCE(SUM(plastic_kg + food_kg), 0), COALESCE(SUM(recycled_kg), 0) 
    INTO v_waste, v_recycled 
    FROM Waste_Record WHERE flight_id = p_flight_id;

    -- Basic arbitrary scoring logic for demonstration
    -- Base score 100. Lower is better for CO2 and waste. Recycling adds points back.
    -- Assuming a very small scale penalty just to show variance
    SET v_score = 100.00 - (v_co2 * 0.005) - (v_waste * 0.5) + (v_recycled * 1.5);
    
    IF v_score > 100 THEN SET v_score = 100; END IF;
    IF v_score < 0 THEN SET v_score = 0; END IF;

    IF v_score >= 80 THEN SET v_rating = 'Excellent (Green)';
    ELSEIF v_score >= 60 THEN SET v_rating = 'Good (Eco-Friendly)';
    ELSEIF v_score >= 40 THEN SET v_rating = 'Average';
    ELSE SET v_rating = 'Poor (High Emission)';
    END IF;

    -- Update or Insert
    INSERT INTO Sustainability_Score (flight_id, score_value, rating)
    VALUES (p_flight_id, v_score, v_rating)
    ON DUPLICATE KEY UPDATE 
        score_value = v_score, 
        rating = v_rating;
END //

DELIMITER ;

-- 2. Trigger to update score when a new Emission Log is added
DELIMITER //

DROP TRIGGER IF EXISTS After_Emission_Insert //

CREATE TRIGGER After_Emission_Insert
AFTER INSERT ON Emission_Log
FOR EACH ROW
BEGIN
    CALL Calculate_Sustainability_Score(NEW.flight_id);
END //

DELIMITER ;

-- 3. Trigger to update score when a new Waste Record is added
DELIMITER //

DROP TRIGGER IF EXISTS After_Waste_Insert //

CREATE TRIGGER After_Waste_Insert
AFTER INSERT ON Waste_Record
FOR EACH ROW
BEGIN
    CALL Calculate_Sustainability_Score(NEW.flight_id);
END //

DELIMITER ;

-- Initialize scores for existing dummy data
CALL Calculate_Sustainability_Score(1);
CALL Calculate_Sustainability_Score(3);
