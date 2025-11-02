-- Fix the view security issue by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.questions_for_quiz;

CREATE VIEW public.questions_for_quiz 
WITH (security_invoker = true)
AS
SELECT 
  id,
  quiz_id,
  text,
  choices,
  order_index
FROM public.questions;

-- Fix search_path for existing update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql 
SET search_path = public;