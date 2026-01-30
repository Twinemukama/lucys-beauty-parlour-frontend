import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateAdminAppointment, getAdminAppointment, AppointmentDto } from "@/apis/bookings";

export interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSave?: (appointment: Appointment) => void;
}

// Using same mock service options as BookingDialog
type MockServiceOption = {
  id: number;
  service: string;
  name: string;
  duration: number;
  basePrice: number;
  descriptions: string[];
};

const mockServiceOptions: MockServiceOption[] = [
  {
    id: 1,
    service: "Hair Styling & Braiding",
    name: "Knotless Braids",
    duration: 120,
    basePrice: 100000,
    descriptions: ["Small", "Medium", "Large"],
  },
  {
    id: 2,
    service: "Hair Styling & Braiding",
    name: "Wig Install",
    duration: 90,
    basePrice: 150000,
    descriptions: ["Closure", "Frontal"],
  },
  {
    id: 3,
    service: "Makeup",
    name: "Soft Glam",
    duration: 75,
    basePrice: 120000,
    descriptions: ["Day", "Evening"],
  },
  {
    id: 4,
    service: "Makeup",
    name: "Bridal Makeup",
    duration: 120,
    basePrice: 180000,
    descriptions: ["Bride", "Bridesmaid"],
  },
  {
    id: 5,
    service: "Nails",
    name: "Gel Manicure",
    duration: 60,
    basePrice: 80000,
    descriptions: ["Short", "Medium", "Long"],
  },
  {
    id: 6,
    service: "Nails",
    name: "Acrylic Full Set",
    duration: 90,
    basePrice: 110000,
    descriptions: ["Short", "Medium", "Long"],
  },
];

// Using same staff list as BookingDialog
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

// Using same time slot generation as BookingDialog
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

const timeSlots = generateTimeSlots();

// Convert 24-hour time format (HH:MM) to display format
const convertTo12Hour = (time24: string): string => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(time24);
  if (!match) return time24;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = ((hours24 + 11) % 12) + 1;
  return `${hours12}:${minutes} ${suffix}`;
};

// Convert 12-hour time format to 24-hour (HH:MM)
const convertTo24Hour = (displayTime: string): string => {
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(displayTime.trim());
  if (!match) return displayTime;
  
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = match[3];
  
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function EditAppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment,
  onSave 
}: EditAppointmentDialogProps) {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [serviceId, setServiceId] = useState<number>(0);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    service: "",
    staff: "",
    time: "",
    status: "",
    notes: "",
  });

  useEffect(() => {
    if (open && appointment) {
      setLoading(true);
      // Fetch full appointment details from backend
      getAdminAppointment(Number(appointment.id))
        .then((fullAppointment: AppointmentDto) => {
          // Create composite key for service selection (serviceId:description)
          const serviceKey = `${fullAppointment.service_id}:${fullAppointment.service_description}`;
          
          setFormData({
            customerName: fullAppointment.customer_name,
            customerEmail: fullAppointment.customer_email,
            customerPhone: fullAppointment.customer_phone,
            service: serviceKey,
            staff: fullAppointment.staff_name || "",
            time: convertTo12Hour(fullAppointment.time),
            status: fullAppointment.status,
            notes: fullAppointment.notes || "",
          });
          setServiceId(fullAppointment.service_id);
          
          // Parse the date string - backend returns YYYY-MM-DD format
          try {
            let parsedDate: Date | undefined;
            
            if (/^\d{4}-\d{2}-\d{2}$/.test(fullAppointment.date)) {
              parsedDate = parse(fullAppointment.date, "yyyy-MM-dd", new Date());
            } else {
              parsedDate = new Date(fullAppointment.date);
            }
            
            if (parsedDate && !isNaN(parsedDate.getTime())) {
              setDate(parsedDate);
            } else {
              setDate(undefined);
            }
          } catch {
            setDate(undefined);
          }
          setLoading(false);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "Failed to load appointment details";
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
          setLoading(false);
        });
    }
  }, [open, appointment?.id, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appointment) return;

    // Extract service description from composite key (serviceId:description)
    const serviceDescription = formData.service.includes(':') 
      ? formData.service.split(':')[1] 
      : formData.service;

    // Convert time from 12-hour to 24-hour format for API
    const time24Hour = convertTo24Hour(formData.time);
    
    // Convert date to YYYY-MM-DD format for API
    const dateStr = date ? format(date, "yyyy-MM-dd") : appointment.date;

    // Call backend API to update appointment
    updateAdminAppointment(Number(appointment.id), {
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      staff_name: formData.staff,
      service_id: serviceId,
      service_description: serviceDescription,
      date: dateStr,
      time: time24Hour,
      status: formData.status as any,
      notes: formData.notes,
    })
      .then((updated) => {
        toast({
          title: "Appointment Updated",
          description: `Appointment for ${formData.customerName} has been updated.`,
        });
        
        // Call onSave callback if provided
        if (onSave) {
          const updatedAppointment: Appointment = {
            ...appointment,
            ...formData,
            date: dateStr,
            time: convertTo12Hour(time24Hour),
          };
          onSave(updatedAppointment);
        }

        onOpenChange(false);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to update appointment";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      });
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Edit Appointment</DialogTitle>
          <DialogDescription>
            Update appointment details for {appointment.customerName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading appointment details...</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-playfair">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-playfair">Appointment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service">Service Description *</Label>
                <Select
                  value={formData.service}
                  onValueChange={(value) => {
                    // Extract serviceId from composite key
                    const [newServiceId] = value.split(':');
                    setServiceId(parseInt(newServiceId, 10));
                    setFormData({ ...formData, service: value });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockServiceOptions.flatMap((service) =>
                      service.descriptions.map((desc) => {
                        const compositeKey = `${service.id}:${desc}`;
                        return (
                          <SelectItem key={compositeKey} value={compositeKey}>
                            {service.name} - {desc}
                          </SelectItem>
                        );
                      })
                    )}
                    {formData.service && !mockServiceOptions.some(s => 
                      s.descriptions.some(d => `${s.id}:${d}` === formData.service)
                    ) && (
                      <SelectItem value={formData.service}>
                        {formData.service.includes(':') ? formData.service.split(':')[1] : formData.service}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select
                  value={formData.staff}
                  onValueChange={(value) => setFormData({ ...formData, staff: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No Preference" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.name}>
                        {member.name}
                      </SelectItem>
                    ))}
                    {formData.staff && !staff.some(s => s.name === formData.staff) && (
                      <SelectItem value={formData.staff}>
                        {formData.staff}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date.getDay() === 0}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot} value={convertTo12Hour(slot)}>
                        {convertTo12Hour(slot)}
                      </SelectItem>
                    ))}
                    {formData.time && !timeSlots.some(s => convertTo12Hour(s) === formData.time) && (
                      <SelectItem value={formData.time}>
                        {formData.time}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requests or information..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>Save Changes</Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
