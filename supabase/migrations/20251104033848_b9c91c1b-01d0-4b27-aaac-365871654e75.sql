-- Create coupons table
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value integer NOT NULL CHECK (discount_value > 0),
  max_discount integer,
  min_purchase_amount integer DEFAULT 0,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  valid_from timestamp with time zone DEFAULT now(),
  valid_until timestamp with time zone,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  description text
);

-- Create indexes for performance
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_active ON public.coupons(is_active, valid_from, valid_until);

-- Create coupon_usage table
CREATE TABLE public.coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  payment_id uuid,
  discount_applied integer NOT NULL,
  original_price integer NOT NULL,
  final_price integer NOT NULL,
  used_at timestamp with time zone DEFAULT now()
);

-- Prevent duplicate usage by same user
CREATE UNIQUE INDEX idx_coupon_user_unique ON public.coupon_usage(coupon_id, user_id);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for coupons table
CREATE POLICY "Anyone authenticated can view active coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
ON public.coupons
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for coupon_usage table
CREATE POLICY "Users can view own coupon usage"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all coupon usage"
ON public.coupon_usage
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Database function to validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
  p_code text,
  p_user_id uuid,
  p_amount integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_coupon record;
  v_discount_amount integer;
  v_already_used boolean;
BEGIN
  -- Look up coupon
  SELECT * INTO v_coupon
  FROM coupons
  WHERE code = UPPER(p_code)
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= now())
    AND (valid_until IS NULL OR valid_until >= now());
  
  -- Check if coupon exists
  IF v_coupon.id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid or expired coupon code'
    );
  END IF;
  
  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'This coupon has reached its usage limit'
    );
  END IF;
  
  -- Check if user has already used this coupon
  SELECT EXISTS(
    SELECT 1 FROM coupon_usage
    WHERE coupon_id = v_coupon.id AND user_id = p_user_id
  ) INTO v_already_used;
  
  IF v_already_used THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'You have already used this coupon'
    );
  END IF;
  
  -- Check minimum purchase amount
  IF p_amount < v_coupon.min_purchase_amount THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Minimum purchase amount of ₹' || v_coupon.min_purchase_amount || ' required'
    );
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'fixed' THEN
    v_discount_amount := v_coupon.discount_value;
  ELSE -- percentage
    v_discount_amount := (p_amount * v_coupon.discount_value) / 100;
    IF v_coupon.max_discount IS NOT NULL AND v_discount_amount > v_coupon.max_discount THEN
      v_discount_amount := v_coupon.max_discount;
    END IF;
  END IF;
  
  -- Ensure discount doesn't exceed original price
  IF v_discount_amount > p_amount THEN
    v_discount_amount := p_amount;
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'coupon_id', v_coupon.id,
    'discount_amount', v_discount_amount,
    'discount_type', v_coupon.discount_type,
    'final_price', p_amount - v_discount_amount,
    'original_price', p_amount
  );
END;
$$;

-- Function to apply coupon after payment
CREATE OR REPLACE FUNCTION public.apply_coupon(
  p_coupon_id uuid,
  p_user_id uuid,
  p_payment_id uuid,
  p_original_price integer,
  p_discount integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_usage_id uuid;
BEGIN
  -- Create coupon usage record
  INSERT INTO coupon_usage (coupon_id, user_id, payment_id, discount_applied, original_price, final_price)
  VALUES (p_coupon_id, p_user_id, p_payment_id, p_discount, p_original_price, p_original_price - p_discount)
  RETURNING id INTO v_usage_id;
  
  -- Increment usage count
  UPDATE coupons
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = p_coupon_id;
  
  RETURN v_usage_id;
END;
$$;

-- Trigger to update updated_at on coupons
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default coupons
INSERT INTO public.coupons (code, discount_type, discount_value, max_discount, usage_limit, valid_until, description, min_purchase_amount)
VALUES
  ('LAUNCH500', 'fixed', 500, NULL, 100, '2025-12-31 23:59:59', 'Launch offer: ₹500 off', 0),
  ('SAVE20', 'percentage', 20, 300, NULL, '2025-12-31 23:59:59', '20% off with ₹300 cap', 0),
  ('STUDENT50', 'fixed', 50, NULL, NULL, '2025-12-31 23:59:59', 'Student discount', 0),
  ('EARLYBIRD', 'fixed', 200, NULL, 50, '2025-11-30 23:59:59', 'Early bird special', 0);