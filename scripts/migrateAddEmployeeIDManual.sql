ALTER TABLE users
ADD COLUMN employee_id VARCHAR(50);

CREATE UNIQUE INDEX idx_employee_id ON users(employee_id);
