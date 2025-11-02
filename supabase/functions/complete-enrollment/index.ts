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

    const { userId, enrollmentType, cohortStart, cohortEnd } = await req.json();

    if (!userId || !enrollmentType) {
      return new Response(
        JSON.stringify({ error: 'User ID and enrollment type are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update user profile to enrolled
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        enrolled: true,
        cohort_start: cohortStart || new Date().toISOString(),
        cohort_end: cohortEnd || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to update enrollment status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if there's a pending referral for this user
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*, referrer:profiles!referrer_id(name)')
      .eq('referee_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    let pointsAwarded = 0;
    let referrerName = null;

    if (!referralError && referral) {
      // Update referral status which will trigger point awarding
      const newStatus = enrollmentType === 'paid' ? 'enrolled_paid' : 'enrolled_free';
      
      const { data: updatedReferral, error: updateError } = await supabase
        .from('referrals')
        .update({ status: newStatus })
        .eq('id', referral.id)
        .select()
        .single();

      if (!updateError && updatedReferral) {
        pointsAwarded = updatedReferral.points_awarded;
        referrerName = referral.referrer.name;
        console.log('Referral updated, points awarded:', pointsAwarded);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        pointsAwarded,
        referrerName
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in complete-enrollment:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});