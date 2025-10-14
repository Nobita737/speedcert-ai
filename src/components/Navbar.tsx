import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Award } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
              AI Cert
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </a>
            <a href="#curriculum" className="text-foreground hover:text-primary transition-colors font-medium">
              Curriculum
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors font-medium">
              Pricing
            </a>
            <a href="#verify" className="text-foreground hover:text-primary transition-colors font-medium">
              Verify Certificate
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="hero" size="default">
              Enroll Now
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent/10 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fade-in">
            <a
              href="#"
              className="block px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Home
            </a>
            <a
              href="#curriculum"
              className="block px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Curriculum
            </a>
            <a
              href="#pricing"
              className="block px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Pricing
            </a>
            <a
              href="#verify"
              className="block px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Verify Certificate
            </a>
            <div className="pt-2">
              <Button variant="hero" size="default" className="w-full">
                Enroll Now
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
