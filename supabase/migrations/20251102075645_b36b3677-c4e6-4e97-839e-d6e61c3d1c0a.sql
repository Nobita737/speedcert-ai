-- Fix the handle_new_user trigger to properly extract all user metadata fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    college,
    year,
    github_url,
    phone,
    preferred_track
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'year',
    NEW.raw_user_meta_data->>'github_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'preferred_track'
  );
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists (create if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();