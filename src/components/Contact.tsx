import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { BookingDialog } from "./BookingDialog";

const contactInfo = [
  {
    icon: MapPin,
    title: "Location",
    details: "Kisasi Mall, Kampala, Uganda",
  },
  {
    icon: Phone,
    title: "Phone",
    details: "+(256) 755-897061",
  },
  {
    icon: Mail,
    title: "Email",
    details: "hello@lucysbeauty.com",
  },
  {
    icon: Clock,
    title: "Hours",
    details: "Mon-Sat: 8AM-7PM, Sun: Closed",
  },
];

export const Contact = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  return (
    <section className="py-24 px-4 bg-gradient-hero">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="font-playfair text-5xl md:text-6xl font-bold text-foreground mb-4">
            Visit Us
          </h2>
          <p className="font-inter text-lg text-muted-foreground">
            We'd love to welcome you to our salon
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {contactInfo.map((info, index) => (
            <Card
              key={info.title}
              className="border-border bg-card hover:shadow-soft transition-smooth animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-6 pb-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary">
                  <info.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-playfair text-lg font-semibold text-foreground mb-2">
                  {info.title}
                </h3>
                <p className="font-inter text-muted-foreground text-sm">
                  {info.details}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center animate-in fade-in duration-700 delay-500">
          <Button size="lg" onClick={() => setBookingOpen(true)} className="bg-gradient-primary hover:opacity-90 transition-smooth text-primary-foreground font-medium px-10 py-6 text-lg shadow-elegant">
            Book Your Appointment Today
          </Button>
        </div>
      </div>
      <BookingDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </section>
  );
};