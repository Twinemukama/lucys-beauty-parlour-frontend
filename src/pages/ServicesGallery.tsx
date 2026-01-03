import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scissors, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingDialog } from "@/components/BookingDialog";

const categories = [
  { id: "hair", label: "Hair", fullLabel: "Hair Styling & Braiding", icon: Scissors },
  { id: "makeup", label: "Makeup", fullLabel: "Makeup Artistry", icon: Heart },
  { id: "nails", label: "Nails", fullLabel: "Nails Studio", icon: Sparkles },
];

const bookingServiceByTab: Record<string, string> = {
  hair: "Hair Styling & Braiding",
  makeup: "Makeup",
  nails: "Nails",
};

const galleryItems = {
  hair: [
    { id: 1, title: "Elegant Updo", description: "Perfect for weddings and special occasions", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop" },
    { id: 2, title: "Box Braids", description: "Protective styling with intricate patterns", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=500&fit=crop" },
    { id: 3, title: "Cornrows", description: "Classic braided elegance", image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&h=500&fit=crop" },
    { id: 4, title: "Romantic Waves", description: "Soft, flowing curls for any event", image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop" },
    { id: 5, title: "Sleek Straight", description: "Glossy, smooth finish", image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=500&fit=crop" },
    { id: 6, title: "Braided Crown", description: "Intricate braiding artistry", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop" },
  ],
  makeup: [
    { id: 1, title: "Bridal Glam", description: "Radiant looks for your special day", image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?w=400&h=500&fit=crop" },
    { id: 2, title: "Natural Beauty", description: "Enhanced everyday elegance", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=500&fit=crop" },
    { id: 3, title: "Smokey Eye", description: "Dramatic evening glamour", image: "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&h=500&fit=crop" },
    { id: 4, title: "Bold Lip", description: "Statement color impact", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=500&fit=crop" },
    { id: 5, title: "Dewy Skin", description: "Fresh, luminous complexion", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=500&fit=crop" },
    { id: 6, title: "Editorial Look", description: "Creative artistic expression", image: "https://images.unsplash.com/photo-1526510747491-312da4e9b320?w=400&h=500&fit=crop" },
  ],
  nails: [
    { id: 1, title: "French Manicure", description: "Classic elegance for every occasion", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop" },
    { id: 2, title: "Gel Art Design", description: "Creative patterns and colors", image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=400&h=500&fit=crop" },
    { id: 3, title: "Ombre Nails", description: "Gradient color perfection", image: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=400&h=500&fit=crop" },
    { id: 4, title: "Marble Effect", description: "Luxurious stone-inspired design", image: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&h=500&fit=crop" },
    { id: 5, title: "Glitter Accent", description: "Sparkle and shine", image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&h=500&fit=crop" },
    { id: 6, title: "Minimalist Lines", description: "Modern geometric elegance", image: "https://images.unsplash.com/photo-1571290274554-6a2eaa771e5f?w=400&h=500&fit=crop" },
  ],
};

export default function ServicesGallery() {
  const [selectedImage, setSelectedImage] = useState<{ title: string; image: string; description: string } | null>(null);
  const [activeTab, setActiveTab] = useState("hair");
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="font-playfair text-2xl font-bold text-foreground">Our Portfolio</h1>
          <div className="w-24" />
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Our Work Gallery
          </h2>
          <p className="font-inter text-lg text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Browse through our collection of stunning transformations and find inspiration for your next visit
          </p>
        </div>
      </section>

      {/* Gallery Tabs */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full max-w-2xl mx-auto justify-center gap-2 mb-12 h-auto p-2 bg-muted/50">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="flex items-center gap-2 px-4 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                >
                  <category.icon className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline whitespace-nowrap">{category.fullLabel}</span>
                  <span className="sm:hidden">{category.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(galleryItems).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, index) => (
                    <Card
                      key={item.id}
                      className="group overflow-hidden border-border bg-card cursor-pointer hover:shadow-elegant transition-smooth animate-in fade-in slide-in-from-bottom-8 duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => setSelectedImage(item)}
                    >
                      <AspectRatio ratio={4 / 5}>
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-smooth">
                          <h3 className="font-playfair text-xl font-semibold text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="font-inter text-sm text-white/80">
                            {item.description}
                          </p>
                        </div>
                      </AspectRatio>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-hero">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-playfair text-3xl font-bold text-foreground mb-4">
            Ready for Your Transformation?
          </h3>
          <p className="font-inter text-muted-foreground mb-8">
            Book an appointment and let our expert stylists create your perfect look
          </p>
          <Button 
            size="lg" 
            className="bg-gradient-primary hover:opacity-90 transition-smooth text-primary-foreground font-medium px-8 py-6 text-lg shadow-elegant"
            onClick={() => setBookingOpen(true)}
          >
            Book {activeTab === "hair" ? "Hair" : activeTab === "nails" ? "Nails" : "Makeup"} Appointment Now
          </Button>
        </div>
      </section>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card">
          {selectedImage && (
            <div>
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-cover"
              />
              <div className="p-6">
                <h3 className="font-playfair text-2xl font-bold text-foreground mb-2">
                  {selectedImage.title}
                </h3>
                <p className="font-inter text-muted-foreground">
                  {selectedImage.description}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      <BookingDialog 
        open={bookingOpen} 
        onOpenChange={setBookingOpen} 
        preSelectedService={bookingServiceByTab[activeTab]}
      />
    </div>
  );
}
