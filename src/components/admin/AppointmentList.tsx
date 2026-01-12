import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { MoreHorizontal, Eye, Edit, Trash, CheckCircle, XCircle } from "lucide-react";
import { CustomerDetailsDialog } from "./CustomerDetailsDialog";
import { EditAppointmentDialog, Appointment } from "./EditAppointmentDialog";
import { useToast } from "@/hooks/use-toast";
import type { AppointmentDto } from "@/apis/bookings";
import { updateAdminAppointment, cancelAdminAppointment, deleteAdminAppointment } from "@/apis/bookings";
import { getServiceDisplayName } from "@/lib/utils";

interface AppointmentListProps {
  searchQuery: string;
  appointments?: AppointmentDto[];
  loading?: boolean;
  error?: string | null;
  onConfirm?: (customerId: string) => void;
  onCancel?: (customerId: string) => void;
}

const ITEMS_PER_PAGE = 5;

// ...existing code...

type AppointmentRow = {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  service_id: number;
  staff: string;
  status: string;
  notes: string;
};

function toDisplayTime(value: string): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)/.exec(value);
  if (!match) return value;
  const hours24 = Number(match[1]);
  const minutes = match[2];
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = ((hours24 + 11) % 12) + 1;
  return `${hours12}:${minutes} ${suffix}`;
}

function timeToMinutes(displayTime: string): number {
  // Convert 12-hour format (e.g., "09:00 AM") back to minutes since midnight
  const match = /^(\d{1,2}):(\d{2})\s(AM|PM)$/.exec(displayTime.trim());
  if (!match) return 0;
  
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3];
  
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  
  return hours * 60 + minutes;
}

function toRow(dto: AppointmentDto): AppointmentRow {
  return {
    id: String(dto.id),
    date: dto.date,
    time: toDisplayTime(dto.time),
    customerName: dto.customer_name,
    customerEmail: dto.customer_email,
    customerPhone: dto.customer_phone,
    service: dto.service_description,
    service_id: dto.service_id,
    staff: dto.staff_name,
    status: dto.status,
    notes: dto.notes ?? "",
  };
}

// Mock appointments data
const mockAppointments = [
  {
    id: "1",
    date: "2025-01-15",
    time: "09:00 AM",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerPhone: "+1 234 567 8901",
    service: "Hair Styling",
    service_id: 1,
    staff: "Emma",
    status: "confirmed",
    notes: "Prefers natural colors",
  },
  {
    id: "2",
    date: "2025-01-15",
    time: "11:00 AM",
    customerName: "Emily Davis",
    customerEmail: "emily@example.com",
    customerPhone: "+1 234 567 8902",
    service: "Manicure & Pedicure",
    service_id: 5,
    staff: "Sophie",
    status: "pending",
    notes: "First time customer",
  },
  {
    id: "3",
    date: "2025-01-16",
    time: "02:00 PM",
    customerName: "Jessica Wilson",
    customerEmail: "jessica@example.com",
    customerPhone: "+1 234 567 8903",
    service: "Facial Treatment",
    service_id: 3,
    staff: "Emma",
    status: "confirmed",
    notes: "Sensitive skin",
  },
  {
    id: "4",
    date: "2025-01-16",
    time: "04:30 PM",
    customerName: "Amanda Brown",
    customerEmail: "amanda@example.com",
    customerPhone: "+1 234 567 8904",
    service: "Hair Coloring",
    service_id: 1,
    staff: "Sophie",
    status: "confirmed",
    notes: "",
  },
  {
    id: "5",
    date: "2025-01-17",
    time: "10:00 AM",
    customerName: "Rachel Green",
    customerEmail: "rachel@example.com",
    customerPhone: "+1 234 567 8905",
    service: "Makeup",
    service_id: 4,
    staff: "Emma",
    status: "pending",
    notes: "Wedding makeup",
  },
  {
    id: "6",
    date: "2025-01-17",
    time: "01:00 PM",
    customerName: "Monica Geller",
    customerEmail: "monica@example.com",
    customerPhone: "+1 234 567 8906",
    service: "Hair Styling",
    service_id: 1,
    staff: "Sophie",
    status: "confirmed",
    notes: "",
  },
  {
    id: "7",
    date: "2025-01-18",
    time: "10:30 AM",
    customerName: "Phoebe Buffay",
    customerEmail: "phoebe@example.com",
    customerPhone: "+1 234 567 8907",
    service: "Facial Treatment",
    service_id: 3,
    staff: "Emma",
    status: "pending",
    notes: "Prefers organic products",
  },
  {
    id: "8",
    date: "2025-01-18",
    time: "03:00 PM",
    customerName: "Chandler Bing",
    customerEmail: "chandler@example.com",
    customerPhone: "+1 234 567 8908",
    service: "Hair Styling",
    service_id: 1,
    staff: "Sophie",
    status: "cancelled",
    notes: "Rescheduled",
  },
];

export function AppointmentList({ searchQuery, appointments, loading, error, onConfirm, onCancel }: AppointmentListProps) {
  const rows: AppointmentRow[] = (appointments ? appointments.map(toRow) : mockAppointments);
  const [selectedCustomer, setSelectedCustomer] = useState<AppointmentRow | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const handleEditAppointment = (appointment: AppointmentRow) => {
    setEditAppointment(appointment as Appointment);
    setEditOpen(true);
  };

  const filteredAppointments = rows.filter((appointment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      appointment.customerName.toLowerCase().includes(query) ||
      appointment.customerEmail.toLowerCase().includes(query) ||
      appointment.customerPhone.includes(query) ||
      appointment.service.toLowerCase().includes(query)
    );
  });

  // Sort by date and time, most upcoming first (earliest appointments first)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // First compare by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // If same date, compare by time
    const timeAMinutes = timeToMinutes(a.time);
    const timeBMinutes = timeToMinutes(b.time);
    return timeAMinutes - timeBMinutes;
  });

  const handleConfirm = async (appointment: AppointmentRow) => {
    try {
      const appointmentId = Number(appointment.id);
      await updateAdminAppointment(appointmentId, {
        customer_name: appointment.customerName,
        customer_email: appointment.customerEmail,
        customer_phone: appointment.customerPhone,
        staff_name: appointment.staff,
        service_id: appointment.service_id,
        service_description: appointment.service,
        date: appointment.date,
        time: appointment.time,
        status: "confirmed",
      });
      toast({
        title: "Appointment Confirmed",
        description: `Appointment for ${appointment.customerName} has been confirmed.`,
      });
      if (onConfirm) {
        onConfirm(appointment.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = async (appointment: AppointmentRow) => {
    try {
      const appointmentId = Number(appointment.id);
      await cancelAdminAppointment(appointmentId);
      toast({
        title: "Appointment Cancelled",
        description: `Appointment for ${appointment.customerName} has been cancelled.`,
        variant: "destructive",
      });
      if (onCancel) {
        onCancel(appointment.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (appointment: AppointmentRow) => {
    if (!window.confirm(`Are you sure you want to delete this appointment? This action cannot be undone.`)) {
      return;
    }
    try {
      const appointmentId = Number(appointment.id);
      await deleteAdminAppointment(appointmentId);
      toast({
        title: "Appointment Deleted",
        description: `Appointment for ${appointment.customerName} has been permanently deleted.`,
      });
      if (onConfirm) {
        onConfirm(appointment.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };


  // Reset to first page when search query changes
  const totalPages = Math.ceil(sortedAppointments.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const paginatedAppointments = sortedAppointments.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

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

  const handleViewDetails = (appointment: AppointmentRow) => {
    setSelectedCustomer(appointment);
    setDetailsOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
		{loading && (
			<div className="text-center py-12 text-muted-foreground">Loading appointments…</div>
		)}
		{!loading && error && (
			<div className="text-center py-12 text-destructive">{error}</div>
		)}

        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
			{!loading && !error && paginatedAppointments.map((appointment) => (
              <TableRow key={appointment.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{appointment.date}</span>
                    <span className="text-sm text-muted-foreground">{appointment.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{appointment.customerName}</span>
                    <span className="text-sm text-muted-foreground">{appointment.customerEmail}</span>
                  </div>
                </TableCell>
                <TableCell>{getServiceDisplayName(appointment.service_id, appointment.service)}</TableCell>
                <TableCell>{appointment.staff}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleViewDetails(appointment)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {appointment.status !== "confirmed" && appointment.status !== "cancelled" && (
                        <DropdownMenuItem onClick={() => handleEditAppointment(appointment)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {
                        appointment.status === "pending" && (
                          <DropdownMenuItem onClick={() => handleConfirm(appointment)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm
                          </DropdownMenuItem>
                        )
                      }
                      {appointment.status !== "cancelled" && (
                        <DropdownMenuItem onClick={() => handleCancel(appointment)} className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      )}

                      {appointment.status !== "confirmed" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(appointment)}
                            className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
			))}
          </TableBody>
        </Table>

		{!loading && !error && filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No appointments found
          </div>
		)}
      </div>

      {/* Pagination */}
		{!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((validCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredAppointments.length)} of {filteredAppointments.length} appointments
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={validCurrentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === validCurrentPage}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={validCurrentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
		)}

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        customer={selectedCustomer}
      />

      {/* Edit Appointment Dialog */}
      <EditAppointmentDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        appointment={editAppointment}
      />
    </>
  );
}
