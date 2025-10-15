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
    const {
      name,
      email,
      password,
      college,
      year,
      github,
      phone,
      preferredTrack,
      paymentProvider,
      price
    } = await req.json();

    // Validate GitHub URL
    if (!github || !github.includes('github.com')) {
      throw new Error('Invalid GitHub URL');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        college,
        year,
        github_url: github,
        phone,
        preferred_track: preferredTrack,
      }
    });

    if (authError) throw authError;

    // Create payment order
    let providerPayload;
    
    if (paymentProvider === 'razorpay') {
      const razorpayKey = Deno.env.get('RAZORPAY_KEY_ID');
      const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
      
      const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${razorpayKey}:${razorpaySecret}`)}`,
        },
        body: JSON.stringify({
          amount: price * 100, // paise
          currency: 'INR',
          receipt: `rcpt_${authData.user.id}`,
        }),
      });
      
      providerPayload = await orderResponse.json();
    } else if (paymentProvider === 'stripe') {
      const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
      
      const sessionResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${stripeKey}`,
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `${supabaseUrl}/dashboard`,
          'cancel_url': `${supabaseUrl}/?canceled=true`,
          'line_items[0][price_data][currency]': 'inr',
          'line_items[0][price_data][product_data][name]': 'AI Certification Program',
          'line_items[0][price_data][unit_amount]': `${price * 100}`,
          'line_items[0][quantity]': '1',
          'client_reference_id': authData.user.id,
        }).toString(),
      });
      
      providerPayload = await sessionResponse.json();
    }

    // Create pending payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: authData.user.id,
        provider: paymentProvider,
        provider_order_id: providerPayload.id,
        amount: price,
        currency: 'INR',
        status: 'pending',
      });

    if (paymentError) throw paymentError;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          name,
          email,
        },
        payment: {
          provider: paymentProvider,
          providerPayload,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('signup-init error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});