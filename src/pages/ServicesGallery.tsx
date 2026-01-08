import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scissors, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BookingDialog } from "@/components/BookingDialog";
import { listServiceItems, resolveServiceItemImageUrl, type ServiceCategory, type ServiceItemDto } from "@/apis/serviceItems";

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

type GalleryCard = {
	id: number;
	title: string;
	description: string;
	image: string;
};

export default function ServicesGallery() {
  const [selectedImage, setSelectedImage] = useState<{ title: string; image: string; description: string } | null>(null);
  const [activeTab, setActiveTab] = useState("hair");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [items, setItems] = useState<ServiceItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    listServiceItems({ category: activeTab as ServiceCategory, limit: 100, offset: 0, signal: controller.signal })
      .then((res) => {
        if (cancelled) return;
        setItems(res?.data || []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load gallery";
        setError(message);
        setItems([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeTab]);

  const cards: GalleryCard[] = useMemo(() => {
    return (items || []).map((it) => ({
      id: it.id,
      title: it.name,
      description: (it.descriptions && it.descriptions.length > 0 ? it.descriptions[0] : "").trim(),
      image: resolveServiceItemImageUrl(it.images?.[0] || ""),
    }));
  }, [items]);

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

            {categories.map((categoryObj) => (
              <TabsContent key={categoryObj.id} value={categoryObj.id} className="mt-0">
					{loading ? (
						<div className="text-center text-muted-foreground py-12">Loading gallery…</div>
					) : error ? (
						<div className="text-center text-destructive py-12">{error}</div>
					) : cards.length === 0 ? (
						<div className="text-center text-muted-foreground py-12">No items yet.</div>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{cards.map((item, index) => (
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
					)}
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
