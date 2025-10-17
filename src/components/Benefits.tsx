import { Card } from "@/components/ui/card";
import { Zap, Award, TrendingUp, Code, BookOpen, Shield } from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Deep Fundamentals (Week 1)",
    description: "Understand how AI models are designed, trained and deployed — the backend concepts that power modern AI.",
  },
  {
    icon: Zap,
    title: "Tool-Driven Learning (Week 2)",
    description: "Master 14 industry tools and learn how to combine them to solve real problems — no coding required.",
  },
  {
    icon: Code,
    title: "Resume-Ready Project (Week 3)",
    description: "Deliver a polished, industry-relevant project you can add to your resume and share with employers.",
  },
  {
    icon: TrendingUp,
    title: "Practical Career Outcomes",
    description: "Build demonstrable skills and artifacts employers recognize — from automation to AI-driven design.",
  },
  {
    icon: Award,
    title: "Hands-On Without Coding",
    description: "All assignments and the capstone use GUI-based tools, automations and integrations — focus on outcomes, not syntax.",
  },
  {
    icon: Shield,
    title: "Affordable Investment",
    description: "Clear one-time price: ₹999 for full course access, certificate and project review.",
  },
];

const Benefits = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Why Choose This Certification?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Designed for ambitious students who want real skills and credentials that matter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {benefits.map((benefit, index) => (
            <Card 
              key={index} 
              className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/50 group"
            >
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
