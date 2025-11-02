-- Remove the policy that allows authenticated users to see all question data
DROP POLICY IF EXISTS "Authenticated users can view questions without answers" ON public.questions;

-- Students should query the questions_for_quiz view instead, which already filters out correct_answer_index
-- Only admins can directly query the questions table via the existing "Admins can manage questions" policy