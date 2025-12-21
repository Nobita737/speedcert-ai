import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabaseAuth = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    const {
      pendingPaymentId,
      razorpayPaymentLinkId,
      razorpayPaymentId,
    } = await req.json();

    const { data: userData, error: authError } = await supabaseAuth.auth.getUser();
    const user = userData?.user;
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const linkId = typeof razorpayPaymentLinkId === "string" ? razorpayPaymentLinkId : "";
    if (!linkId) {
      return new Response(JSON.stringify({ error: "Missing payment link id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(JSON.stringify({ error: "Payment gateway not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authString = base64Encode(`${razorpayKeyId}:${razorpayKeySecret}`);

    const linkRes = await fetch(`https://api.razorpay.com/v1/payment_links/${linkId}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    });

    const linkJson = await linkRes.json().catch(() => ({}));
    if (!linkRes.ok) {
      console.error("Razorpay link fetch failed:", linkJson);
      return new Response(JSON.stringify({ error: "Failed to verify payment", details: linkJson }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const status = (linkJson as any)?.status;
    const isPaid = status === "paid";

    // Find payment row
    let paymentRow: any = null;
    if (typeof pendingPaymentId === "string" && pendingPaymentId) {
      const { data } = await supabaseAdmin
        .from("payments")
        .select("id, status, user_id")
        .eq("id", pendingPaymentId)
        .eq("user_id", user.id)
        .single();
      paymentRow = data;
    }

    if (!paymentRow) {
      const { data } = await supabaseAdmin
        .from("payments")
        .select("id, status, user_id")
        .eq("user_id", user.id)
        .eq("provider_order_id", linkId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      paymentRow = data;
    }

    if (!paymentRow) {
      return new Response(JSON.stringify({ error: "Payment record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!isPaid) {
      return new Response(
        JSON.stringify({
          success: true,
          paid: false,
          paymentStatus: paymentRow.status,
          razorpayStatus: status,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Mark payment completed
    const providerPaymentId = typeof razorpayPaymentId === "string" ? razorpayPaymentId : null;
    const { error: payUpdateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: "completed",
        provider_payment_id: providerPaymentId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentRow.id);

    if (payUpdateError) {
      console.error("Payment update failed:", payUpdateError);
      return new Response(JSON.stringify({ error: "Failed to update payment" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Enroll user
    const cohortStart = new Date();
    const cohortEnd = new Date();
    cohortEnd.setDate(cohortEnd.getDate() + 21);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        enrolled: true,
        cohort_start: cohortStart.toISOString(),
        cohort_end: cohortEnd.toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update failed:", profileError);
      return new Response(JSON.stringify({ error: "Failed to unlock course" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Best-effort referral update
    const { data: referral } = await supabaseAdmin
      .from("referrals")
      .select("id")
      .eq("referee_id", user.id)
      .eq("status", "pending")
      .maybeSingle();

    if (referral?.id) {
      await supabaseAdmin
        .from("referrals")
        .update({ status: "enrolled_paid", enrolled_at: new Date().toISOString() })
        .eq("id", referral.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        paid: true,
        paymentId: paymentRow.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error: any) {
    console.error("Error in confirm-payment:", error);
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
