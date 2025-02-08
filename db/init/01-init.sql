
-- Erstelle die Tabelle für die Zähler
CREATE TABLE meters (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- Erstelle die Tabelle für die Zählerstände
CREATE TABLE readings (
    id VARCHAR(36) PRIMARY KEY,
    meter_id VARCHAR(36) NOT NULL,
    reading_date DATE NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (meter_id) REFERENCES meters(id) ON DELETE CASCADE
);

