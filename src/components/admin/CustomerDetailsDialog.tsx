import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Mail, Phone, User, FileText, Briefcase } from "lucide-react";

interface Customer {
  id: string;
  date: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  staff: string;
  status: string;
  notes: string;
}

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

export function CustomerDetailsDialog({ open, onOpenChange, customer }: CustomerDetailsDialogProps) {
  if (!customer) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair">Appointment Details</DialogTitle>
          <DialogDescription>
            Complete information about the appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${getStatusColor(customer.status)} text-base px-4 py-1`}>
              {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
            </Badge>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-playfair flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.customerEmail}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Phone</p>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.customerPhone}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Appointment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold font-playfair flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Appointment Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.date}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Time</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.time}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Service</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.service}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Staff Member</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{customer.staff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {customer.notes && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold font-playfair flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Additional Notes
                </h3>
                <div className="pl-7">
                  <p className="text-muted-foreground">{customer.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
