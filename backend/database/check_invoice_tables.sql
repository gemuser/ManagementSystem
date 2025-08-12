-- Quick verification script to check if invoice tables exist
-- Run this in your MySQL client to verify the tables are created

SHOW TABLES LIKE '%invoice%';

-- Expected output should show:
-- dishhome_invoices
-- fibernet_invoices  
-- combo_invoices

-- If tables don't exist, run the full invoice_tables.sql script
