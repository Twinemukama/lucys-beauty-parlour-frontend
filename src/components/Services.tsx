import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Sparkles, Droplets, Heart, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Hair Styling & Braiding",
    description: "Expert cuts, braids, and styling tailored to enhance your natural beauty.",
  },
  {
    icon: Heart,
    title: "Makeup Artistry",
    description: "Professional makeup application for any occasion, from natural to glamorous.",
  },
  {
    icon: Sparkles,
    title: "Nails Studio",
    description: "Luxurious manicures, pedicures, and nail art to complement your style.",
  },
  {
    icon: Droplets,
    title: "Wellness & Spa",
    description: "Relaxing spa treatments designed to nurture your body and soul.",
    upcoming: true,
  },
];

export const Services = () => {
  return (
    <section id="services" className="py-24 px-4 bg-gradient-hero">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our curated selection of premium beauty and wellness treatments
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className={`group hover:shadow-elegant transition-smooth border-border bg-card animate-in fade-in slide-in-from-bottom-8 duration-700 relative ${'upcoming' in service && service.upcoming ? 'opacity-75' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {'upcoming' in service && service.upcoming && (
                <span className="absolute top-3 right-3 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full z-10">
                  Coming Soon
                </span>
              )}
              <CardContent className="pt-8 pb-6 text-center">
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary group-hover:scale-110 transition-smooth">
                  <service.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-playfair text-2xl font-semibold text-foreground mb-3">
                  {service.title}
                </h3>
                <p className="font-inter text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <Link to="/gallery">
            <Button variant="outline" size="lg" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-smooth">
              View Our Portfolio
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};