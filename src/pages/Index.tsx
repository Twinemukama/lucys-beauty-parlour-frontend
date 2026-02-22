import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PricingMenu } from "@/components/PricingMenu";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        navigate("/admin/login");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <PricingMenu />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;