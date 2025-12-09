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

interface AppointmentListProps {
  searchQuery: string;
}

const ITEMS_PER_PAGE = 5;

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
    staff: "Sophie",
    status: "cancelled",
    notes: "Rescheduled",
  },
];

export function AppointmentList({ searchQuery }: AppointmentListProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockAppointments[0] | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEditAppointment = (appointment: typeof mockAppointments[0]) => {
    setEditAppointment(appointment as Appointment);
    setEditOpen(true);
  };

  const filteredAppointments = mockAppointments.filter((appointment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      appointment.customerName.toLowerCase().includes(query) ||
      appointment.customerEmail.toLowerCase().includes(query) ||
      appointment.customerPhone.includes(query) ||
      appointment.service.toLowerCase().includes(query)
    );
  });

  // Reset to first page when search query changes
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));
  
  const paginatedAppointments = filteredAppointments.slice(
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

  const handleViewDetails = (appointment: typeof mockAppointments[0]) => {
    setSelectedCustomer(appointment);
    setDetailsOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
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
            {paginatedAppointments.map((appointment) => (
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
                <TableCell>{appointment.service}</TableCell>
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
                      {appointment.status === "pending" && (
                        <DropdownMenuItem>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Confirm
                        </DropdownMenuItem>
                      )}
                      {appointment.status !== "cancelled" && (
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      )}
                      {appointment.status !== "confirmed" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No appointments found
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
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
