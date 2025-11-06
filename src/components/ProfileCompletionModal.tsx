import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";

const profileSchema = z.object({
  college: z.string().min(2, "College/University name is required"),
  year: z.string().min(1, "Year is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  preferredTrack: z.enum(["nlp", "cv", "tabular", "other"], {
    errorMap: () => ({ message: "Please select a track" })
  }),
  githubUrl: z.string().url("Must be a valid URL").regex(/github\.com/, "Must be a GitHub URL").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileCompletionModalProps {
  open: boolean;
  onComplete: () => void;
  userName?: string;
  userId: string;
}

export function ProfileCompletionModal({ open, onComplete, userName, userId }: ProfileCompletionModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ProfileFormData>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      const stepErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      if (!formData.college || formData.college.length < 2) {
        stepErrors.college = "College/University name is required";
      }
      if (!formData.year) {
        stepErrors.year = "Year is required";
      }
      
      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        return;
      }
    }
    
    setErrors({});
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setErrors({});
    
    try {
      const validated = profileSchema.parse(formData);
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          college: validated.college,
          year: validated.year,
          phone: validated.phone,
          preferred_track: validated.preferredTrack,
          github_url: validated.githubUrl || null,
          profile_completed: true,
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profile Completed!",
        description: "Your profile has been updated successfully",
      });

      onComplete();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
        err.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0] as keyof ProfileFormData] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Help us personalize your learning experience
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Academic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="college">College / University *</Label>
              <Input
                id="college"
                value={formData.college || ""}
                onChange={e => setFormData(prev => ({ ...prev, college: e.target.value }))}
                placeholder="e.g., MIT, Stanford University"
              />
              {errors.college && <p className="text-sm text-destructive">{errors.college}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Current Year *</Label>
              <Select 
                value={formData.year} 
                onValueChange={year => setFormData(prev => ({ ...prev, year }))}
              >
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                  <SelectItem value="graduate">Graduate</SelectItem>
                </SelectContent>
              </Select>
              {errors.year && <p className="text-sm text-destructive">{errors.year}</p>}
            </div>

            <Button onClick={handleNext} className="w-full bg-gradient-primary">
              Next Step
            </Button>
          </div>
        )}

        {/* Step 2: Contact & Track */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ""}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+1 (555) 000-0000"
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredTrack">AI Track *</Label>
              <Select 
                value={formData.preferredTrack} 
                onValueChange={preferredTrack => setFormData(prev => ({ ...prev, preferredTrack: preferredTrack as any }))}
              >
                <SelectTrigger id="preferredTrack">
                  <SelectValue placeholder="Choose your specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nlp">Natural Language Processing (NLP)</SelectItem>
                  <SelectItem value="cv">Computer Vision</SelectItem>
                  <SelectItem value="tabular">Tabular Data & Analytics</SelectItem>
                  <SelectItem value="other">Other / Undecided</SelectItem>
                </SelectContent>
              </Select>
              {errors.preferredTrack && <p className="text-sm text-destructive">{errors.preferredTrack}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl">GitHub Profile (Optional)</Label>
              <Input
                id="githubUrl"
                value={formData.githubUrl || ""}
                onChange={e => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                placeholder="https://github.com/yourusername"
              />
              {errors.githubUrl && <p className="text-sm text-destructive">{errors.githubUrl}</p>}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleBack} variant="outline" className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="flex-1 bg-gradient-primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
