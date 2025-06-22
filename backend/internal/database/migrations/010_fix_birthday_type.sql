-- Change birthday column from DATE to TIMESTAMP to store full datetime
ALTER TABLE users ALTER COLUMN birthday TYPE TIMESTAMP USING birthday::timestamp;