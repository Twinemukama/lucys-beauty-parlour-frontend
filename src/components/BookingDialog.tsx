import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Scissors, Sparkles, Heart, Flower2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { createAppointment, listAppointmentsByDate, type AppointmentStatus } from "@/apis/bookings";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedService?: string;
}

type ServiceCategory = "Hair Styling & Braiding" | "Makeup" | "Nails";

type MockServiceOption = {
  id: number;
  service: ServiceCategory;
  name: string;
  duration: number;
  descriptions: string[];
};

// Mock service options until backend services exist.
// IMPORTANT: IDs must match whatever the backend store recognizes, otherwise POST /appointments will reject service_id.
const mockServiceOptions: MockServiceOption[] = [
  {
    id: 1,
    service: "Hair Styling & Braiding",
    name: "Knotless Braids",
    duration: 120,
    descriptions: ["Small", "Medium", "Large"],
  },
  {
    id: 2,
    service: "Hair Styling & Braiding",
    name: "Wig Install",
    duration: 90,
    descriptions: ["Closure", "Frontal"],
  },
  {
    id: 3,
    service: "Makeup",
    name: "Soft Glam",
    duration: 75,
    descriptions: ["Day", "Evening"],
  },
  {
    id: 4,
    service: "Makeup",
    name: "Bridal Makeup",
    duration: 120,
    descriptions: ["Bride", "Bridesmaid"],
  },
  {
    id: 5,
    service: "Nails",
    name: "Gel Manicure",
    duration: 60,
    descriptions: ["Short", "Medium", "Long"],
  },
  {
    id: 6,
    service: "Nails",
    name: "Acrylic Full Set",
    duration: 90,
    descriptions: ["Short", "Medium", "Long"],
  },
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

const formatLocalDateYYYYMMDD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const BookingDialog = ({ open, onOpenChange, preSelectedService }: BookingDialogProps) => {
  const { toast } = useToast();
  const MAX_BOOKINGS_PER_DAY = 20;
  const [step, setStep] = useState(1);
  const [selectedServiceOptionId, setSelectedServiceOptionId] = useState<number | null>(null);
  const [selectedServiceDescription, setSelectedServiceDescription] = useState<string>("");
  const [selectedStaff, setSelectedStaff] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [dateCapacityLoading, setDateCapacityLoading] = useState(false);
  const [dateAtCapacity, setDateAtCapacity] = useState(false);
  const [capacityMessage, setCapacityMessage] = useState<string | null>(null);
  const [lastCapacityToastDate, setLastCapacityToastDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const preSelectedCategory = useMemo((): ServiceCategory | null => {
    if (!preSelectedService) return null;
    const value = preSelectedService.trim();

    // Support the portfolio tabs using ids (hair/makeup/nails)
    if (value === "hair") return "Hair Styling & Braiding";
    if (value === "makeup") return "Makeup";
    if (value === "nails") return "Nails";

    // Support passing backend group names directly
    if (value === "Hair Styling & Braiding" || value === "Makeup" || value === "Nails") {
      return value;
    }

    return null;
  }, [preSelectedService]);

  const filteredServiceOptions = useMemo(() => {
    if (!preSelectedCategory) return mockServiceOptions;
    return mockServiceOptions.filter((o) => o.service === preSelectedCategory);
  }, [preSelectedCategory]);

  const selectedServiceOption = useMemo(() => {
    if (!selectedServiceOptionId) return null;
    return filteredServiceOptions.find((o) => o.id === selectedServiceOptionId) || null;
  }, [filteredServiceOptions, selectedServiceOptionId]);

  const timeSlots = generateTimeSlots();

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setCapacityMessage(null);
      setDateAtCapacity(false);

      if (!selectedDate) return;
      const dateStr = formatLocalDateYYYYMMDD(selectedDate);

      setDateCapacityLoading(true);
      try {
        const appts = await listAppointmentsByDate(dateStr);
        if (cancelled) return;

        const confirmedCount = appts.filter((a) => a?.status === "confirmed").length;
        const activeCount = confirmedCount;
        const isFull = activeCount >= MAX_BOOKINGS_PER_DAY;
        setDateAtCapacity(isFull);

        if (isFull) {
          const msg = `That date is fully booked (${MAX_BOOKINGS_PER_DAY} confirmed bookings). Please choose another date.`;
          setCapacityMessage(msg);

          if (lastCapacityToastDate !== dateStr) {
            toast({
              title: "Date fully booked",
              description: msg,
              variant: "destructive",
            });
            setLastCapacityToastDate(dateStr);
          }
        }
      } catch {
        // If the backend doesn't expose listing, don't hard-block booking.
        if (cancelled) return;
        setDateAtCapacity(false);
        setCapacityMessage(null);
      } finally {
        if (!cancelled) setDateCapacityLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, MAX_BOOKINGS_PER_DAY, toast, lastCapacityToastDate]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!selectedServiceOption) {
      toast({
        title: "Select a service",
        description: "Please choose a service option.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedServiceDescription) {
      toast({
        title: "Missing service description",
        description: "Please select a valid description for this service.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing date/time",
        description: "Please choose a date and time.",
        variant: "destructive",
      });
      return;
    }

    // Re-check capacity at submit time to avoid races.
    try {
      const dateStr = formatLocalDateYYYYMMDD(selectedDate);
      const appts = await listAppointmentsByDate(dateStr);
      const confirmedCount = appts.filter((a) => a?.status === "confirmed").length;
      if (confirmedCount >= MAX_BOOKINGS_PER_DAY) {
        const msg = `That date is fully booked (${MAX_BOOKINGS_PER_DAY} confirmed bookings). Please choose another date.`;
        toast({
          title: "Date fully booked",
          description: msg,
          variant: "destructive",
        });
        return;
      }
    } catch {
      // If listing isn't available, rely on the backend to enforce capacity.
    }

    const staffName =
      selectedStaff && selectedStaff !== "any" ? staff.find((s) => s.id === selectedStaff)?.name || "" : "";

    try {
      const status: AppointmentStatus = "pending";
      await createAppointment({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        staff_name: staffName,
        // Use local date parts to avoid timezone/UTC shifting the day.
        date: formatLocalDateYYYYMMDD(selectedDate),
        time: selectedTime,
        service_id: selectedServiceOption.id,
        service_description: selectedServiceDescription,
        notes: customerInfo.notes,
        status,
      });

      setStep(5);
      toast({
        title: "Appointment booked",
        description: "Your appointment request has been submitted.",
      });
    } catch (err: any) {
      toast({
        title: "Booking failed",
        description: err?.message || "Unable to create appointment.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedServiceOptionId(null);
    setSelectedServiceDescription("");
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
                {filteredServiceOptions.map((opt) => {
                  const Icon = opt.service === "Hair Styling & Braiding" ? Scissors : opt.service === "Makeup" ? Heart : Sparkles;
                  const isSelected = selectedServiceOptionId === opt.id;
                  const primaryDesc = opt.descriptions[0] || "";

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceOptionId(opt.id);
                        setSelectedServiceDescription(primaryDesc);
                      }}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-smooth text-left relative",
                        "hover:border-primary",
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-playfair text-xl mb-2">{opt.name}</h3>
                      <p className="text-sm text-muted-foreground">{opt.duration} minutes</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {primaryDesc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!selectedServiceOptionId || !selectedServiceDescription}>
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
                  disabled={(date) => {
                    const day = new Date(date);
                    day.setHours(0, 0, 0, 0);
                    return day < startOfToday || day.getDay() === 0;
                  }}
                  className="rounded-md border"
                />
              </div>

              {capacityMessage && (
                <p className="mt-3 text-sm text-destructive text-center">{capacityMessage}</p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!selectedDate || dateCapacityLoading || dateAtCapacity}>
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
                  {selectedServiceOption?.name}
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
