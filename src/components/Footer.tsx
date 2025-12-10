import { Button } from "@/components/ui/button";
import { Mail, Linkedin, Twitter, Github } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
              AI Certification Platform
            </h3>
            <p className="text-background/80 mb-4 max-w-md">
              Fast-track your AI career with our intensive 2-week certification program. Built for ambitious tech students.
            </p>
            <div className="flex gap-3">
              <Button size="icon" variant="ghost" className="text-background hover:text-accent hover:bg-background/10">
                <Linkedin className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:text-accent hover:bg-background/10">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:text-accent hover:bg-background/10">
                <Github className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="ghost" className="text-background hover:text-accent hover:bg-background/10">
                <Mail className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Quick Links</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#pricing" className="hover:text-accent transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Curriculum</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Verify Certificate</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-background">Support</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#" className="hover:text-accent transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="hover:text-accent transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-background/20 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-background/70 text-sm font-medium">
            Powered by Campayn
          </p>
          <div className="flex gap-6 text-sm text-background/70">
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link to="/refund-policy" className="hover:text-accent transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
