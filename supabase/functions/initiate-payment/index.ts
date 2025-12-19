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

    // Get user profile for payment link
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name, email, phone')
      .eq('id', user.id)
      .single();

    // Create Razorpay Payment Link with dynamic amount
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Razorpay credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authString = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);
    
    // Create a payment link with the exact amount
    const paymentLinkResponse = await fetch('https://api.razorpay.com/v1/payment_links', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: finalPrice * 100, // Razorpay expects amount in paise
        currency: 'INR',
        description: 'AI Certification Program Enrollment',
        customer: {
          name: profile?.name || 'Student',
          email: profile?.email || user.email,
          contact: profile?.phone || '',
        },
        notify: {
          sms: true,
          email: true,
        },
        reminder_enable: true,
        notes: {
          user_id: user.id,
          coupon_code: couponCode || '',
        },
        callback_url: `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/dashboard`,
        callback_method: 'get',
      }),
    });

    if (!paymentLinkResponse.ok) {
      const errorData = await paymentLinkResponse.json();
      console.error('Razorpay API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment link' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const paymentLinkData = await paymentLinkResponse.json();
    console.log('Payment link created:', paymentLinkData.id);

    // Create pending payment record using admin client (bypasses RLS)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        amount: finalPrice,
        provider: 'razorpay',
        status: 'pending',
        currency: 'INR',
        provider_order_id: paymentLinkData.id,
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

    // Return success with dynamic Razorpay payment link
    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          amount: finalPrice,
          provider: 'razorpay',
          providerPayload: {
            paymentLinkUrl: paymentLinkData.short_url,
            paymentLinkId: paymentLinkData.id,
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
