-- Make github_url nullable since it's collected during profile completion, not signup
ALTER TABLE profiles ALTER COLUMN github_url DROP NOT NULL;