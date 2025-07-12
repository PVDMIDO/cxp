-- Add or modify Employee ID column as primary key with auto-increment
ALTER TABLE users
MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT PRIMARY KEY;
