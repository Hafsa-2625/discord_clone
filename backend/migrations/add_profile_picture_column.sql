-- Migration to add profile_picture column to users table
-- Run this SQL command in your PostgreSQL database

ALTER TABLE users ADD COLUMN profile_picture VARCHAR(500);

-- Optional: Add a comment to describe the column
COMMENT ON COLUMN users.profile_picture IS 'URL to user profile picture stored in Cloudinary';
