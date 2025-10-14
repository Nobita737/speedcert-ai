import { Card } from "@/components/ui/card";
import { Zap, Award, TrendingUp, Code, Clock, Shield } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Fast-Track Learning",
    description: "Master AI fundamentals in just 1 week with intensive, focused curriculum designed for busy students.",
  },
  {
    icon: Award,
    title: "Verified Certificate",
    description: "Get a blockchain-verified certificate with unique ID and QR code that employers can trust.",
  },
  {
    icon: Code,
    title: "Resume-Ready Project",
    description: "Build an end-to-end AI project with GitHub repository, demo, and documentation.",
  },
  {
    icon: TrendingUp,
    title: "Career Outcomes",
    description: "Stand out in interviews with practical AI skills and a portfolio project to showcase.",
  },
  {
    icon: Zap,
    title: "Hands-On Approach",
    description: "100% practical learning with labs, assignments, and real-world datasets.",
  },
  {
    icon: Shield,
    title: "Affordable Investment",
    description: "Just ₹1,199 for a credential that adds serious value to your tech career.",
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
