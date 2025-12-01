import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Users, Plus, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCalendar } from "@/components/admin/AppointmentCalendar";
import { AppointmentList } from "@/components/admin/AppointmentList";
import { AddAppointmentDialog } from "@/components/admin/AddAppointmentDialog";

const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock stats data
  const stats = [
    { label: "Today's Appointments", value: "12", icon: CalendarIcon, color: "text-primary" },
    { label: "Pending Confirmations", value: "5", icon: Clock, color: "text-accent" },
    { label: "Total Customers", value: "248", icon: Users, color: "text-rose-gold" },
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
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Appointment
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
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
                <AppointmentList searchQuery={searchQuery} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Appointment Dialog */}
      <AddAppointmentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
};

export default AdminDashboard;
