-- Check the order of users as they would be returned by the API
-- This simulates the backend query with ordering by created_at DESC
SELECT 
    ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num,
    id,
    name,
    email,
    created_at,
    array_length(native_languages, 1) as native_count,
    array_length(target_languages, 1) as target_count
FROM users 
WHERE array_length(native_languages, 1) > 0 
  AND array_length(target_languages, 1) > 0
ORDER BY created_at DESC
LIMIT 30;