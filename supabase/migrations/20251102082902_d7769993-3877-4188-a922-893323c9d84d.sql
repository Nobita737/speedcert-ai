-- Create referral system tables and functions

-- 1. Referral codes table
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT unique_user_referral_code UNIQUE (user_id)
);

CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON public.referral_codes(user_id);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON public.referral_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all referral codes"
  ON public.referral_codes
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 2. Referrals table
CREATE TYPE public.referral_status AS ENUM ('pending', 'enrolled_free', 'enrolled_paid', 'cancelled');

CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  status public.referral_status DEFAULT 'pending',
  points_awarded integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  enrolled_at timestamp with time zone,
  CONSTRAINT unique_referee UNIQUE (referee_id)
);

CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referee_id ON public.referrals(referee_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Referees can view own referral record"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referee_id);

CREATE POLICY "Admins can view all referrals"
  ON public.referrals
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all referrals"
  ON public.referrals
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Referral points table
CREATE TABLE public.referral_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_points integer DEFAULT 0,
  available_points integer DEFAULT 0,
  redeemed_points integer DEFAULT 0,
  pending_points integer DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_referral_points_user_id ON public.referral_points(user_id);

ALTER TABLE public.referral_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
  ON public.referral_points
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all points"
  ON public.referral_points
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all points"
  ON public.referral_points
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Referral rewards table
CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id uuid NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_earned integer NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);
CREATE INDEX idx_referral_rewards_referral_id ON public.referral_rewards(referral_id);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rewards"
  ON public.referral_rewards
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. Referral redemptions table
CREATE TYPE public.redemption_type AS ENUM ('course_unlock', 'coupon', 'badge');
CREATE TYPE public.redemption_status AS ENUM ('pending', 'completed', 'rejected');

CREATE TABLE public.referral_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  points_used integer NOT NULL,
  redemption_type public.redemption_type NOT NULL,
  redemption_details jsonb,
  status public.redemption_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

CREATE INDEX idx_referral_redemptions_user_id ON public.referral_redemptions(user_id);
CREATE INDEX idx_referral_redemptions_status ON public.referral_redemptions(status);

ALTER TABLE public.referral_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redemptions"
  ON public.referral_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own redemptions"
  ON public.referral_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all redemptions"
  ON public.referral_redemptions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all redemptions"
  ON public.referral_redemptions
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Referral settings table
CREATE TABLE public.referral_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.referral_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read settings"
  ON public.referral_settings
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update settings"
  ON public.referral_settings
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.referral_settings (setting_key, setting_value) VALUES
  ('points_for_free_enrollment', '10'::jsonb),
  ('points_for_paid_enrollment', '50'::jsonb),
  ('min_points_for_course_unlock', '100'::jsonb),
  ('referral_code_prefix', '"LRN"'::jsonb);

-- 7. Function to generate referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_name text;
  v_prefix text;
  v_code text;
  v_suffix text;
  v_attempt integer := 0;
  v_exists boolean;
BEGIN
  -- Get user's name
  SELECT UPPER(SPLIT_PART(name, ' ', 1)) INTO v_name
  FROM profiles
  WHERE id = p_user_id;
  
  -- Get prefix from settings
  SELECT setting_value::text INTO v_prefix
  FROM referral_settings
  WHERE setting_key = 'referral_code_prefix';
  
  v_prefix := COALESCE(REPLACE(v_prefix, '"', ''), 'LRN');
  
  -- Generate unique code
  LOOP
    v_suffix := SUBSTRING(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 4);
    v_code := v_prefix || '-' || COALESCE(v_name, 'USER') || '-' || UPPER(v_suffix);
    
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists OR v_attempt > 10;
    v_attempt := v_attempt + 1;
  END LOOP;
  
  RETURN v_code;
END;
$$;

-- 8. Function to create referral code for new user
CREATE OR REPLACE FUNCTION public.create_referral_code_for_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code text;
BEGIN
  v_code := generate_referral_code(NEW.id);
  
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.id, v_code);
  
  -- Initialize points record
  INSERT INTO referral_points (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- 9. Trigger to auto-generate referral code on profile creation
CREATE TRIGGER on_profile_created_generate_referral
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_referral_code_for_user();

-- 10. Function to award referral points
CREATE OR REPLACE FUNCTION public.award_referral_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points integer;
  v_referrer_name text;
  v_referee_name text;
BEGIN
  -- Only proceed if status changed to enrolled
  IF NEW.status IN ('enrolled_free', 'enrolled_paid') AND OLD.status = 'pending' THEN
    -- Get point value based on enrollment type
    IF NEW.status = 'enrolled_free' THEN
      SELECT setting_value::text::integer INTO v_points
      FROM referral_settings
      WHERE setting_key = 'points_for_free_enrollment';
    ELSE
      SELECT setting_value::text::integer INTO v_points
      FROM referral_settings
      WHERE setting_key = 'points_for_paid_enrollment';
    END IF;
    
    -- Get names for notification
    SELECT name INTO v_referrer_name FROM profiles WHERE id = NEW.referrer_id;
    SELECT name INTO v_referee_name FROM profiles WHERE id = NEW.referee_id;
    
    -- Update referral points
    INSERT INTO referral_points (user_id, total_points, available_points)
    VALUES (NEW.referrer_id, v_points, v_points)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = referral_points.total_points + v_points,
      available_points = referral_points.available_points + v_points,
      updated_at = now();
    
    -- Create reward record
    INSERT INTO referral_rewards (referral_id, user_id, points_earned, reason)
    VALUES (
      NEW.id,
      NEW.referrer_id,
      v_points,
      'Referred ' || v_referee_name || ' - ' || 
      CASE WHEN NEW.status = 'enrolled_free' THEN 'Free' ELSE 'Paid' END || ' enrollment'
    );
    
    -- Update points awarded in referral
    NEW.points_awarded := v_points;
    NEW.enrolled_at := now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- 11. Trigger to award points when referral status changes
CREATE TRIGGER on_referral_enrolled
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.award_referral_points();

-- 12. Function to check redemption eligibility
CREATE OR REPLACE FUNCTION public.check_redemption_eligibility(p_user_id uuid, p_points_needed integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM referral_points
    WHERE user_id = p_user_id
      AND available_points >= p_points_needed
  );
$$;

-- 13. Function to process redemption
CREATE OR REPLACE FUNCTION public.process_redemption(
  p_user_id uuid,
  p_points integer,
  p_type redemption_type,
  p_details jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_redemption_id uuid;
BEGIN
  -- Check eligibility
  IF NOT check_redemption_eligibility(p_user_id, p_points) THEN
    RAISE EXCEPTION 'Insufficient points for redemption';
  END IF;
  
  -- Deduct points
  UPDATE referral_points
  SET 
    available_points = available_points - p_points,
    redeemed_points = redeemed_points + p_points,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Create redemption record
  INSERT INTO referral_redemptions (user_id, points_used, redemption_type, redemption_details, status)
  VALUES (p_user_id, p_points, p_type, p_details, 'completed')
  RETURNING id INTO v_redemption_id;
  
  RETURN v_redemption_id;
END;
$$;

-- 14. Update trigger for updated_at on referral_points
CREATE TRIGGER update_referral_points_updated_at
  BEFORE UPDATE ON public.referral_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();