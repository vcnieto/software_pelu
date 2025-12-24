import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Scissors,
  CalendarDays,
  Plus,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  duration: number;
  notes: string | null;
  status: string;
  clients: { name: string } | null;
  services: { name: string; price: number } | null;
}

interface Stats {
  totalClients: number;
  totalServices: number;
  todayAppointments: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    totalServices: 0,
    todayAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch today's appointments
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
          services (name, price)
        `)
        .eq("date", today)
        .order("start_time", { ascending: true });

      setTodayAppointments(appointments || []);

      // Fetch stats
      const [clientsResult, servicesResult] = await Promise.all([
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalClients: clientsResult.count || 0,
        totalServices: servicesResult.count || 0,
        todayAppointments: appointments?.length || 0,
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

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-semibold text-foreground">
              Panel Principal
            </h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <Link to="/citas">
            <Button className="btn-primary-gradient gap-2">
              <Plus className="w-4 h-4" />
              Nueva Cita
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{stats.totalClients}</p>
                  <p className="text-sm text-muted-foreground">Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{stats.totalServices}</p>
                  <p className="text-sm text-muted-foreground">Servicios</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stat-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-semibold">{stats.todayAppointments}</p>
                  <p className="text-sm text-muted-foreground">Citas hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-display">Citas de Hoy</CardTitle>
            <Link to="/calendario">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-primary">
                Ver calendario
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Cargando...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-muted-foreground">No hay citas programadas para hoy</p>
                <Link to="/citas">
                  <Button variant="outline" className="mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Agendar cita
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((appointment, index) => (
                  <div
                    key={appointment.id}
                    className="appointment-block appointment-scheduled animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            {formatTime(appointment.start_time)} - {getEndTime(appointment.start_time, appointment.duration)}
                          </span>
                        </div>
                        <p className="font-display text-lg font-medium">
                          {appointment.clients?.name || "Cliente eliminado"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.services?.name || "Servicio no disponible"}
                        </p>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-1 italic">
                            "{appointment.notes}"
                          </p>
                        )}
                      </div>
                      {appointment.services?.price && (
                        <div className="text-right">
                          <span className="font-display font-semibold text-primary">
                            {appointment.services.price.toFixed(2)}€
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to="/clientes">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Clientes</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/servicios">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Scissors className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Servicios</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/citas">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 text-center">
                <CalendarDays className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Citas</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/calendario">
            <Card className="card-hover cursor-pointer group">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="font-medium text-sm">Calendario</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </Sidebar>
  );
};

export default Dashboard;