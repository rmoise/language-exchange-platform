-- Seed script for language exchange platform users
-- This creates sample users for testing and development

-- Insert sample users with diverse language combinations and locations
INSERT INTO users (
    id, email, password_hash, name, profile_image,
    native_languages, target_languages, 
    city, country, latitude, longitude, timezone,
    bio, interests, onboarding_step,
    created_at, updated_at
) VALUES
-- User 1: Spanish native learning English
(
    gen_random_uuid(),
    'sofia.rodriguez@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: password123
    'Sofia Rodriguez',
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
    ARRAY['Spanish'],
    ARRAY['English', 'French'],
    'Madrid',
    'Spain',
    40.4168,
    -3.7038,
    'Europe/Madrid',
    'Passionate about languages and cultures. Love to travel and meet new people from around the world!',
    ARRAY['Travel', 'Photography', 'Cooking', 'Movies', 'Art'],
    5,
    NOW() - INTERVAL '2 months',
    NOW() - INTERVAL '1 week'
),

-- User 2: Japanese native learning English
(
    gen_random_uuid(),
    'kenji.tanaka@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Kenji Tanaka',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    ARRAY['Japanese'],
    ARRAY['English'],
    'Tokyo',
    'Japan',
    35.6762,
    139.6503,
    'Asia/Tokyo',
    'Software engineer who loves anime and wants to improve my English speaking skills for international projects.',
    ARRAY['Technology', 'Anime', 'Gaming', 'Programming', 'Movies'],
    5,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '3 days'
),

-- User 3: French native learning English and Spanish
(
    gen_random_uuid(),
    'emma.laurent@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Emma Laurent',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    ARRAY['French'],
    ARRAY['English', 'Spanish'],
    'Paris',
    'France',
    48.8566,
    2.3522,
    'Europe/Paris',
    'Art student passionate about different cultures. Always eager to help others learn French!',
    ARRAY['Art', 'Museums', 'Literature', 'Travel', 'Photography'],
    5,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '2 days'
),

-- User 4: German native learning English
(
    gen_random_uuid(),
    'marcus.weber@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Marcus Weber',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    ARRAY['German'],
    ARRAY['English'],
    'Berlin',
    'Germany',
    52.5200,
    13.4050,
    'Europe/Berlin',
    'Business professional looking to practice English for international meetings and conferences.',
    ARRAY['Business', 'Fitness', 'Music', 'Technology', 'Travel'],
    5,
    NOW() - INTERVAL '1 month',
    NOW() - INTERVAL '5 days'
),

-- User 5: English native learning Spanish and French
(
    gen_random_uuid(),
    'alex.smith@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Alex Smith',
    'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face',
    ARRAY['English'],
    ARRAY['Spanish', 'French'],
    'New York',
    'United States',
    40.7128,
    -74.0060,
    'America/New_York',
    'Teacher looking to improve my Spanish and French to better connect with my students and their families.',
    ARRAY['Education', 'Reading', 'Hiking', 'Cooking', 'Languages'],
    5,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '1 day'
),

-- User 6: Portuguese native learning English
(
    gen_random_uuid(),
    'ana.silva@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Ana Silva',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    ARRAY['Portuguese'],
    ARRAY['English', 'Spanish'],
    'São Paulo',
    'Brazil',
    -23.5505,
    -46.6333,
    'America/Sao_Paulo',
    'Marketing professional passionate about international business and cultural exchange.',
    ARRAY['Marketing', 'Business', 'Dancing', 'Music', 'Travel'],
    5,
    NOW() - INTERVAL '5 weeks',
    NOW() - INTERVAL '4 days'
),

-- User 7: Mandarin native learning English
(
    gen_random_uuid(),
    'li.wei@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Li Wei',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop&crop=face',
    ARRAY['Chinese (Mandarin)'],
    ARRAY['English'],
    'Shanghai',
    'China',
    31.2304,
    121.4737,
    'Asia/Shanghai',
    'University student studying international relations. Love learning about different cultures and making friends worldwide.',
    ARRAY['Study', 'Culture', 'History', 'Travel', 'Languages'],
    5,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '2 days'
),

-- User 8: Italian native learning English and German
(
    gen_random_uuid(),
    'giulia.rossi@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Giulia Rossi',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
    ARRAY['Italian'],
    ARRAY['English', 'German'],
    'Rome',
    'Italy',
    41.9028,
    12.4964,
    'Europe/Rome',
    'Chef who wants to expand my culinary horizons by learning languages and cooking traditions from other countries.',
    ARRAY['Cooking', 'Food', 'Travel', 'Culture', 'Wine'],
    5,
    NOW() - INTERVAL '4 weeks',
    NOW() - INTERVAL '6 days'
),

-- User 9: Russian native learning English
(
    gen_random_uuid(),
    'dmitri.volkov@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Dmitri Volkov',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
    ARRAY['Russian'],
    ARRAY['English', 'German'],
    'Moscow',
    'Russia',
    55.7558,
    37.6176,
    'Europe/Moscow',
    'Engineer working on international projects. Need to improve my English for better communication with colleagues.',
    ARRAY['Engineering', 'Technology', 'Science', 'Chess', 'Reading'],
    5,
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '3 days'
),

-- User 10: Korean native learning English
(
    gen_random_uuid(),
    'min.jung@example.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Min Jung',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
    ARRAY['Korean'],
    ARRAY['English', 'Japanese'],
    'Seoul',
    'South Korea',
    37.5665,
    126.9780,
    'Asia/Seoul',
    'K-pop enthusiast and graphic designer. Love sharing Korean culture and learning about other countries!',
    ARRAY['Design', 'Music', 'K-pop', 'Art', 'Culture'],
    5,
    NOW() - INTERVAL '2 weeks',
    NOW() - INTERVAL '1 day'
);

-- Display inserted users count
SELECT COUNT(*) as "Total users inserted" FROM users;

-- Display users by native language
SELECT 
    native_languages[1] as "Native Language",
    COUNT(*) as "Count"
FROM users 
WHERE native_languages IS NOT NULL
GROUP BY native_languages[1]
ORDER BY "Count" DESC;