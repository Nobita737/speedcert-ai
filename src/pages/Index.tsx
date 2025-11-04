import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Benefits from "@/components/Benefits";
import HowItWorks from "@/components/HowItWorks";
import Curriculum from "@/components/Curriculum";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Capture referral and coupon codes from URL
    const refCode = searchParams.get('ref');
    const couponCode = searchParams.get('coupon');
    
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
    }
    if (couponCode) {
      localStorage.setItem('couponCode', couponCode);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Benefits />
        <HowItWorks />
        <Curriculum />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
