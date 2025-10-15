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
import { Loader2, Check, X } from "lucide-react";
import { z } from "zod";

const enrollmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  github: z.string().url("Must be a valid GitHub URL").regex(/github\.com/, "Must be a GitHub URL"),
  college: z.string().optional(),
  year: z.string().optional(),
  phone: z.string().optional(),
  preferredTrack: z.enum(["nlp", "cv", "tabular", "other"]),
  paymentProvider: z.enum(["razorpay", "stripe"]),
  commitment: z.boolean().refine(val => val === true, "You must confirm your commitment"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnrollmentDialog({ open, onOpenChange }: EnrollmentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<EnrollmentFormData>>({
    preferredTrack: "nlp",
    paymentProvider: "razorpay",
    commitment: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EnrollmentFormData, string>>>({});

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = enrollmentSchema.parse(formData);
      setLoading(true);

      // Call signup-init edge function
      const { data, error } = await supabase.functions.invoke('signup-init', {
        body: {
          name: validated.name,
          email: validated.email,
          password: validated.password,
          college: validated.college,
          year: validated.year,
          github: validated.github,
          phone: validated.phone,
          preferredTrack: validated.preferredTrack,
          paymentProvider: validated.paymentProvider,
          price: 1199,
        }
      });

      if (error) throw error;

      if (data.success) {
        // Launch payment flow
        if (validated.paymentProvider === 'razorpay') {
          launchRazorpay(data.payment.providerPayload, data.user);
        } else {
          launchStripe(data.payment.providerPayload);
        }
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof EnrollmentFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof EnrollmentFormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Enrollment Failed",
          description: err instanceof Error ? err.message : "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const launchRazorpay = (orderData: any, user: any) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "AI Certification",
      description: "2-Week AI Certification Program",
      order_id: orderData.id,
      handler: async function (response: any) {
        try {
          const { error } = await supabase.functions.invoke('complete-payment', {
            body: {
              userId: user.id,
              paymentProvider: 'razorpay',
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }
          });
          
          if (!error) {
            window.location.href = '/dashboard';
          }
        } catch (err) {
          toast({
            title: "Payment Verification Failed",
            description: "Please contact support",
            variant: "destructive",
          });
        }
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#8B5CF6"
      }
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  const launchStripe = (sessionData: any) => {
    window.location.href = sessionData.url;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Enroll in AI Certification
          </DialogTitle>
          <DialogDescription>
            Complete your registration and payment to start your AI journey
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password || ""}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
            />
            {formData.password && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      i < passwordStrength ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            )}
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword || ""}
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="college">College / University</Label>
              <Input
                id="college"
                value={formData.college || ""}
                onChange={e => setFormData(prev => ({ ...prev, college: e.target.value }))}
                placeholder="Optional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select value={formData.year} onValueChange={year => setFormData(prev => ({ ...prev, year }))}>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile URL *</Label>
            <Input
              id="github"
              value={formData.github || ""}
              onChange={e => setFormData(prev => ({ ...prev, github: e.target.value }))}
              placeholder="https://github.com/yourusername"
            />
            {errors.github && <p className="text-sm text-destructive">{errors.github}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone || ""}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-2">
            <Label>Preferred Track *</Label>
            <RadioGroup
              value={formData.preferredTrack}
              onValueChange={preferredTrack => setFormData(prev => ({ ...prev, preferredTrack: preferredTrack as any }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="nlp" id="nlp" />
                <Label htmlFor="nlp" className="font-normal">NLP (Natural Language Processing)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cv" id="cv" />
                <Label htmlFor="cv" className="font-normal">Computer Vision</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="tabular" id="tabular" />
                <Label htmlFor="tabular" className="font-normal">Tabular Data / ML</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal">Other / Hybrid</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Payment Provider *</Label>
            <RadioGroup
              value={formData.paymentProvider}
              onValueChange={paymentProvider => setFormData(prev => ({ ...prev, paymentProvider: paymentProvider as any }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="font-normal">Razorpay (India)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="stripe" id="stripe" />
                <Label htmlFor="stripe" className="font-normal">Stripe (International)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="commitment"
              checked={formData.commitment}
              onCheckedChange={commitment => setFormData(prev => ({ ...prev, commitment: !!commitment }))}
            />
            <Label htmlFor="commitment" className="font-normal text-sm leading-relaxed">
              I confirm I can dedicate ~4–6 hours/week for this course *
            </Label>
          </div>
          {errors.commitment && <p className="text-sm text-destructive">{errors.commitment}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>Pay & Enroll — ₹1,199</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By enrolling, you agree to our terms of service and privacy policy
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}