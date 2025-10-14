import { Card } from "@/components/ui/card";
import { UserPlus, BookOpen, Code, Award } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Enroll & Setup",
    description: "Sign up, make payment, and complete the quick onboarding checklist. Get access to Slack community and course materials.",
  },
  {
    number: "02",
    icon: BookOpen,
    title: "Week 1: Learn",
    description: "Complete intensive video lessons, hands-on labs, and mini-assignments. Build foundational AI skills across 5 focused days.",
  },
  {
    number: "03",
    icon: Code,
    title: "Week 2: Build",
    description: "Develop your capstone project from scratch. Choose NLP, CV, or Tabular track. Submit GitHub repo and demo video.",
  },
  {
    number: "04",
    icon: Award,
    title: "Get Certified",
    description: "Pass automated tests and TA review. Receive your verified certificate with unique ID, QR code, and LinkedIn badge.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to your AI certification
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {steps.map((step, index) => (
            <Card 
              key={index}
              className="relative p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
            >
              {/* Step number badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {step.number}
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gradient-primary group-hover:scale-110 transition-all">
                <step.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {step.description}
              </p>
            </Card>
          ))}
        </div>

        {/* Timeline connector for desktop */}
        <div className="hidden lg:block relative -mt-6">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-accent opacity-20"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
