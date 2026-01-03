import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Mail, Phone, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import type { AppointmentDto } from "@/apis/bookings";

interface Appointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  time: string;
  status: string;
  staff: string;
  date: Date;
}

interface AppointmentCalendarProps {
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  onViewAppointment?: (appointment: Appointment) => void;
	appointments?: AppointmentDto[];
	loading?: boolean;
	error?: string | null;
}

function toDisplayTime(value: string): string {
	// Supports "HH:MM" (24h) or passes through other formats.
	const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(value);
	if (!match) return value;
	const hours24 = Number(match[1]);
	const minutes = match[2];
	const suffix = hours24 >= 12 ? "PM" : "AM";
	const hours12 = ((hours24 + 11) % 12) + 1;
	return `${hours12}:${minutes} ${suffix}`;
}

function toCalendarAppointment(dto: AppointmentDto): Appointment {
  const normalizedDate = normalizeDateKey(dto.date);
	return {
		id: String(dto.id),
		customerName: dto.customer_name,
		customerEmail: dto.customer_email,
		customerPhone: dto.customer_phone,
		service: dto.service_description,
		time: toDisplayTime(dto.time),
		status: dto.status,
		staff: dto.staff_name,
    date: safeParseDate(normalizedDate),
	};
}

function normalizeDateKey(value: string): string {
  // Accepts "YYYY-MM-DD" or ISO timestamps like "YYYY-MM-DDTHH:mm:ssZ".
  const match = /^\d{4}-\d{2}-\d{2}/.exec(value);
  return match ? match[0] : value;
}

function safeParseDate(value: string): Date {
  try {
    return value.includes("T") ? parseISO(value) : parseISO(`${value}T00:00:00`);
  } catch {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? new Date() : d;
  }
}

const ITEMS_PER_LOAD = 15;

export function AppointmentCalendar({
  selectedDate,
  onSelectDate,
  onViewAppointment,
  appointments,
  loading,
  error,
}: AppointmentCalendarProps) {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_LOAD);
  const [isLoading, setIsLoading] = useState(false);

  // Reset displayed count when date changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_LOAD);
  }, [selectedDate]);

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const allAppointments = (appointments ?? [])
	.filter((a) => (selectedKey ? normalizeDateKey(a.date) === selectedKey : true))
    // basic stable sort by date+time for display
    .slice()
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
    .map(toCalendarAppointment);

  const displayedAppointments = allAppointments.slice(0, displayedCount);
  const hasMore = displayedCount < allAppointments.length;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollHeight = target.scrollHeight;
    const scrollTop = target.scrollTop;
    const clientHeight = target.clientHeight;
    
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
      setIsLoading(true);
      // Simulate loading delay
      setTimeout(() => {
			setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_LOAD, allAppointments.length));
        setIsLoading(false);
      }, 300);
    }
  }, [allAppointments.length, hasMore, isLoading]);

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
            <ScrollArea className="h-[400px] pr-4" onScrollCapture={handleScroll}>
              <div className="space-y-4">
				{loading && (
					<div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" />
						<span>Loading appointments…</span>
					</div>
				)}

				{!loading && error && (
					<div className="text-center py-12 text-destructive">
						{error}
					</div>
				)}

                {displayedAppointments.map((appointment) => (
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewAppointment?.(appointment)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {isLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}

                {!loading && !error && displayedAppointments.length === 0 && (
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
