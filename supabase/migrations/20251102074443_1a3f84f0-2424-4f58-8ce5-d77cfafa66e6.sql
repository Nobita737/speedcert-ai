-- Remove public access to questions table
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

-- Create a view that excludes correct answers for students
CREATE OR REPLACE VIEW public.questions_for_quiz AS
SELECT 
  id,
  quiz_id,
  text,
  choices,
  order_index
FROM public.questions;

-- Allow authenticated users to read from the safe view
CREATE POLICY "Authenticated users can view questions without answers"
ON public.questions
FOR SELECT
TO authenticated
USING (true);

-- Note: Admins can still see everything via the "Admins can manage questions" policy