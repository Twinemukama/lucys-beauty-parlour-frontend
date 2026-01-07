import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Clock, Users, Plus, Search, Filter, LogOut, ImagePlus, Key, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";
import { AppointmentList } from "@/components/admin/AppointmentList";
import { BookingDialog } from "@/components/BookingDialog";
import { AddPortfolioDialog } from "@/components/admin/AddPortfolioDialog";
import { CustomerDetailsDialog } from "@/components/admin/CustomerDetailsDialog";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import { MenuItemsManager } from "@/components/admin/MenuItemsManager";
import { clearAdminAccessToken, getAdminAccessToken, listAdminAppointments, type AppointmentDto } from "@/apis/bookings";

interface CalendarAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  service_id: number;
  time: string;
  status: string;
  staff: string;
  date: Date;
  price_cents?: number;
  currency?: string;
}

interface CustomerDetails {
  id: string;
  date: string;
  dateDisplay: string;
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [customerDetailsOpen, setCustomerDetailsOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

	const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
	const [appointmentsLoading, setAppointmentsLoading] = useState(false);
	const [appointmentsError, setAppointmentsError] = useState<string | null>(null);

  const handleViewCalendarAppointment = (appointment: CalendarAppointment) => {
    // Format date as YYYY-MM-DD from local date (avoid UTC conversion)
    const year = appointment.date.getFullYear();
    const month = String(appointment.date.getMonth() + 1).padStart(2, '0');
    const day = String(appointment.date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const customerDetails: CustomerDetails = {
      id: appointment.id,
      date: dateStr,
      dateDisplay: appointment.date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: appointment.time,
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      customerPhone: appointment.customerPhone,
      service: appointment.service,
      service_id: appointment.service_id,
      staff: appointment.staff,
      status: appointment.status,
      notes: "",
      price_cents: appointment.price_cents,
      currency: appointment.currency,
    };
    setSelectedCustomer(customerDetails);
    setCustomerDetailsOpen(true);
  };

  // Check authentication - redirect to login if not authenticated
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    const token = getAdminAccessToken();
    if (!isAuth || !token) {
      navigate("/admin/login");
    return;
    }

    let cancelled = false;
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    listAdminAppointments()
      .then((data) => {
        if (cancelled) return;
        setAppointments(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to load appointments";
        setAppointmentsError(message);
        setAppointments([]);
      })
      .finally(() => {
        if (cancelled) return;
        setAppointmentsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
		clearAdminAccessToken();
    navigate("/admin/login");
  };

  const refreshAppointments = () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    listAdminAppointments()
      .then((data) => {
        setAppointments(data);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load appointments";
        setAppointmentsError(message);
      })
      .finally(() => {
        setAppointmentsLoading(false);
      });
  };

  const handleAppointmentConfirmed = () => {
    refreshAppointments();
  };

  const handleAppointmentCancelled = () => {
    refreshAppointments();
  };

  const handleAppointmentDeleted = () => {
    refreshAppointments();
  };

  const handleBookingDialogClose = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      // Refresh appointments when booking dialog closes
      refreshAppointments();
    }
  };

  // appointment stats
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const todaysAppointments = appointments.filter(apt => apt.date === todayStr).length;
  const todaysConfirmedAppointments = appointments.filter(apt => apt.date === todayStr && apt.status === "confirmed").length;
  const pendingAppointments = appointments.filter(apt => apt.status === "pending").length;
  const totalAppointments = appointments.length;

  const stats = [
    { label: "Today's Appointments", value: todaysAppointments.toString(), icon: CalendarIcon, color: "text-primary" },
    { label: "Today's Confirmed", value: todaysConfirmedAppointments.toString(), icon: CheckCircle, color: "text-primary" },
    { label: "Pending Confirmations", value: pendingAppointments.toString(), icon: Clock, color: "text-accent" },
    { label: "Total Appointments", value: totalAppointments.toString(), icon: Users, color: "text-rose-gold" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-playfair font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Lucy's Beauty Parlour</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Appointment
              </Button>
              <Button variant="secondary" onClick={() => setPortfolioDialogOpen(true)} className="gap-2">
                <ImagePlus className="h-4 w-4" />
                Add Portfolio
              </Button>
              <Button variant="ghost" onClick={() => setChangePasswordOpen(true)} className="gap-2">
                <Key className="h-4 w-4" />
                Change Password
              </Button>
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="shadow-soft hover:shadow-elegant transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-playfair">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Tabs */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="menu">Menu Items</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="font-playfair">Appointment Calendar</CardTitle>
                <CardDescription>View and manage appointments by date</CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentCalendar 
                  selectedDate={selectedDate} 
                  onSelectDate={setSelectedDate}
                  onViewAppointment={handleViewCalendarAppointment}
					appointments={appointments}
					loading={appointmentsLoading}
					error={appointmentsError}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="font-playfair">All Appointments</CardTitle>
                <CardDescription>Manage and update appointment details</CardDescription>
              </CardHeader>
              <CardContent>
				<AppointmentList 
					searchQuery={searchQuery}
					appointments={appointments}
					loading={appointmentsLoading}
					error={appointmentsError}
				/>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="font-playfair">Pricing Menu Items</CardTitle>
                <CardDescription>Create, update, and delete services shown on the public menu</CardDescription>
              </CardHeader>
              <CardContent>
                <MenuItemsManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Appointment Dialog */}
      <BookingDialog
        open={addDialogOpen}
        onOpenChange={handleBookingDialogClose}
        isAdmin
      />
      
      {/* Add Portfolio Dialog */}
      <AddPortfolioDialog open={portfolioDialogOpen} onOpenChange={setPortfolioDialogOpen} />

      {/* Customer Details Dialog */}
      <CustomerDetailsDialog 
        open={customerDetailsOpen} 
        onOpenChange={setCustomerDetailsOpen} 
        customer={selectedCustomer}
        onConfirm={handleAppointmentConfirmed}
        onCancel={handleAppointmentCancelled}
        onDelete={handleAppointmentDeleted}
      />

      {/* Change Password Dialog */}
      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
    </div>
  );
};

export default AdminDashboard;
