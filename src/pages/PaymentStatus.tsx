import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type PaymentState = "checking" | "success" | "pending" | "failed";

export default function PaymentStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<PaymentState>("checking");
  const [message, setMessage] = useState("Verifying your payment...");
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/auth");
      return;
    }

    verifyPayment();
  }, [user, authLoading]);

  const verifyPayment = async () => {
    const pendingPaymentId = localStorage.getItem("pending_payment_id");
    const razorpayPaymentLinkId = searchParams.get("razorpay_payment_link_id");
    const razorpayPaymentId = searchParams.get("razorpay_payment_id");
    const razorpayPaymentLinkStatus = searchParams.get("razorpay_payment_link_status");

    console.log("Payment verification started:", {
      pendingPaymentId,
      razorpayPaymentLinkId,
      razorpayPaymentId,
      razorpayPaymentLinkStatus,
    });

    // If Razorpay says paid, update immediately
    if (razorpayPaymentLinkStatus === "paid" && razorpayPaymentId) {
      setMessage("Payment received! Activating your course...");
      await activateCourse(pendingPaymentId, razorpayPaymentId);
      return;
    }

    // Otherwise poll for webhook confirmation
    pollPaymentStatus(pendingPaymentId);
  };

  const activateCourse = async (paymentId: string | null, razorpayPaymentId: string) => {
    try {
      // Update payment record if we have one
      if (paymentId) {
        const { error: paymentError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            provider_payment_id: razorpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentId)
          .eq("user_id", user!.id);

        if (paymentError) {
          console.error("Failed to update payment:", paymentError);
        }
      }

      // Unlock the course for user
      const cohortStart = new Date();
      const cohortEnd = new Date();
      cohortEnd.setDate(cohortEnd.getDate() + 21);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          enrolled: true,
          cohort_start: cohortStart.toISOString(),
          cohort_end: cohortEnd.toISOString(),
        })
        .eq("id", user!.id);

      if (profileError) {
        console.error("Failed to unlock course:", profileError);
        setState("failed");
        setMessage("Payment received but failed to unlock course. Please contact support.");
        return;
      }

      // Update any pending referral
      await updateReferralStatus();

      // Clear pending payment
      localStorage.removeItem("pending_payment_id");

      setState("success");
      setMessage("Payment successful! Your course is now unlocked.");

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error activating course:", error);
      setState("failed");
      setMessage("Something went wrong. Please contact support.");
    }
  };

  const updateReferralStatus = async () => {
    try {
      // Check if user was referred
      const { data: referral } = await supabase
        .from("referrals")
        .select("id, status")
        .eq("referee_id", user!.id)
        .eq("status", "pending")
        .single();

      if (referral) {
        await supabase
          .from("referrals")
          .update({
            status: "enrolled_paid",
            enrolled_at: new Date().toISOString(),
          })
          .eq("id", referral.id);
      }
    } catch (error) {
      // Referral update is non-critical
      console.log("No pending referral to update");
    }
  };

  const pollPaymentStatus = async (paymentId: string | null) => {
    const maxPolls = 20;
    let currentPoll = 0;

    const poll = async () => {
      currentPoll++;
      setPollCount(currentPoll);

      // Check profile enrollment status
      const { data: profile } = await supabase
        .from("profiles")
        .select("enrolled")
        .eq("id", user!.id)
        .single();

      if (profile?.enrolled) {
        localStorage.removeItem("pending_payment_id");
        setState("success");
        setMessage("Payment successful! Your course is now unlocked.");
        setTimeout(() => navigate("/dashboard"), 3000);
        return;
      }

      // Check payment status if we have an ID
      if (paymentId) {
        const { data: payment } = await supabase
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .single();

        if (payment?.status === "completed") {
          localStorage.removeItem("pending_payment_id");
          setState("success");
          setMessage("Payment successful! Your course is now unlocked.");
          setTimeout(() => navigate("/dashboard"), 3000);
          return;
        }

        if (payment?.status === "failed") {
          setState("failed");
          setMessage("Payment failed. Please try again.");
          return;
        }
      }

      if (currentPoll >= maxPolls) {
        setState("pending");
        setMessage("Payment verification is taking longer than expected.");
        return;
      }

      // Continue polling
      setTimeout(poll, 2000);
    };

    poll();
  };

  const handleRetry = () => {
    setState("checking");
    setMessage("Verifying your payment...");
    setPollCount(0);
    verifyPayment();
  };

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        {state === "checking" && (
          <>
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
              <p className="text-muted-foreground">{message}</p>
              {pollCount > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Checking... ({pollCount}/20)
                </p>
              )}
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <div className="flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-green-600">
                Payment Successful!
              </h1>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Redirecting to dashboard...
              </p>
            </div>
            <Button onClick={handleGoToDashboard} className="w-full">
              Go to Dashboard Now
            </Button>
          </>
        )}

        {state === "pending" && (
          <>
            <div className="flex justify-center">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-yellow-600">
                Verification Pending
              </h1>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                If you completed the payment, your course will be unlocked
                shortly. You can also check your dashboard.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Check Again
              </Button>
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          </>
        )}

        {state === "failed" && (
          <>
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-destructive">
                Payment Failed
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleGoToDashboard} className="w-full">
                Return to Dashboard
              </Button>
              <p className="text-sm text-muted-foreground">
                Need help?{" "}
                <a href="mailto:support@example.com" className="text-primary underline">
                  Contact Support
                </a>
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
