import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Heart, Sparkles } from "lucide-react";

const menuCategories = [
  {
    icon: Scissors,
    title: "Hair Styling & Braiding",
    items: [
      { name: "Box Braids", price: "KES 3,500", duration: "4-6 hrs" },
      { name: "Knotless Braids", price: "KES 4,000", duration: "5-7 hrs" },
      { name: "Cornrows", price: "KES 1,500", duration: "1-2 hrs" },
      { name: "Twist Styles", price: "KES 2,500", duration: "2-3 hrs" },
      { name: "Silk Press", price: "KES 2,000", duration: "1-2 hrs" },
      { name: "Wash & Style", price: "KES 1,200", duration: "1 hr" },
    ],
  },
  {
    icon: Heart,
    title: "Makeup Artistry",
    items: [
      { name: "Bridal Makeup", price: "KES 8,000", duration: "2 hrs" },
      { name: "Evening Glam", price: "KES 4,500", duration: "1.5 hrs" },
      { name: "Natural Look", price: "KES 2,500", duration: "45 min" },
      { name: "Special Occasion", price: "KES 5,000", duration: "1.5 hrs" },
      { name: "Makeup Lesson", price: "KES 6,000", duration: "2 hrs" },
    ],
  },
  {
    icon: Sparkles,
    title: "Nails Studio",
    items: [
      { name: "Gel Manicure", price: "KES 1,500", duration: "45 min" },
      { name: "Acrylic Full Set", price: "KES 3,000", duration: "1.5 hrs" },
      { name: "Nail Art (per nail)", price: "KES 100", duration: "varies" },
      { name: "Pedicure", price: "KES 1,200", duration: "1 hr" },
      { name: "Gel Pedicure", price: "KES 1,800", duration: "1 hr" },
      { name: "Polish Change", price: "KES 500", duration: "20 min" },
    ],
  },
];

export const PricingMenu = () => {
  return (
    <section id="pricing" className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foreground mb-4">
            Our Menu
          </h2>
          <p className="font-inter text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent pricing for all our premium beauty services
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {menuCategories.map((category, index) => (
            <Card
              key={category.title}
              className="border-border bg-card hover:shadow-elegant transition-smooth animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary">
                    <category.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="font-playfair text-2xl text-foreground">
                    {category.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between items-start py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-inter font-medium text-foreground">
                        {item.name}
                      </p>
                      <p className="font-inter text-sm text-muted-foreground">
                        {item.duration}
                      </p>
                    </div>
                    <span className="font-playfair text-lg font-semibold text-primary">
                      {item.price}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center mt-12 font-inter text-sm text-muted-foreground">
          * Prices may vary based on hair length and complexity. Contact us for a personalized quote.
        </p>
      </div>
    </section>
  );
};
