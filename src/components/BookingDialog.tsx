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
  isAdmin?: boolean;
}

type ServiceCategory = "Hair Styling & Braiding" | "Makeup" | "Nails";

type MockServiceOption = {
  id: number;
  service: ServiceCategory;
  name: string;
  duration: string;
  basePrice: number; // in UGX
  descriptions: string[];
  variantCategories?: {
    [categoryName: string]: string[];
  };
};

// Mock service options until backend services exist.
// IMPORTANT: IDs must match whatever the backend store recognizes, otherwise POST /appointments will reject service_id.
const mockServiceOptions: MockServiceOption[] = [
  {
    id: 1,
    service: "Hair Styling & Braiding",
    name: "Knotless Braids",
    duration: "4-5 hours",
    basePrice: 100000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Small", "Medium", "Large"],
      "Variation": ["Plain", "Boho", "Goddess"],
    },
  },
  {
    id: 7,
    service: "Hair Styling & Braiding",
    name: "Senegalese Twists",
    duration: "4 hours",
    basePrice: 100000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Small", "Medium", "Large"],
      "Variation": ["Standard", "Island Twists"],
    },
  },
  {
    id: 8,
    service: "Hair Styling & Braiding",
    name: "Soft Locs",
    duration: "2 hours",
    basePrice: 120000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Medium", "Large"],
      "Variation": ["Plain", "Goddess"],
    },
  },
  {
    id: 9,
    service: "Hair Styling & Braiding",
    name: "Butterfly Locs",
    duration: "4-5 hours",
    basePrice: 150000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["medium", "Large"],
      "Variation": ["Plain", "Goddess"],
    },
  },
  {
    id: 10,
    service: "Hair Styling & Braiding",
    name: "French Curls",
    duration: "5-6 hours",
    basePrice: 180000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Medium", "Small"],
      "Variation": ["Boho", "Plain"],
    },
  },
  {
    id: 11,
    service: "Hair Styling & Braiding",
    name: "Cornrows (All Back)",
    duration: "2 hours",
    basePrice: 80000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Midback", "Long"],
      "Variation": ["Plain", "Goddess"],
    },
  },
  {
    id: 12,
    service: "Hair Styling & Braiding",
    name: "Stitch Cornrows",
    duration: "2 hours",
    basePrice: 80000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Long"],
    },
  },
  {
    id: 13,
    service: "Hair Styling & Braiding",
    name: "Fulani Cornrows",
    duration: "3-4 hours",
    basePrice: 100000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Type": ["In Braids", "In Twists"],
      "Variation": ["Boho", "Plain"],
    },
  },
  {
    id: 14,
    service: "Hair Styling & Braiding",
    name: "Passion Twists",
    duration: "3-4 hours",
    basePrice: 100000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Medium", "Small"],
      "Type": ["Reversed", "Bouncy"],
      "Variation": ["Boho", "Plain"],
    },
  },
  {
    id: 21,
    service: "Hair Styling & Braiding",
    name: "Fulani Passion Twists",
    duration: "4-5 hours",
    basePrice: 100000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Variation": ["Reversed", "Bouncy"],
    },
  },
  {
    id: 15,
    service: "Hair Styling & Braiding",
    name: "Kinky Twists",
    duration: "4 hours",
    basePrice: 85000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Medium", "Small", "Large"],
      "Size": ["Small", "Medium", "Large"],
      "Variation": ["Plain", "Goddess"],
    },
  },
  {
    id: 16,
    service: "Hair Styling & Braiding",
    name: "Hermaid Braids",
    duration: "3-4 hours",
    basePrice: 120000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Midback", "Long"],
      "Spacing": ["Medium", "Small", "Large"],
      "Size": ["Small", "Medium"],
    },
  },
  {
    id: 17,
    service: "Hair Styling & Braiding",
    name: "Italy Curls",
    duration: "4 hours",
    basePrice: 140000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Long"],
      "Spacing": ["Medium"],
    },
  },
  {
    id: 18,
    service: "Hair Styling & Braiding",
    name: "Jayda Wayda",
    duration: "3-4 hours",
    basePrice: 140000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Long"],
      "Variation": ["Plain", "Hannah Curls"],
    },
  },
  {
    id: 19,
    service: "Hair Styling & Braiding",
    name: "Gypsy Locs",
    duration: "2 hours",
    basePrice: 140000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Long"],
      "Variation": ["Boho", "Plain"],
    },
  },
  {
    id: 20,
    service: "Hair Styling & Braiding",
    name: "Sew-ins",
    duration: "4 hours",
    basePrice: 140000, // UGX
    descriptions: [],
    variantCategories: {
      "Length": ["Short", "Long"],
      "Bundles": ["Semi-Human"],
    },
  },
  {
    id: 2,
    service: "Hair Styling & Braiding",
    name: "Wig Install",
    duration: "1.5 hours",
    basePrice: 150000, // UGX
    descriptions: ["Closure", "Frontal"],
  },
  {
    id: 3,
    service: "Makeup",
    name: "Soft Glam",
    duration: "1-1.5 hours",
    basePrice: 120000, // UGX
    descriptions: ["Day", "Evening"],
  },
  {
    id: 4,
    service: "Makeup",
    name: "Bridal Makeup",
    duration: "2 hours",
    basePrice: 180000, // UGX
    descriptions: ["Bride", "Bridesmaid"],
  },
  {
    id: 5,
    service: "Nails",
    name: "Gel Manicure",
    duration: "1 hour",
    basePrice: 80000, // UGX
    descriptions: ["Short", "Medium", "Long"],
  },
  {
    id: 6,
    service: "Nails",
    name: "Acrylic Full Set",
    duration: "1.5 hours",
    basePrice: 110000, // UGX
    descriptions: ["Short", "Medium", "Long"],
  },
];

// Pricing modifiers for service descriptions (variants)
const descriptionPricingMap: Record<string, number> = {
  // Knotless Braids - Length
  "Short": 0,
  "Midback": 0,
  "Long": 20000,
  // Knotless Braids - Spacing
  "Small": 20000,
  "Medium": 0,
  "Large": 0,
  // Knotless Braids - Variation
  "Plain": 0,
  "Boho": 20000,
  "Goddess": 20000,
  // Senegalese Twists - Variation
  "Standard": 0,
  "Island Twists": 20000,
  // Soft Locs - Spacing & Variation (lowercase labels per request)
  "medium": 0,
  "plain": 0,
  // Wig Install
  "Closure": 15000,
  "Frontal": 20000,
  // Soft Glam
  "Day": 0,
  "Evening": 10000,
  // Bridal Makeup
  "Bride": 20000,
  "Bridesmaid": 10000,
  // Gel Manicure & Acrylic Full Set
  // "Short": 0,
  // "Medium": 5000,
  // "Long": 10000, 
};

// Optional service-specific pricing overrides by service ID
// Use when a common label (e.g., "Long") has different pricing for a particular service.
const serviceSpecificPricingMap: Record<number, Record<string, number>> = {
  // Butterfly Locs (id: 9)
  9: {
    // Length
    "Long": 50000,
    "Midback": 20000,
    "Short": 0,
    // Spacing
    "medium": 0,
    "Large": 0,
    // Variation
    "Goddess": 20000,
    "Plain": 0,
  },
  // French Curls (id: 10)
  10: {
    // Length
    "Long": 40000,
    "Midback": 20000,
    "Short": 0,
    // Spacing
    "Medium": 0,
    "Small": 10000,
    // Variation
    "Boho": 0,
    "Plain": 0,
  },
  // Cornrows (All Back) (id: 11)
  11: {
    // Length
    "Long": 20000,
    "Midback": 0,
    // Variation
    "Goddess": 10000,
    "Plain": 0,
  },
  // Fulani Cornrows (id: 13)
  13: {
    // Length
    "Long": 20000,
    "Midback": 0,
    "Short": 0,
    // Variation
    "Boho": 0,
    "Plain": 0,
    "In Braids": 20000,
    "In Twists": 0,
  },
  // Passion Twists (id: 14)
  14: {
    // Length
    "Long": 30000,
    "Midback": 10000,
    "Short": 0,
    // Spacing
    "Medium": 0,
    "Small": 10000,
    // Type
    "Reversed": 0,
    "Bouncy": 0,
    // Variation
    "Boho": 20000,
    "Plain": 0,
  },
  // Fulani Passion Twists (id: 21)
  21: {
    // Length
    "Long": 30000,
    "Midback": 0,
    "Short": 0,
    // Variation
    "Reversed": 0,
    "Bouncy": 0,
    // Combination pricing: Long+Reversed (Reversed adds +20k only when Long is selected)
    "Long+Reversed": 50000, // +30k for Long, +20k for Reversed when Long is selected
    "Midback+Reversed": 0,
    "Short+Reversed": 0,
    "Long+Bouncy": 30000,
    "Midback+Bouncy": 0,
    "Short+Bouncy": 0,
  },
  // Kinky Twists (id: 15)
  15: {
    // Length
    "Long": 35000,
    "Midback": 15000,
    "Short": 0,
    // Spacing (category-qualified to avoid collision with Size)
    "Spacing:Medium": 0,
    "Spacing:Small": 20000,
    "Spacing:Large": 0,
    // Size (category-qualified)
    "Size:Small": 0,
    "Size:Medium": 0,
    "Size:Large": 30000,
    // Variation
    "Goddess": 20000,
    "Plain": 0,
  },
  // Hermaid Braids (id: 16) - all modifiers are +0, including overrides to neutralize global pricing
  16: {
    // Length
    "Long": 0,
    "Midback": 0,
    "Short": 0,
    // Spacing (category-qualified to neutralize global Small +20k)
    "Spacing:Medium": 0,
    "Spacing:Small": 0,
    "Spacing:Large": 0,
    // Size (category-qualified)
    "Size:Small": 0,
    "Size:Medium": 0,
  },
  // Italy Curls (id: 17)
  17: {
    // Length
    "Short": 0,
    "Long": 20000,
    // Spacing
    "Medium": 0,
  },
  // Jayda Wayda (id: 18)
  18: {
    // Length
    "Short": 0,
    "Long": 20000,
    // Variation
    "Plain": 0,
    "Hannah Curls": 20000,
  },
  // Gypsy Locs (id: 19)
  19: {
    // Length
    "Long": 0,
    // Variation
    "Plain": 20000,
    // Boho uses global +20k
  },
  // Sew-ins (id: 20)
  20: {
    // Length
    "Short": 0,
    "Long": 20000,
    // Bundles (category-qualified)
    "Bundles:Semi-Human": 0,
  },
};

const staff = [
  { id: "any", name: "No Preference" },
  { id: "lucy", name: "Lucy" },
  { id: "lonnet", name: "Lonnet" },
  { id: "spe", name: "Spe" },
  { id: "truth", name: "Truth" },
  { id: "jim", name: "Jim" },
  { id: "destiny", name: "Destiny" },
  { id: "joan", name: "Joan" },
  { id: "gift", name: "Gift" },
];

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 19) {
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

const calculateTotalPrice = (
  basePrice: number,
  description: string,
  variants?: Record<string, string>,
  serviceId?: number
): number => {
  // If using categorized variants, sum all category-specific prices
  if (variants && Object.keys(variants).length > 0) {
    const svcMap = serviceId ? serviceSpecificPricingMap[serviceId] : undefined;
    
    // Check for combination pricing (e.g., "Long+Reversed")
    if (svcMap) {
      const variantLabels = Object.values(variants).sort();
      const combinationKey = variantLabels.join("+");
      
      // Check for exact match or any permutation
      for (const key of Object.keys(svcMap)) {
        if (key.includes("+")) {
          const keyParts = key.split("+").sort();
          if (keyParts.length === variantLabels.length && keyParts.every((part, i) => part === variantLabels[i])) {
            return basePrice + svcMap[key];
          }
        }
      }
    }
    
    const total = Object.entries(variants).reduce((sum, [category, label]) => {
      const svcMap = serviceId ? serviceSpecificPricingMap[serviceId] : undefined;
      // Prefer category-qualified override, then label-only override, then global label pricing
      const catKey = `${category}:${label}`;
      const override = svcMap ? (svcMap[catKey] ?? svcMap[label]) : undefined;
      const modifier = override ?? descriptionPricingMap[label] ?? 0;
      return sum + modifier;
    }, basePrice);
    return total;
  }
  // Otherwise use the single description modifier
  const svcMap = serviceId ? serviceSpecificPricingMap[serviceId] : undefined;
  const override = svcMap ? svcMap[description] : undefined;
  const modifier = override ?? descriptionPricingMap[description] ?? 0;
  return basePrice + modifier;
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
  }).format(price);
};

export const BookingDialog = ({ open, onOpenChange, preSelectedService, isAdmin = false }: BookingDialogProps) => {
  const { toast } = useToast();
  const MAX_BOOKINGS_PER_DAY = 20;
  const [step, setStep] = useState(1);
  const [selectedServiceOptionId, setSelectedServiceOptionId] = useState<number | null>(null);
  const [selectedServiceDescription, setSelectedServiceDescription] = useState<string>("");
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
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

  const isSelectedDateToday = selectedDate
    ? selectedDate.toDateString() === new Date().toDateString()
    : false;

  const isTimeSlotBlocked = (time: string) => {
    if (isAdmin) return false;
    if (!selectedDate || !isSelectedDateToday) return false;

    const [hourStr, minuteStr] = time.split(":");
    const slotDate = new Date(selectedDate);
    slotDate.setHours(Number(hourStr), Number(minuteStr), 0, 0);

    return slotDate.getTime() <= Date.now();
  };

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

  useEffect(() => {
    if (isAdmin) return;
    if (!selectedDate || !selectedTime || !isSelectedDateToday) return;
    if (isTimeSlotBlocked(selectedTime)) setSelectedTime("");
  }, [isAdmin, isSelectedDateToday, selectedDate, selectedTime]);

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
    
    // Determine final description based on whether service uses categorized variants
    let finalDescription = "";
    if (selectedServiceOption.variantCategories) {
      // Build description from categorized variants
      const requiredCategories = Object.keys(selectedServiceOption.variantCategories).length;
      const selectedCategories = Object.keys(selectedVariants).length;
      
      if (selectedCategories !== requiredCategories) {
        toast({
          title: "Incomplete selection",
          description: "Please select an option from each category.",
          variant: "destructive",
        });
        return;
      }
      finalDescription = Object.values(selectedVariants).join("-");
    } else {
      // Use standard single description
      if (!selectedServiceDescription) {
        toast({
          title: "Missing service description",
          description: "Please select a valid description for this service.",
          variant: "destructive",
        });
        return;
      }
      finalDescription = selectedServiceDescription;
    }
    
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing date/time",
        description: "Please choose a date and time.",
        variant: "destructive",
      });
      return;
    }

    if (isTimeSlotBlocked(selectedTime)) {
      toast({
        title: "Time slot unavailable",
        description: "Please choose a time later than the current time for today.",
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
    
    const totalPrice = calculateTotalPrice(
      selectedServiceOption.basePrice, 
      finalDescription,
      selectedServiceOption.variantCategories ? selectedVariants : undefined,
      selectedServiceOption.id
    );

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
        service_description: finalDescription,
        notes: customerInfo.notes,
        status,
        price_cents: totalPrice,
        currency: "UGX",
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
    setSelectedVariants({});
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
            {step < 5 ? `Step ${Math.ceil(step)} of 5` : "Booking Confirmed"}
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

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceOptionId(opt.id);
                        setStep(1.5);
                      }}
                      className={cn(
                        "p-6 rounded-lg border-2 transition-smooth text-left relative",
                        "hover:border-primary",
                        isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
                      )}
                    >
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-playfair text-xl mb-2">{opt.name}</h3>
                      <p className="text-sm text-muted-foreground">{opt.duration}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!selectedServiceOptionId}>
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 1.5: Select Service Variant */}
        {step === 1.5 && selectedServiceOption && (
          <div className="space-y-4 py-2">
            <div className="text-center pb-4 border-b">
              <h3 className="text-2xl font-playfair text-primary">{selectedServiceOption.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">Customize your service</p>
            </div>
            {selectedServiceOption.variantCategories ? (
              /* Categorized Variants (e.g., Knotless Braids) */
              <>
                {Object.entries(selectedServiceOption.variantCategories).map(([categoryName, options]) => (
                  <div key={categoryName}>
                    <Label className="text-lg font-playfair mb-3 block">{categoryName}</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {options.map((option) => {
                        const isSelected = selectedVariants[categoryName] === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSelectedVariants((prev) => ({
                                ...prev,
                                [categoryName]: option,
                              }));
                            }}
                            className={cn(
                              "p-4 rounded-lg border-2 transition-smooth text-center font-medium",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:border-primary bg-card",
                            )}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Live Price Preview */}
                {Object.keys(selectedVariants).length === Object.keys(selectedServiceOption.variantCategories).length && (
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-playfair text-lg">Total Price:</span>
                      <span className="font-playfair text-2xl text-primary">
                        {formatPrice(calculateTotalPrice(selectedServiceOption.basePrice, "", selectedVariants, selectedServiceOption.id))}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {Object.values(selectedVariants).join(" • ")}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => {
                    setStep(1);
                    setSelectedVariants({});
                  }}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={Object.keys(selectedVariants).length !== Object.keys(selectedServiceOption.variantCategories).length}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              /* Standard Variants */
              <>
                <div>
                  <Label className="text-lg font-playfair mb-4 block">Select Variant</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedServiceOption.descriptions.map((desc) => {
                      return (
                        <button
                          key={desc}
                          type="button"
                          onClick={() => {
                            setSelectedServiceDescription(desc);
                            setStep(2);
                          }}
                          className={cn(
                            "p-4 rounded-lg border-2 transition-smooth text-center font-medium flex flex-col gap-2",
                            selectedServiceDescription === desc
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border hover:border-primary bg-card",
                          )}
                        >
                          <span>{desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                </div>
              </>
            )}
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
              <Button variant="outline" onClick={() => setStep(1.5)}>
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
                {timeSlots.map((time) => {
                  const disabled = isTimeSlotBlocked(time);

                  return (
                    <button
                      key={time}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedTime(time);
                      }}
                      disabled={disabled}
                      className={cn(
                        "p-3 rounded-md border transition-smooth text-center font-medium",
                        selectedTime === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary",
                        disabled && "opacity-50 cursor-not-allowed hover:border-border"
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
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

            {/* Read-only total price before confirm */}
            <div className="pt-2">
              <Label className="text-sm text-muted-foreground">Total Price</Label>
              <div className="mt-1 text-lg font-playfair text-primary">
                {selectedServiceOption ? formatPrice(calculateTotalPrice(
                  selectedServiceOption.basePrice, 
                  selectedServiceDescription,
                  selectedServiceOption.variantCategories ? selectedVariants : undefined,
                  selectedServiceOption.id
                )) : "-"}
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
                  {selectedServiceOption?.name} ({
                    selectedServiceOption?.variantCategories 
                      ? Object.values(selectedVariants).join(" • ")
                      : selectedServiceDescription
                  })
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
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="text-muted-foreground font-semibold">Total Price:</span>
                <span className="font-playfair text-lg text-primary">
                  {selectedServiceOption && formatPrice(calculateTotalPrice(
                    selectedServiceOption.basePrice, 
                    selectedServiceDescription,
                    selectedServiceOption.variantCategories ? selectedVariants : undefined,
                    selectedServiceOption.id
                  ))}
                </span>
              </div>
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
