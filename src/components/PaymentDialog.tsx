import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, X, Tag } from "lucide-react";
import { z } from "zod";

const paymentSchema = z.object({
  preferredTrack: z.enum(["nlp", "cv", "tabular", "other"]),
  couponCode: z.string().optional(),
  paymentProvider: z.enum(["razorpay", "stripe"]),
  agreedToTerms: z.boolean().refine(val => val === true, "You must agree to terms"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userProfile: any;
}

export function PaymentDialog({ open, onOpenChange, userProfile }: PaymentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<PaymentFormData>>({
    preferredTrack: userProfile?.preferred_track || "nlp",
    paymentProvider: "razorpay",
    agreedToTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});
  const [couponValidation, setCouponValidation] = useState<{
    loading: boolean, 
    valid: boolean | null, 
    discount?: {
      amount: number,
      finalPrice: number,
      originalPrice: number,
      message: string
    },
    error?: string
  }>({
    loading: false,
    valid: null
  });

  const validateCouponCode = async (code: string) => {
    if (!code || code.length < 3) {
      setCouponValidation({ loading: false, valid: null });
      return;
    }

    setCouponValidation({ loading: true, valid: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-coupon', {
        body: { 
          couponCode: code,
          originalAmount: 999
        }
      });

      if (error) throw error;

      if (data.valid) {
        setCouponValidation({ 
          loading: false, 
          valid: true, 
          discount: data.discount 
        });
      } else {
        setCouponValidation({ 
          loading: false, 
          valid: false,
          error: data.error 
        });
      }
    } catch (err: any) {
      setCouponValidation({ 
        loading: false, 
        valid: false,
        error: 'Failed to validate coupon'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = paymentSchema.parse(formData);
      setLoading(true);

      // Update preferred track if changed
      if (validated.preferredTrack !== userProfile.preferred_track) {
        await supabase
          .from('profiles')
          .update({ preferred_track: validated.preferredTrack })
          .eq('id', userProfile.id);
      }

      // Call initiate-payment edge function
      const finalPrice = couponValidation.valid && couponValidation.discount 
        ? couponValidation.discount.finalPrice 
        : 999;

      const { data, error } = await supabase.functions.invoke('initiate-payment', {
        body: {
          userId: userProfile.id,
          paymentProvider: 'razorpay',
          // Only pass coupon code if it was validated as valid
          couponCode: couponValidation.valid ? validated.couponCode : undefined,
          price: finalPrice,
          returnUrl: window.location.origin,
        }
      });

      if (error) throw error;

      if (data.success) {
        // Store pending payment ID for return handling
        localStorage.setItem('pending_payment_id', data.payment.id);
        
        // Redirect to Razorpay.me payment link
        window.location.href = data.payment.providerPayload.paymentLinkUrl;
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof PaymentFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof PaymentFormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        const ctxBody = (err as any)?.context?.body;
        const details = ctxBody?.details || ctxBody;

        const message =
          details?.error_description ||
          details?.error?.description ||
          details?.error?.message ||
          details?.error ||
          (err instanceof Error ? err.message : "Something went wrong");

        toast({
          title: "Payment Failed",
          description: String(message),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };


  const finalPrice = couponValidation.valid && couponValidation.discount 
    ? couponValidation.discount.finalPrice 
    : 999;

  const originalPrice = 999;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Complete Your Enrollment
          </DialogTitle>
          <DialogDescription>
            Finalize your payment to start learning
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <p className="text-sm"><span className="font-semibold">Name:</span> {userProfile.name}</p>
            <p className="text-sm"><span className="font-semibold">Email:</span> {userProfile.email}</p>
            <p className="text-sm"><span className="font-semibold">College:</span> {userProfile.college}</p>
          </div>

          {/* Preferred Track */}
          <div className="space-y-2">
            <Label>AI Specialization Track *</Label>
            <Select 
              value={formData.preferredTrack} 
              onValueChange={preferredTrack => setFormData(prev => ({ ...prev, preferredTrack: preferredTrack as any }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nlp">Natural Language Processing (NLP)</SelectItem>
                <SelectItem value="cv">Computer Vision</SelectItem>
                <SelectItem value="tabular">Tabular Data & Analytics</SelectItem>
                <SelectItem value="other">Other / Undecided</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Coupon Code */}
          <div className="space-y-2">
            <Label htmlFor="couponCode">
              <Tag className="w-4 h-4 inline mr-2" />
              Coupon Code (Optional)
            </Label>
            <div className="relative">
              <Input
                id="couponCode"
                value={formData.couponCode || ""}
                onChange={e => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, couponCode: value }));
                }}
                onBlur={e => validateCouponCode(e.target.value)}
                placeholder="LAUNCH500, SAVE20, etc."
                className="pr-10"
              />
              {couponValidation.loading && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {!couponValidation.loading && couponValidation.valid === true && (
                <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
              {!couponValidation.loading && couponValidation.valid === false && formData.couponCode && (
                <X className="absolute right-3 top-3 w-4 h-4 text-destructive" />
              )}
            </div>
            
            {couponValidation.valid === true && couponValidation.discount && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  ✓ {couponValidation.discount.message}
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                  You save ₹{couponValidation.discount.amount}!
                </p>
              </div>
            )}
            
            {couponValidation.valid === false && formData.couponCode && (
              <p className="text-sm text-destructive">
                {couponValidation.error || "Invalid or expired coupon"}
              </p>
            )}
          </div>


          {/* Pricing Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Course Price:</span>
              <span className={couponValidation.valid ? "line-through text-muted-foreground text-sm" : "font-bold text-lg"}>
                ₹{originalPrice}
              </span>
            </div>
            {couponValidation.valid && couponValidation.discount && (
              <>
                <div className="flex justify-between items-center text-green-600">
                  <span className="text-sm">Discount:</span>
                  <span className="font-semibold">-₹{couponValidation.discount.amount}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                  <span className="font-semibold">Final Price:</span>
                  <span className="font-bold text-2xl text-primary">₹{finalPrice}</span>
                </div>
              </>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreedToTerms"
              checked={formData.agreedToTerms}
              onCheckedChange={agreedToTerms => setFormData(prev => ({ ...prev, agreedToTerms: agreedToTerms as boolean }))}
            />
            <Label htmlFor="agreedToTerms" className="text-sm leading-tight cursor-pointer">
              I agree to commit 2-3 hours daily for the course duration and understand the refund policy
            </Label>
          </div>
          {errors.agreedToTerms && <p className="text-sm text-destructive">{errors.agreedToTerms}</p>}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-lg py-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ₹{finalPrice} & Enroll Now
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
