import { useState, useEffect } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const storedReferralCode = typeof window !== 'undefined' ? localStorage.getItem('referralCode') || '' : '';
  
  const [formData, setFormData] = useState<Partial<SignUpFormData>>({
    referralCode: storedReferralCode,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});
  const [referralValidation, setReferralValidation] = useState<{
    loading: boolean, 
    valid: boolean | null, 
    referrerName?: string
  }>({
    loading: false,
    valid: null
  });

  useEffect(() => {
    if (storedReferralCode) {
      validateReferralCode(storedReferralCode);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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

  const validateReferralCode = async (code: string) => {
    if (!code || code.length < 3) {
      setReferralValidation({ loading: false, valid: null });
      return;
    }

    setReferralValidation({ loading: true, valid: null });
    
    try {
      const { data, error } = await supabase.functions.invoke('validate-referral', {
        body: { referralCode: code }
      });

      if (error) throw error;

      if (data.valid) {
        setReferralValidation({ loading: false, valid: true, referrerName: data.referrer.name });
      } else {
        setReferralValidation({ loading: false, valid: false });
      }
    } catch (err) {
      setReferralValidation({ loading: false, valid: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validated = signUpSchema.parse(formData);
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            name: validated.name,
            referral_code: validated.referralCode,
          }
        },
      });

      if (error) throw error;

      // Track referral if code exists
      if (validated.referralCode && referralValidation.valid) {
        await supabase.functions.invoke('track-referral', {
          body: {
            referralCode: validated.referralCode,
            refereeId: data.user?.id
          }
        });
      }

      toast({
        title: "Account Created!",
        description: "Redirecting to your dashboard...",
      });

      // Redirect to dashboard
      setTimeout(() => navigate('/dashboard'), 1000);

    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof SignUpFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof SignUpFormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Sign Up Failed",
          description: err instanceof Error ? err.message : "Something went wrong",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
            Create Your Account
          </h1>
          <p className="text-muted-foreground">
            Start your AI certification journey today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="John Doe"
              required
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
              required
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
              required
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
              required
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (Optional)</Label>
            <div className="relative">
              <Input
                id="referralCode"
                value={formData.referralCode || ""}
                onChange={e => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, referralCode: value }));
                }}
                onBlur={e => validateReferralCode(e.target.value)}
                placeholder="Enter referral code"
                className="pr-10"
              />
              {referralValidation.loading && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              {!referralValidation.loading && referralValidation.valid === true && (
                <Check className="absolute right-3 top-3 w-4 h-4 text-green-500" />
              )}
              {!referralValidation.loading && referralValidation.valid === false && formData.referralCode && (
                <X className="absolute right-3 top-3 w-4 h-4 text-destructive" />
              )}
            </div>
            {referralValidation.valid === true && referralValidation.referrerName && (
              <p className="text-sm text-green-600">✓ Referred by {referralValidation.referrerName}</p>
            )}
            {referralValidation.valid === false && formData.referralCode && (
              <p className="text-sm text-destructive">Invalid or inactive referral code</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/auth"
            className="text-sm text-primary hover:underline"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
