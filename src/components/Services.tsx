import { Card, CardContent } from "@/components/ui/card";
import { Scissors, Sparkles, Droplets, Heart } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Hair Styling",
    description: "Expert cuts, coloring, and treatments tailored to enhance your natural beauty.",
  },
  {
    icon: Sparkles,
    title: "Makeup Artistry",
    description: "Professional makeup application for any occasion, from natural to glamorous.",
  },
  {
    icon: Droplets,
    title: "Skincare",
    description: "Luxurious facials and treatments to rejuvenate and refresh your complexion.",
  },
  {
    icon: Heart,
    title: "Wellness",
    description: "Relaxing spa treatments designed to nurture your body and soul.",
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
              className="group hover:shadow-elegant transition-smooth border-border bg-card animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
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
      </div>
    </section>
  );
};