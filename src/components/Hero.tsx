import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Award } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center animate-fade-in">
          {/* Promo Banner */}
          <div className="mb-6 animate-bounce-slow">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
              <span className="text-xs sm:text-sm md:text-base font-bold">
                🎉 Get up to ₹500 OFF! for <span className="bg-white/20 px-2 py-1 rounded ml-1">Students</span>
              </span>
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight px-4">
            <span className="inline-block">Get Certified in AI</span>
            <span className="block mt-2 bg-gradient-to-r from-accent to-white bg-clip-text text-transparent">
              3 Weeks, Zero Code
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Learn how AI works behind the scenes, master the industry tools used by engineers and product teams, and deliver a resume-ready project (no machine learning code required).
          </p>
          
          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-10 px-4">
            {[
              { icon: CheckCircle2, text: "Week 1: How AI works" },
              { icon: Award, text: "Week 2: Hands-on with 14 tools" },
              { icon: CheckCircle2, text: "Week 3: Capstone project" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-white/95 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                <span className="font-medium whitespace-nowrap">{item.text}</span>
              </div>
            ))}
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Button 
              size="xl" 
              variant="accent"
              className="group w-full sm:w-auto"
              onClick={() => user ? navigate('/dashboard') : navigate('/signup')}
            >
              {user ? 'Go to Dashboard' : 'Enroll Now'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="xl" 
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-foreground w-full sm:w-auto"
            >
              Download Syllabus (PDF)
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 text-white/80 text-sm px-4">
            <p className="mb-2">Certificate on completion • Resume-ready project • No coding required</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
