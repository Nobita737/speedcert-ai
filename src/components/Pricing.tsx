import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Access to all Week 1 video lessons",
  "Downloadable course materials",
  "Google Colab starter notebooks",
  "Week 2 capstone project guidance",
  "Automated + manual grading",
  "Verified digital certificate (PDF + QR)",
  "GitHub-backed project showcase",
  "LinkedIn shareable badge",
  "Lifetime certificate access",
];

const Pricing = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background" id="pricing">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground">
            One-time payment. No hidden fees. Full access to everything.
          </p>
        </div>

        <Card className="relative overflow-hidden shadow-accent animate-scale-in">
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent"></div>
          
          <div className="p-8 sm:p-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold mb-2">AI Certification Program</h3>
                <p className="text-muted-foreground">Complete 2-week intensive course</p>
              </div>
              <Badge className="bg-gradient-primary text-white border-0 px-4 py-2 text-sm">
                <Sparkles className="w-4 h-4 mr-1" />
                Launch Offer
              </Badge>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-2">
                <span className="text-5xl sm:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ₹1,199
                </span>
                <span className="text-2xl text-muted-foreground line-through mb-2">₹2,999</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">One-time payment • No subscriptions</p>
            </div>

            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <Button size="xl" variant="hero" className="w-full mb-4">
              Enroll Now — ₹1,199
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              <strong>Money-back guarantee:</strong> Full refund within 48 hours if not satisfied
            </p>
          </div>
        </Card>

        {/* Additional info */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary mb-2">2 Weeks</div>
            <div className="text-sm text-muted-foreground">To complete certification</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Students already enrolled</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary mb-2">4.8/5</div>
            <div className="text-sm text-muted-foreground">Average student rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
