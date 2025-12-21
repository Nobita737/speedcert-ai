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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // If we have the payment link id, ask backend to verify and unlock (bypasses client RLS limitations).
    if (razorpayPaymentLinkId) {
      setMessage("Checking payment with gateway...");
      await confirmWithBackend({
        pendingPaymentId,
        razorpayPaymentLinkId,
        razorpayPaymentId,
      });
      return;
    }

    // Otherwise poll for webhook confirmation (fallback)
    pollEnrollmentFallback(pendingPaymentId);
  };

  const confirmWithBackend = async (params: {
    pendingPaymentId: string | null;
    razorpayPaymentLinkId: string;
    razorpayPaymentId: string | null;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("confirm-payment", {
        body: {
          pendingPaymentId: params.pendingPaymentId,
          razorpayPaymentLinkId: params.razorpayPaymentLinkId,
          razorpayPaymentId: params.razorpayPaymentId,
        },
      });

      if (error) throw error;

      if (data?.paid) {
        localStorage.removeItem("pending_payment_id");
        setState("success");
        setMessage("Payment successful! Your course is now unlocked.");
        setTimeout(() => navigate("/dashboard"), 2000);
        return;
      }

      // Not paid yet → keep polling enrollment
      setState("pending");
      setMessage("Payment is not confirmed yet. We\'ll keep checking.");
      pollEnrollmentFallback(params.pendingPaymentId);
    } catch (err: any) {
      const ctxBody = err?.context?.body;
      const details = ctxBody?.details || ctxBody;
      const msg =
        details?.error_description ||
        details?.error?.description ||
        details?.error?.message ||
        details?.error ||
        err?.message ||
        "Failed to verify payment";

      console.error("confirm-payment failed:", details || err);
      setState("failed");
      setMessage(String(msg));
    }
  };

  const pollEnrollmentFallback = async (paymentId: string | null) => {
    const maxPolls = 20;
    let currentPoll = 0;

    const poll = async () => {
      currentPoll++;
      setPollCount(currentPoll);

      const { data: profile } = await supabase
        .from("profiles")
        .select("enrolled")
        .eq("id", user!.id)
        .single();

      if (profile?.enrolled) {
        localStorage.removeItem("pending_payment_id");
        setState("success");
        setMessage("Payment successful! Your course is now unlocked.");
        setTimeout(() => navigate("/dashboard"), 2000);
        return;
      }

      // If we have a payment row, check for completed/failed (read-only is allowed by RLS)
      if (paymentId) {
        const { data: payment } = await supabase
          .from("payments")
          .select("status")
          .eq("id", paymentId)
          .single();

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

      setTimeout(poll, 2000);
    };

    setState("checking");
    setMessage("Verifying your payment...");
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
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
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
              <h1 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h1>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">Redirecting to dashboard...</p>
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
              <h1 className="text-2xl font-bold mb-2 text-yellow-600">Verification Pending</h1>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground mt-2">
                If you completed the payment, your course will be unlocked shortly.
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
              <h1 className="text-2xl font-bold mb-2 text-destructive">Payment Failed</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-2">
              <Button onClick={handleGoToDashboard} className="w-full">
                Return to Dashboard
              </Button>
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Try Verification Again
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
