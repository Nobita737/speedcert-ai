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

    const { referralCode } = await req.json();

    if (!referralCode) {
      return new Response(
        JSON.stringify({ valid: false, error: 'Referral code is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if code exists and is active
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('code, is_active, user_id, profiles!inner(name)')
      .eq('code', referralCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (codeError || !codeData) {
      console.log('Invalid referral code:', referralCode, codeError);
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid or inactive referral code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const profile = codeData.profiles as any;
    return new Response(
      JSON.stringify({
        valid: true,
        referrer: {
          name: profile?.name || 'Unknown',
          code: codeData.code
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error validating referral:', error);
    return new Response(
      JSON.stringify({ valid: false, error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});