import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-salon.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elegant beauty salon interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 py-20 max-w-5xl mx-auto animate-in fade-in duration-1000">
        <h1 className="font-playfair text-6xl md:text-8xl font-bold text-foreground mb-6 tracking-tight">
          Lucy's Beauty Parlour
        </h1>
        <p className="font-inter text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto font-light">
          Where elegance meets expertise. Experience luxury beauty treatments in a serene, sophisticated setting.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-smooth text-primary-foreground font-medium px-8 py-6 text-lg shadow-elegant">
            Book Appointment
          </Button>
          <Button size="lg" variant="outline" className="border-border hover:bg-secondary transition-smooth px-8 py-6 text-lg">
            View Services
          </Button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
};