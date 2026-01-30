import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Mail, Phone, User, FileText, Briefcase, CheckCircle, XCircle, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateAdminAppointment, cancelAdminAppointment, deleteAdminAppointment, getAdminAppointment, AppointmentDto } from "@/apis/bookings";

interface Customer {
  id: string | number;
  date: string;
  dateDisplay?: string;
  time: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  service_id: number;
  staff: string;
  status: string;
  notes: string;
  price_cents?: number;
  currency?: string;
}

interface CustomerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onConfirm?: (id: string | number) => void;
  onCancel?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onEdit?: (customer: Customer) => void;
}

export function CustomerDetailsDialog({ open, onOpenChange, customer, onConfirm, onCancel, onDelete, onEdit }: CustomerDetailsDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fullAppointment, setFullAppointment] = useState<AppointmentDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  useEffect(() => {
    if (open && customer) {
      setLoadingDetails(true);
      setFullAppointment(null); // Reset on open
      getAdminAppointment(typeof customer.id === "string" ? parseInt(customer.id, 10) : customer.id)
        .then((appointment) => {
          setFullAppointment(appointment);
          setLoadingDetails(false);
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : "Failed to load appointment details";
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
          setLoadingDetails(false);
        });
    }
  }, [open, customer?.id, toast]);
  
  if (!customer) return null;

  const displayAppointment = fullAppointment || customer;

  const handleConfirm = async () => {
    if (!customer) return;
    setIsLoading(true);
    try {
      const appointmentId = typeof customer.id === "string" ? parseInt(customer.id, 10) : customer.id;
      
      await updateAdminAppointment(appointmentId, {
        customer_name: customer.customerName,
        customer_email: customer.customerEmail,
        customer_phone: customer.customerPhone,
        staff_name: customer.staff,
        service_id: customer.service_id,
        service_description: customer.service,
        date: customer.date,
        time: customer.time,
        status: "confirmed",
      });
      toast({
        title: "Appointment Confirmed",
        description: `Appointment for ${customer.customerName} has been confirmed.`,
      });
      if (onConfirm) {
        onConfirm(customer.id);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to confirm appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!customer) return;
    setIsLoading(true);
    try {
      const appointmentId = typeof customer.id === "string" ? parseInt(customer.id, 10) : customer.id;
      await cancelAdminAppointment(appointmentId);
      toast({
        title: "Appointment Cancelled",
        description: `Appointment for ${customer.customerName} has been cancelled.`,
        variant: "destructive",
      });
      if (onCancel) {
        onCancel(customer.id);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!customer) return;
    if (!window.confirm(`Are you sure you want to delete this appointment? This action cannot be undone.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const appointmentId = typeof customer.id === "string" ? parseInt(customer.id, 10) : customer.id;
      await deleteAdminAppointment(appointmentId);
      toast({
        title: "Appointment Deleted",
        description: `Appointment for ${customer.customerName} has been permanently deleted.`,
      });
      if (onDelete) {
        onDelete(customer.id);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete appointment";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {loadingDetails ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading appointment details...</p>
          </div>
        ) : (
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
                  <p className="font-medium">{customer.dateDisplay || customer.date}</p>
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
                  <div>
                    <p className="font-medium">
                      {fullAppointment 
                        ? (fullAppointment.service_name && fullAppointment.service_description
                            ? `${fullAppointment.service_name} - ${fullAppointment.service_description}`
                            : fullAppointment.service_description)
                        : customer.service}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Staff Member</p>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">{fullAppointment?.staff_name || customer.staff}</p>
                </div>
              </div>
              {(fullAppointment?.price_cents !== undefined || customer.price_cents !== undefined) && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium text-primary">
                    {new Intl.NumberFormat("en-UG", {
                      style: "currency",
                      currency: fullAppointment?.currency || customer.currency || "UGX",
                      minimumFractionDigits: 0,
                    }).format(fullAppointment?.price_cents || customer.price_cents || 0)}
                  </p>
                </div>
              )}
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
        )}

        {/* Action buttons */}
        <DialogFooter className="mt-6 gap-2 sm:gap-0 flex flex-col sm:flex-row justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (customer && onEdit) {
                onEdit(customer);
                onOpenChange(false);
              }
            }}
            disabled={isLoading || loadingDetails}
            className="flex-1 sm:flex-initial"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          {customer.status === "pending" && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading || loadingDetails}
                className="text-destructive hover:text-destructive flex-1 sm:flex-initial"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleConfirm}
                disabled={isLoading || loadingDetails}
                className="flex-1 sm:flex-initial"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm
              </Button>
            </div>
          )}
          {customer.status !== "pending" && (
            <Button 
              variant="ghost" 
              onClick={handleDelete}
              disabled={isLoading || loadingDetails}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </DialogFooter>
        {}
      </DialogContent>
    </Dialog>
  );
}
