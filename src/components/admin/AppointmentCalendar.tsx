import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
}

// Mock appointment data
const mockAppointments = [
  {
    id: "1",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "+1 234 567 8901",
    service: "Hair Styling",
    time: "09:00 AM",
    status: "confirmed",
    staff: "Emma",
    date: new Date(),
  },
  {
    id: "2",
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    customerPhone: "+1 234 567 8902",
    service: "Manicure & Pedicure",
    time: "11:00 AM",
    status: "pending",
    staff: "Sophie",
    date: new Date(),
  },
  {
    id: "3",
    customerName: "Jessica Wilson",
    customerEmail: "jessica@example.com",
    customerPhone: "+1 234 567 8903",
    service: "Facial Treatment",
    time: "02:00 PM",
    status: "confirmed",
    staff: "Emma",
    date: new Date(),
  },
  {
    id: "4",
    customerName: "Amanda Brown",
    customerEmail: "amanda@example.com",
    customerPhone: "+1 234 567 8904",
    service: "Hair Coloring",
    time: "04:30 PM",
    status: "confirmed",
    staff: "Sophie",
    date: new Date(),
  },
];

export function AppointmentCalendar({ selectedDate, onSelectDate }: AppointmentCalendarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-accent/10 text-accent-foreground border-accent/20";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          className="rounded-md border bg-card p-3"
        />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">Confirmed</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
            <span className="text-muted-foreground">Pending</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full bg-destructive"></div>
            <span className="text-muted-foreground">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Appointments for Selected Date */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg font-playfair">
              Appointments for {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {mockAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-l-primary shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{appointment.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {appointment.time}
                            </div>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{appointment.customerEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{appointment.customerPhone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Service: </span>
                            <span className="font-medium">{appointment.service}</span>
                            {appointment.staff && (
                              <>
                                <span className="text-muted-foreground"> • Staff: </span>
                                <span className="font-medium">{appointment.staff}</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View</Button>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {mockAppointments.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No appointments scheduled for this date
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
