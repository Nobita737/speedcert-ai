import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { couponCode, originalAmount } = await req.json();

    if (!couponCode || !originalAmount) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use a temporary user ID for validation before signup
    const tempUserId = '00000000-0000-0000-0000-000000000000';

    // Call the validate_coupon database function
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: couponCode.toUpperCase(),
      p_user_id: tempUserId,
      p_amount: originalAmount
    });

    if (error) {
      console.error('Error validating coupon:', error);
      return new Response(
        JSON.stringify({ valid: false, error: 'Failed to validate coupon' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (data.valid) {
      return new Response(
        JSON.stringify({
          valid: true,
          discount: {
            amount: data.discount_amount,
            finalPrice: data.final_price,
            originalPrice: data.original_price,
            message: `₹${data.discount_amount} off applied!`,
            couponId: data.coupon_id
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          valid: false,
          error: data.error || 'Invalid coupon code'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error('Error in validate-coupon function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});