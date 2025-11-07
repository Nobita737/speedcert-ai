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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
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

    console.log('Initiating payment for user:', user.id, 'provider:', paymentProvider, 'amount:', price);

    let finalPrice = price;
    let couponId = null;

    // Validate coupon if provided
    if (couponCode) {
      const { data: couponData, error: couponError } = await supabase.rpc('validate_coupon', {
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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: finalPrice,
        provider: paymentProvider,
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

    console.log('Payment record created:', payment.id);

    let providerPayload;

    // Handle provider-specific payment initialization
    if (paymentProvider === 'razorpay') {
      const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
      const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

      if (!razorpayKeyId || !razorpayKeySecret) {
        console.error('Razorpay credentials not configured');
        return new Response(
          JSON.stringify({ error: 'Payment provider not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Create Razorpay order
      const razorpayOrder = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
        },
        body: JSON.stringify({
          amount: finalPrice * 100, // Convert to paise
          currency: 'INR',
          receipt: payment.id,
          notes: {
            user_id: user.id,
            payment_id: payment.id
          }
        })
      });

      const orderData = await razorpayOrder.json();

      if (!razorpayOrder.ok) {
        console.error('Razorpay order creation failed:', orderData);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment order' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update payment with provider order ID
      await supabase
        .from('payments')
        .update({ provider_order_id: orderData.id })
        .eq('id', payment.id);

      providerPayload = orderData;
      console.log('Razorpay order created:', orderData.id);

    } else if (paymentProvider === 'stripe') {
      const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

      if (!stripeSecretKey) {
        console.error('Stripe credentials not configured');
        return new Response(
          JSON.stringify({ error: 'Payment provider not configured' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Create Stripe checkout session
      const stripeSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${stripeSecretKey}`
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'inr',
          'line_items[0][price_data][product_data][name]': 'AI Certification Program',
          'line_items[0][price_data][unit_amount]': (finalPrice * 100).toString(),
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${Deno.env.get('SUPABASE_URL')}/functions/v1/complete-enrollment?session_id={CHECKOUT_SESSION_ID}&payment_id=${payment.id}`,
          'cancel_url': `${req.headers.get('origin')}/dashboard?payment=cancelled`,
          'client_reference_id': payment.id,
          'customer_email': user.email || ''
        })
      });

      const sessionData = await stripeSession.json();

      if (!stripeSession.ok) {
        console.error('Stripe session creation failed:', sessionData);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment session' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Update payment with provider session ID
      await supabase
        .from('payments')
        .update({ provider_order_id: sessionData.id })
        .eq('id', payment.id);

      providerPayload = { url: sessionData.url };
      console.log('Stripe session created:', sessionData.id);

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid payment provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Apply coupon if one was used
    if (couponId) {
      const discountAmount = price - finalPrice;
      await supabase.rpc('apply_coupon', {
        p_coupon_id: couponId,
        p_user_id: user.id,
        p_payment_id: payment.id,
        p_original_price: price,
        p_discount: discountAmount
      });
      console.log('Coupon applied to payment');
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment: {
          id: payment.id,
          amount: finalPrice,
          provider: paymentProvider,
          providerPayload
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
