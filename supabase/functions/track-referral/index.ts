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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { referralCode, refereeUserId } = await req.json();

    if (!referralCode || !refereeUserId) {
      return new Response(
        JSON.stringify({ error: 'Referral code and referee user ID are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get referrer from code
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('user_id')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.error('Invalid referral code:', codeError);
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Don't allow self-referral
    if (codeData.user_id === refereeUserId) {
      return new Response(
        JSON.stringify({ error: 'Cannot use your own referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create referral record
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: codeData.user_id,
        referee_id: refereeUserId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending'
      })
      .select()
      .single();

    if (referralError) {
      console.error('Error creating referral:', referralError);
      return new Response(
        JSON.stringify({ error: 'Failed to track referral' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Referral tracked successfully:', referral);
    return new Response(
      JSON.stringify({ success: true, referral }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in track-referral:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});