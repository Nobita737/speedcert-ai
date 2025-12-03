-- Add unique constraint for user_progress upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_progress_user_lesson_unique'
  ) THEN
    ALTER TABLE public.user_progress 
    ADD CONSTRAINT user_progress_user_lesson_unique UNIQUE (user_id, lesson_id);
  END IF;
END $$;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;