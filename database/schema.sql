-- ============================================================
-- Pharmacy Store Management — Database Schema
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS pharmacy_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Step 2: Select the database
USE pharmacy_db;

-- Step 3: Create tables (order matters due to foreign keys)

-- Products table
CREATE TABLE IF NOT EXISTS products (
    product_id      INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)    NOT NULL,
    category        VARCHAR(100)    NOT NULL,
    description     TEXT,
    unit_price      DECIMAL(10, 2)  NOT NULL,
    manufacturer    VARCHAR(150),
    requires_prescription BOOLEAN  DEFAULT FALSE,
    created_at      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- Orders table (references products)
CREATE TABLE IF NOT EXISTS orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    patient_name    VARCHAR(100)    NOT NULL,
    product_id      INT             NOT NULL,
    quantity        INT             NOT NULL CHECK (quantity > 0),
    total_amount    DECIMAL(10, 2)  NOT NULL,
    order_date      TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    status          ENUM('pending', 'fulfilled', 'cancelled') DEFAULT 'pending',
    CONSTRAINT fk_orders_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Inventory table (references products, one-to-one via UNIQUE)
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id        INT AUTO_INCREMENT PRIMARY KEY,
    product_id          INT             NOT NULL UNIQUE,
    quantity_on_hand    INT             NOT NULL DEFAULT 0,
    reorder_threshold   INT             NOT NULL DEFAULT 10,
    last_updated        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventory_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Step 4: Insert sample data
INSERT INTO products (name, category, unit_price, manufacturer, requires_prescription, description)
VALUES
    ('Paracetamol 500mg', 'Analgesic', 2.50, 'Generic Pharma', FALSE, 'Common pain reliever and fever reducer. Suitable for adults and children over 12.'),
    ('Amoxicillin 250mg', 'Antibiotic', 8.75, 'MedCorp', TRUE, 'Broad-spectrum antibiotic for bacterial infections. Requires a valid prescription.'),
    ('Surgical Mask (Pack of 50)', 'PPE', 15.00, 'SafeGuard Ltd', FALSE, 'Disposable 3-ply surgical masks for medical and personal use.'),
    ('Ibuprofen 400mg', 'Analgesic', 3.20, 'PharmaCo', FALSE, 'Non-steroidal anti-inflammatory drug for pain, fever, and inflammation.'),
    ('Cetirizine 10mg', 'Antihistamine', 4.50, 'AllerGen Inc', FALSE, 'Antihistamine for seasonal allergies, hay fever, and urticaria.'),
    ('Insulin Glargine 100IU', 'Antidiabetic', 45.00, 'BioSynth Labs', TRUE, 'Long-acting insulin for blood sugar management in diabetes patients.'),
    ('Hand Sanitizer 500ml', 'PPE', 6.00, 'CleanGuard', FALSE, 'Alcohol-based hand sanitizer with 70% ethanol. Kills 99.9% of germs.'),
    ('Omeprazole 20mg', 'Gastrointestinal', 5.80, 'GastroMed', FALSE, 'Proton pump inhibitor for acid reflux and stomach ulcers.');

INSERT INTO inventory (product_id, quantity_on_hand, reorder_threshold)
VALUES
    (1, 200, 50),
    (2, 80, 20),
    (3, 500, 100),
    (4, 150, 40),
    (5, 300, 60),
    (6, 25, 10),
    (7, 400, 80),
    (8, 120, 30);

INSERT INTO orders (patient_name, product_id, quantity, total_amount, status)
VALUES
    ('Sarah Johnson', 1, 2, 5.00, 'fulfilled'),
    ('Michael Chen', 2, 1, 8.75, 'pending'),
    ('Emily Rodriguez', 3, 3, 45.00, 'fulfilled'),
    ('David Williams', 4, 1, 3.20, 'pending'),
    ('Jessica Brown', 6, 1, 45.00, 'cancelled');
