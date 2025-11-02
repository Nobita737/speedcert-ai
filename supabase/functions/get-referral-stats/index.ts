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
        JSON.stringify({ error: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get referral code
    const { data: codeData } = await supabase
      .from('referral_codes')
      .select('code')
      .eq('user_id', user.id)
      .single();

    // Get points
    const { data: pointsData } = await supabase
      .from('referral_points')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get referrals
    const { data: referrals } = await supabase
      .from('referrals')
      .select('*, referee:profiles!referee_id(name)')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: false });

    // Get recent rewards
    const { data: rewards } = await supabase
      .from('referral_rewards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get redemptions
    const { data: redemptions } = await supabase
      .from('referral_redemptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const totalReferrals = referrals?.length || 0;
    const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
    const enrolledReferrals = referrals?.filter(r => r.status === 'enrolled_free' || r.status === 'enrolled_paid').length || 0;

    const shareableLink = `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '')}/?ref=${codeData?.code}`;

    return new Response(
      JSON.stringify({
        referralCode: codeData?.code || '',
        shareableLink,
        totalReferrals,
        pendingReferrals,
        enrolledReferrals,
        points: {
          total: pointsData?.total_points || 0,
          available: pointsData?.available_points || 0,
          redeemed: pointsData?.redeemed_points || 0,
          pending: pointsData?.pending_points || 0
        },
        recentReferrals: referrals?.map(r => ({
          refereeName: r.referee?.name || 'Unknown',
          status: r.status,
          pointsAwarded: r.points_awarded,
          date: r.created_at
        })) || [],
        recentRewards: rewards || [],
        recentRedemptions: redemptions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in get-referral-stats:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});