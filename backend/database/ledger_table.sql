-- Add ledger table to existing inventory_system database
USE `inventory_system`;

-- Create ledger entries table
CREATE TABLE IF NOT EXISTS `ledger_entries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `entry_date` date NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `particulars` text NOT NULL,
  `dr_amount` decimal(12,2) DEFAULT 0.00,
  `cr_amount` decimal(12,2) DEFAULT 0.00,
  `balance` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_entry_date` (`entry_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert sample data
INSERT INTO `ledger_entries` (`entry_date`, `name`, `particulars`, `dr_amount`, `cr_amount`, `balance`) VALUES
('2024-09-13', 'System', 'Opening Balance', 50000.00, 0.00, 50000.00),
('2024-09-13', 'Walk-in Customer', 'Cash Sales', 15000.00, 0.00, 65000.00),
('2024-09-13', 'Landlord', 'Office Rent', 0.00, 12000.00, 53000.00);