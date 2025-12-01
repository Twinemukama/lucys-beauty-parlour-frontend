import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Scissors, Sparkles, Heart, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const services = [
  { id: "hair", name: "Hair Styling", duration: 60, icon: Scissors },
  { id: "makeup", name: "Makeup Artistry", duration: 90, icon: Sparkles },
  { id: "skincare", name: "Skincare Treatment", duration: 75, icon: Heart },
  { id: "wellness", name: "Wellness & Spa", duration: 120, icon: Flower2 },
];

const staff = [
  { id: "any", name: "No Preference" },
  { id: "lucy", name: "Lucy Martinez" },
  { id: "sarah", name: "Sarah Chen" },
  { id: "emma", name: "Emma Rodriguez" },
];

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 19; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 18) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

export const BookingDialog = ({ open, onOpenChange }: BookingDialogProps) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const timeSlots = generateTimeSlots();

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    // Handle booking submission
    console.log({
      service: selectedService,
      staff: selectedStaff,
      date: selectedDate,
      time: selectedTime,
      customer: customerInfo,
    });
    setStep(5); // Show confirmation
  };

  const resetForm = () => {
    setStep(1);
    setSelectedService("");
    setSelectedStaff("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setCustomerInfo({ name: "", email: "", phone: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-3xl">Book Your Appointment</DialogTitle>
          <DialogDescription>
            {step < 5 ? `Step ${step} of 4` : "Booking Confirmed"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-lg font-playfair mb-4 block">Select a Service</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      onClick={() => setSelectedService(service.id)}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-smooth text-left hover:border-primary",
                        selectedService === service.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card"
                      )}
                    >
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-playfair text-xl mb-2">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!selectedService}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Staff Selection & Date */}
        {step === 2 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-lg font-playfair mb-4 block">Choose Staff (Optional)</Label>
              <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                <SelectTrigger>
                  <SelectValue placeholder="No preference" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-lg font-playfair mb-4 block">Select Date</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selectedDate}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Time Selection */}
        {step === 3 && (
          <div className="space-y-6 py-4">
            <div>
              <Label className="text-lg font-playfair mb-4 block">Choose Time</Label>
              <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "p-3 rounded-md border transition-smooth text-center font-medium",
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selectedTime}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Customer Information */}
        {step === 4 && (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <Input
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Any special requirements or preferences"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 5 && (
          <div className="space-y-6 py-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-playfair text-2xl mb-2">Booking Confirmed!</h3>
              <p className="text-muted-foreground">
                A confirmation email has been sent to {customerInfo.email}
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg space-y-3 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">
                  {services.find((s) => s.id === selectedService)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              {selectedStaff && selectedStaff !== "any" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialist:</span>
                  <span className="font-medium">
                    {staff.find((s) => s.id === selectedStaff)?.name}
                  </span>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
