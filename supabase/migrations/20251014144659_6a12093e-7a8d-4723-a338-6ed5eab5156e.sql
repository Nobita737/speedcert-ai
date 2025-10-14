-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'ta', 'student');

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  college text,
  year text,
  github_url text NOT NULL,
  phone text,
  preferred_track text CHECK (preferred_track IN ('nlp', 'cv', 'tabular', 'other')),
  enrolled boolean DEFAULT false,
  cohort_start timestamptz,
  cohort_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('razorpay', 'stripe')),
  provider_payment_id text,
  provider_order_id text,
  amount integer NOT NULL,
  currency text DEFAULT 'INR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text,
  week integer NOT NULL CHECK (week IN (1, 2, 3)),
  video_url text,
  transcript_url text,
  resource_pdf_url text,
  resource_links jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL,
  estimated_minutes integer DEFAULT 60,
  UNIQUE (week, order_index)
);

-- Create user_progress table
CREATE TABLE public.user_progress (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lesson_id integer REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  UNIQUE (user_id, lesson_id)
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id serial PRIMARY KEY,
  lesson_id integer REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  max_attempts integer DEFAULT 2,
  passing_score integer DEFAULT 70
);

-- Create questions table
CREATE TABLE public.questions (
  id serial PRIMARY KEY,
  quiz_id integer REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  choices jsonb NOT NULL,
  correct_answer_index integer NOT NULL,
  order_index integer NOT NULL
);

-- Create quiz_responses table
CREATE TABLE public.quiz_responses (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quiz_id integer REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  answers jsonb NOT NULL,
  score integer NOT NULL,
  attempt_number integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Create project_submissions table
CREATE TABLE public.project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  repo_url text NOT NULL,
  demo_url text,
  notes text,
  status text DEFAULT 'not_submitted' CHECK (status IN ('not_submitted', 'submitted', 'under_review', 'approved', 'changes_requested', 'rejected')),
  autograder_results jsonb,
  ta_comments text,
  score integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id)
);

-- Create certificate_requests table
CREATE TABLE public.certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_id uuid REFERENCES public.project_submissions(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'mailed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for lessons (public read for enrolled users)
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON public.lessons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress records" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.user_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quizzes and questions
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON public.quizzes FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage questions" ON public.questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_responses
CREATE POLICY "Users can view own responses" ON public.quiz_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own responses" ON public.quiz_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all responses" ON public.quiz_responses FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for project_submissions
CREATE POLICY "Users can view own submission" ON public.project_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submission" ON public.project_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own submission" ON public.project_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins and TAs can view all submissions" ON public.project_submissions FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ta')
);
CREATE POLICY "Admins and TAs can update submissions" ON public.project_submissions FOR UPDATE USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'ta')
);

-- RLS Policies for certificate_requests
CREATE POLICY "Users can view own cert requests" ON public.certificate_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cert requests" ON public.certificate_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all cert requests" ON public.certificate_requests FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update cert requests" ON public.certificate_requests FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Trigger function to auto-create profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.email
  );
  
  -- Assign student role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.project_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cert_requests_updated_at BEFORE UPDATE ON public.certificate_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();