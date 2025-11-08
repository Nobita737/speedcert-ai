import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('No signature in webhook request');
      return new Response('No signature provided', { status: 401 });
    }

    // Verify webhook signature
    const crypto = await import('node:crypto');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 401 });
    }

    // Parse the webhook payload
    const payload = JSON.parse(body);
    const event = payload.event;
    
    console.log('Webhook event received:', event);

    // Only process payment.captured events
    if (event !== 'payment.captured') {
      console.log('Ignoring event:', event);
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const paymentData = payload.payload.payment.entity;
    const razorpayPaymentId = paymentData.id;
    const amount = paymentData.amount / 100; // Convert paise to rupees
    const email = paymentData.email;
    const phone = paymentData.contact;

    console.log('Processing payment:', { razorpayPaymentId, amount, email, phone });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find matching pending payment (match by email, amount within 1% tolerance, and recent)
    const amountTolerance = amount * 0.01;
    const { data: pendingPayments, error: searchError } = await supabase
      .from('payments')
      .select('*')
      .eq('status', 'pending')
      .eq('currency', 'INR')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (searchError) {
      console.error('Error searching for pending payments:', searchError);
      return new Response('Database error', { status: 500 });
    }

    if (!pendingPayments || pendingPayments.length === 0) {
      console.error('No pending payments found');
      return new Response('No matching payment found', { status: 404 });
    }

    // Find best match by email and amount
    let matchedPayment = null;
    for (const payment of pendingPayments) {
      // Get user profile to check email
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', payment.user_id)
        .single();

      if (profile && profile.email.toLowerCase() === email?.toLowerCase()) {
        const amountDiff = Math.abs(payment.amount - amount);
        if (amountDiff <= amountTolerance) {
          matchedPayment = payment;
          break;
        }
      }
    }

    if (!matchedPayment) {
      console.error('No matching payment found for email:', email, 'amount:', amount);
      return new Response('No matching payment found', { status: 404 });
    }

    console.log('Matched payment:', matchedPayment.id);

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        provider_payment_id: razorpayPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchedPayment.id);

    if (updateError) {
      console.error('Error updating payment:', updateError);
      return new Response('Failed to update payment', { status: 500 });
    }

    // Unlock course for user
    const cohortStart = new Date();
    const cohortEnd = new Date();
    cohortEnd.setDate(cohortEnd.getDate() + 14); // 2 weeks

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        enrolled: true,
        cohort_start: cohortStart.toISOString(),
        cohort_end: cohortEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchedPayment.user_id);

    if (profileError) {
      console.error('Error unlocking course:', profileError);
      return new Response('Failed to unlock course', { status: 500 });
    }

    console.log('Course unlocked for user:', matchedPayment.user_id);

    // Check if user was referred and award points
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referee_id', matchedPayment.user_id)
      .eq('status', 'pending')
      .maybeSingle();

    if (referral) {
      console.log('User was referred, updating referral status');
      
      // Update referral status to enrolled_paid
      const { error: referralError } = await supabase
        .from('referrals')
        .update({ status: 'enrolled_paid' })
        .eq('id', referral.id);

      if (referralError) {
        console.error('Error updating referral:', referralError);
      } else {
        console.log('Referral points will be awarded by trigger');
      }
    }

    // Apply coupon if it was used (stored in payment metadata)
    // The coupon was already validated and applied in initiate-payment
    // No additional action needed here

    console.log('Payment processing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Payment processed and course unlocked',
        payment_id: matchedPayment.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: (error as any).message || 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
