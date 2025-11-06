-- Add profile completion tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing profiles to mark them as completed if they have required fields
UPDATE profiles 
SET profile_completed = TRUE 
WHERE college IS NOT NULL 
  AND year IS NOT NULL 
  AND phone IS NOT NULL 
  AND preferred_track IS NOT NULL;