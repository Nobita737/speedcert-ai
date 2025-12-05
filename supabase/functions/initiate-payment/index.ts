import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Client for user authentication
    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Admin client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const { userId, paymentProvider, couponCode, price } = await req.json();

    // Validate user ID matches authenticated user
    if (userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'User ID mismatch' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      );
    }

    if (!paymentProvider || !price) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: paymentProvider, price' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Initiating payment for user:', user.id, 'amount:', price);

    let finalPrice = price;
    let couponId = null;

    // Validate coupon if provided (using admin client)
    if (couponCode) {
      const { data: couponData, error: couponError } = await supabaseAdmin.rpc('validate_coupon', {
        p_code: couponCode,
        p_user_id: user.id,
        p_amount: price
      });

      if (couponError) {
        console.error('Error validating coupon:', couponError);
        return new Response(
          JSON.stringify({ error: 'Failed to validate coupon' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      if (couponData && couponData.valid) {
        finalPrice = couponData.final_price;
        couponId = couponData.coupon_id;
        console.log('Coupon applied, new price:', finalPrice);
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid or expired coupon' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Create pending payment record using admin client (bypasses RLS)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        amount: finalPrice,
        provider: 'razorpay',
        status: 'pending',
        currency: 'INR'
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error('Error creating payment record:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Pending payment record created:', payment.id);

    // Apply coupon if one was used (using admin client)
    if (couponId) {
      const discountAmount = price - finalPrice;
      await supabaseAdmin.rpc('apply_coupon', {
        p_coupon_id: couponId,
        p_user_id: user.id,
        p_payment_id: payment.id,
        p_original_price: price,
        p_discount: discountAmount
      });
      console.log('Coupon applied to payment');
    }

    // Return success with Razorpay.me link
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          amount: finalPrice,
          provider: 'razorpay',
          providerPayload: {
            paymentLinkUrl: 'http://Razorpay.me/@campaynprivatelimited'
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in initiate-payment:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
