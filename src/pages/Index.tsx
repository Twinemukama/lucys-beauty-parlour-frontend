import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { PricingMenu } from "@/components/PricingMenu";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

const Index = () => {
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