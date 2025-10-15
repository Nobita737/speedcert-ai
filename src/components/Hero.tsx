import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Award, Zap } from "lucide-react";
import { EnrollmentDialog } from "./EnrollmentDialog";

const Hero = () => {
  const [enrollmentOpen, setEnrollmentOpen] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 animate-slide-up">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Launch Offer: ₹1,199 Only</span>
          </div>
          
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Get Certified in AI
            <span className="block mt-2 bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              Build Career-Ready Projects
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            Intensive 2-week AI certification for tech students. Learn core AI, build a resume-ready project, and get a verified certificate.
          </p>
          
          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { icon: CheckCircle2, text: "Learn in 1 Week" },
              { icon: Award, text: "Certified in 2 Weeks" },
              { icon: CheckCircle2, text: "Resume-Ready Project" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <item.icon className="w-5 h-5 text-accent" />
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="xl" 
              variant="accent"
              className="group"
              onClick={() => setEnrollmentOpen(true)}
            >
              Enroll Now — ₹1,199
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-foreground"
            >
              Download Syllabus
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 text-white/80 text-sm">
            <p className="mb-2">Trusted by 500+ students</p>
            <div className="flex justify-center gap-8 text-xs">
              <span>✓ Verified Certificate</span>
              <span>✓ GitHub-Backed Projects</span>
              <span>✓ 100% Practical</span>
            </div>
          </div>
        </div>
      </div>

      <EnrollmentDialog open={enrollmentOpen} onOpenChange={setEnrollmentOpen} />
    </section>
  );
};

export default Hero;
