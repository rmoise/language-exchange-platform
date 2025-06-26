-- Add more users to the language exchange platform
-- Make sure to run this in your PostgreSQL database

INSERT INTO users (email, password_hash, name, native_languages, target_languages, created_at, updated_at) VALUES
-- Spanish speakers learning English
('maria.garcia@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Garcia', '{"Spanish"}', '{"English", "French"}', NOW(), NOW()),
('carlos.rodriguez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Rodriguez', '{"Spanish"}', '{"English"}', NOW(), NOW()),
('sofia.martinez@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sofia Martinez', '{"Spanish"}', '{"English", "Portuguese"}', NOW(), NOW()),

-- English speakers learning various languages  
('john.smith@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Smith', '{"English"}', '{"Spanish", "German"}', NOW(), NOW()),
('emma.johnson@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma Johnson', '{"English"}', '{"Japanese", "Korean"}', NOW(), NOW()),
('michael.brown@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Brown', '{"English"}', '{"French", "Italian"}', NOW(), NOW()),

-- French speakers  
('pierre.dubois@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pierre Dubois', '{"French"}', '{"English", "Spanish"}', NOW(), NOW()),
('amelie.martin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amélie Martin', '{"French"}', '{"English", "German"}', NOW(), NOW()),

-- German speakers
('hans.mueller@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hans Müller', '{"German"}', '{"English", "French"}', NOW(), NOW()),
('anna.schmidt@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anna Schmidt', '{"German"}', '{"English", "Spanish"}', NOW(), NOW()),

-- Asian language speakers
('yuki.tanaka@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yuki Tanaka', '{"Japanese"}', '{"English", "Korean"}', NOW(), NOW()),
('hiroshi.sato@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hiroshi Sato', '{"Japanese"}', '{"English", "Chinese"}', NOW(), NOW()),
('min.kim@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Min Kim', '{"Korean"}', '{"English", "Japanese"}', NOW(), NOW()),
('wei.zhang@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Wei Zhang', '{"Chinese"}', '{"English", "Japanese"}', NOW(), NOW()),

-- Other European languages
('alessandro.rossi@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alessandro Rossi', '{"Italian"}', '{"English", "Spanish"}', NOW(), NOW()),
('joao.silva@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'João Silva', '{"Portuguese"}', '{"English", "Spanish"}', NOW(), NOW()),
('erik.anderson@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Erik Andersson', '{"Swedish"}', '{"English", "German"}', NOW(), NOW()),

-- Multi-lingual users
('nina.petrov@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nina Petrov', '{"Russian", "English"}', '{"Spanish", "French"}', NOW(), NOW()),
('raj.patel@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Raj Patel', '{"Hindi", "English"}', '{"Spanish", "German"}', NOW(), NOW()),
('fatima.hassan@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fatima Hassan', '{"Arabic", "English"}', '{"French", "Spanish"}', NOW(), NOW());

-- Verify the insert
SELECT COUNT(*) as total_users FROM users;
SELECT name, native_languages, target_languages FROM users ORDER BY created_at DESC LIMIT 10;