import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Scissors,
  CalendarDays,
  Plus,
  Clock,
  ArrowRight,
  TrendingUp,
  UserCircle,
  Euro,
  Sparkles,
} from "lucide-react";
import { format, isToday, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import AppointmentFormDialog from "@/components/appointments/AppointmentFormDialog";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  duration: number;
  notes: string | null;
  status: string;
  clients: { name: string } | null;
  services: { name: string; price: number } | null;
  professionals: { name: string; color: string | null } | null;
}

interface Stats {
  totalClients: number;
  totalServices: number;
  todayAppointments: number;
  weekAppointments: number;
  todayRevenue: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalServices: 0,
    todayAppointments: 0,
    weekAppointments: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [openNewAppointment, setOpenNewAppointment] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: appointments } = await supabase
        .from("appointments")
        .select(`
          id,
          date,
          start_time,
          duration,
          notes,
          status,
          clients (name),
          services (name, price),
          professionals (name, color)
        `)
        .eq("date", today)
        .order("start_time", { ascending: true });

      setTodayAppointments(appointments || []);

      const [clientsResult, servicesResult, weekResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase
          .from("appointments")
          .select("id, services(price)")
          .gte("date", weekStart)
          .lte("date", weekEnd),
      ]);

      const todayRevenue = appointments?.reduce((sum, apt) => {
        return sum + (apt.services?.price || 0);
      }, 0) || 0;

      setStats({
        totalClients: clientsResult.count || 0,
        totalServices: servicesResult.count || 0,
        todayAppointments: appointments?.length || 0,
        weekAppointments: weekResult.data?.length || 0,
        todayRevenue,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return time.slice(0, 5);
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const endMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const getAppointmentStatus = (startTime: string, duration: number) => {
    const now = currentTime;
    const [hours, minutes] = startTime.split(":").map(Number);
    const appointmentStart = new Date();
    appointmentStart.setHours(hours, minutes, 0, 0);
    
    const appointmentEnd = new Date(appointmentStart);
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + duration);

    if (now >= appointmentStart && now <= appointmentEnd) {
      return "en-curso";
    } else if (now > appointmentEnd) {
      return "completada";
    }
    return "pendiente";
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const nextAppointment = todayAppointments.find((apt) => {
    const [hours, minutes] = apt.start_time.split(":").map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);
    return appointmentTime > currentTime;
  });

  return (
    <Sidebar>
      <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
        {/* Header con saludo y hora */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-display font-semibold text-foreground">
                  {getGreeting()}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {format(currentTime, "EEEE, d 'de' MMMM", { locale: es })} · {format(currentTime, "HH:mm")}
                </p>
              </div>
            </div>
          </div>
          <Button 
            className="btn-primary-gradient gap-2 shadow-lg hover:shadow-xl transition-all" 
            onClick={() => setOpenNewAppointment(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Button>
        </div>

        {/* Próxima cita destacada */}
        {nextAppointment && (
          <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border-primary/20 overflow-hidden">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Clock className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Próxima cita</p>
                    <p className="text-xl font-display font-semibold">
                      {nextAppointment.clients?.name || "Cliente"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(nextAppointment.start_time)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {nextAppointment.services?.name}
                      </span>
                    </div>
                  </div>
                </div>
                {nextAppointment.professionals && (
                  <div className="hidden sm:flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: nextAppointment.professionals.color || 'hsl(var(--primary))' }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {nextAppointment.professionals.name}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl lg:text-4xl font-display font-bold text-primary">
                    {stats.todayAppointments}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Citas hoy</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarDays className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                    {stats.weekAppointments}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Esta semana</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                    {stats.totalClients}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Clientes</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sage flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 lg:p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl lg:text-4xl font-display font-bold text-foreground">
                    {stats.todayRevenue.toFixed(0)}€
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Ingresos hoy</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Euro className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Citas de hoy - columna principal */}
          <Card className="lg:col-span-2 glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" />
                Agenda de hoy
              </CardTitle>
              <Link to="/calendario">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                  Ver todo
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : todayAppointments.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground mb-4">No hay citas programadas para hoy</p>
                  <Button 
                    variant="outline" 
                    className="gap-2" 
                    onClick={() => setOpenNewAppointment(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Agendar primera cita
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayAppointments.map((appointment, index) => {
                    const status = getAppointmentStatus(appointment.start_time, appointment.duration);
                    return (
                      <div
                        key={appointment.id}
                        className={`
                          rounded-xl p-3 lg:p-4 border-l-4 transition-all duration-200 
                          animate-slide-up hover:shadow-md
                          ${status === "en-curso" 
                            ? "bg-primary/10 border-l-primary" 
                            : status === "completada"
                            ? "bg-muted/50 border-l-muted-foreground/30"
                            : "bg-accent/30 border-l-accent-foreground/50"
                          }
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex flex-col items-center justify-center min-w-[52px]">
                              <span className="text-lg font-display font-bold text-foreground">
                                {formatTime(appointment.start_time)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {getEndTime(appointment.start_time, appointment.duration)}
                              </span>
                            </div>
                            <div className="h-10 w-px bg-border/50" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {appointment.clients?.name || "Cliente eliminado"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {appointment.services?.name || "Servicio no disponible"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {appointment.professionals && (
                              <div 
                                className="w-2.5 h-2.5 rounded-full hidden sm:block"
                                style={{ backgroundColor: appointment.professionals.color || 'hsl(var(--primary))' }}
                                title={appointment.professionals.name}
                              />
                            )}
                            {status === "en-curso" && (
                              <Badge className="bg-primary text-primary-foreground text-xs">
                                En curso
                              </Badge>
                            )}
                            {appointment.services?.price && (
                              <span className="font-display font-semibold text-primary whitespace-nowrap">
                                {appointment.services.price}€
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesos rápidos */}
          <div className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Accesos rápidos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <Link to="/clientes">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50">
                    <Users className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Clientes</span>
                  </Button>
                </Link>
                <Link to="/servicios">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50">
                    <Scissors className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Servicios</span>
                  </Button>
                </Link>
                <Link to="/profesionales">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50">
                    <UserCircle className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Equipo</span>
                  </Button>
                </Link>
                <Link to="/calendario">
                  <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/50">
                    <CalendarDays className="w-6 h-6 text-primary" />
                    <span className="text-sm font-medium">Calendario</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Resumen del día */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-display">Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Servicios activos</span>
                  <span className="font-medium">{stats.totalServices}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Citas completadas</span>
                  <span className="font-medium">
                    {todayAppointments.filter(apt => 
                      getAppointmentStatus(apt.start_time, apt.duration) === "completada"
                    ).length}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Citas pendientes</span>
                  <span className="font-medium">
                    {todayAppointments.filter(apt => 
                      getAppointmentStatus(apt.start_time, apt.duration) === "pendiente"
                    ).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AppointmentFormDialog
        open={openNewAppointment}
        onOpenChange={setOpenNewAppointment}
        onSuccess={fetchData}
      />
    </Sidebar>
  );
};

export default Dashboard;
