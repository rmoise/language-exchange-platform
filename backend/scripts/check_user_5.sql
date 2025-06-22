-- Check Test User 5 data
SELECT 
    id,
    name,
    email,
    array_length(native_languages, 1) as native_count,
    array_length(target_languages, 1) as target_count,
    native_languages,
    target_languages,
    onboarding_step,
    city,
    country,
    created_at
FROM users 
WHERE name LIKE '%Test User 5%' OR email LIKE '%test5%' OR email LIKE '%testuser5%';

-- Check all users with languages set
SELECT 
    id,
    name,
    email,
    native_languages,
    target_languages,
    onboarding_step
FROM users 
WHERE array_length(native_languages, 1) > 0 
  AND array_length(target_languages, 1) > 0
ORDER BY created_at DESC;