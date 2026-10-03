-- Database Name: customer_churn_db

CREATE DATABASE IF NOT EXISTS customer_churn_db;
USE customer_churn_db;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) UNIQUE NOT NULL,
    age INT,
    gender VARCHAR(10),
    tenure INT,
    contract_type VARCHAR(50),
    monthly_charges DECIMAL(10, 2),
    total_charges DECIMAL(10, 2),
    payment_method VARCHAR(50),
    internet_service VARCHAR(50),
    number_of_services INT,
    complaints INT DEFAULT 0,
    customer_support_calls INT DEFAULT 0,
    usage_frequency VARCHAR(50),
    late_payments INT DEFAULT 0,
    churn BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. ML Models Table
CREATE TABLE IF NOT EXISTS ml_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_type VARCHAR(50), -- e.g., 'Logistic Regression', 'Random Forest', 'AutoAI'
    accuracy DECIMAL(5, 4),
    precision_score DECIMAL(5, 4),
    recall_score DECIMAL(5, 4),
    f1_score DECIMAL(5, 4),
    is_active BOOLEAN DEFAULT FALSE,
    file_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    churn_prediction BOOLEAN NOT NULL,
    prediction_probability DECIMAL(5, 4),
    model_id INT,
    risk_category VARCHAR(20), -- 'Low', 'Medium', 'High'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE SET NULL
);

-- 4. Customer Segments Table
CREATE TABLE IF NOT EXISTS customer_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    cluster_id INT NOT NULL,
    segment_name VARCHAR(100),
    model_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE SET NULL
);
