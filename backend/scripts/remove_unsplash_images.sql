-- Script to remove Unsplash placeholder images from existing users
-- This will set profile_image to NULL for any users with Unsplash URLs

-- Update users with Unsplash profile images to NULL
UPDATE users 
SET profile_image = NULL 
WHERE profile_image LIKE '%unsplash.com%';

-- Show how many users were updated
SELECT COUNT(*) as "Users updated" 
FROM users 
WHERE profile_image IS NULL;

-- Show sample of updated users
SELECT id, name, email, profile_image 
FROM users 
WHERE profile_image IS NULL 
LIMIT 10;