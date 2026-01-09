import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Scissors, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Appointment {
  id: string;
  date: string;
  start_time: string;
  duration: number;
  notes: string | null;
  status: string | null;
  service: {
    id: string;
    name: string;
    price: number;
  } | null;
  professional: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface ClientAppointmentsHistoryProps {
  clientId: string;
}

export const ClientAppointmentsHistory = ({ clientId }: ClientAppointmentsHistoryProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [clientId]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        date,
        start_time,
        duration,
        notes,
        status,
        service:service_id (id, name, price),
        professional:professional_id (id, name, color)
      `)
      .eq("client_id", clientId)
      .order("date", { ascending: false })
      .order("start_time", { ascending: false });

    if (!error && data) {
      setAppointments(data as unknown as Appointment[]);
    }
    setLoading(false);
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completada</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelada</Badge>;
      case "no-show":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">No asistió</Badge>;
      default:
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Programada</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Historial de Citas
        </h3>
        <Badge variant="outline">{appointments.length} citas</Badge>
      </div>

      {appointments.length === 0 ? (
        <p className="text-sm text-muted-foreground italic py-4 text-center">
          Este cliente no tiene citas registradas
        </p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setSelectedAppointment(appointment)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {format(new Date(appointment.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(appointment.start_time)} ({appointment.duration} min)
                      </span>
                      {appointment.service && (
                        <span className="flex items-center gap-1">
                          <Scissors className="w-3 h-3" />
                          {appointment.service.name}
                        </span>
                      )}
                      {appointment.professional && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {appointment.professional.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de la Cita</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedAppointment.status)}
              </div>
              
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {format(new Date(selectedAppointment.date), "EEEE, d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hora y duración</p>
                    <p className="font-medium">
                      {formatTime(selectedAppointment.start_time)} - {selectedAppointment.duration} minutos
                    </p>
                  </div>
                </div>

                {selectedAppointment.service && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scissors className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Servicio</p>
                      <p className="font-medium">
                        {selectedAppointment.service.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.service.price.toFixed(2)} €
                      </p>
                    </div>
                  </div>
                )}

                {selectedAppointment.professional && (
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: selectedAppointment.professional.color + "20" }}
                    >
                      <User className="w-5 h-5" style={{ color: selectedAppointment.professional.color }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profesional</p>
                      <p className="font-medium">{selectedAppointment.professional.name}</p>
                    </div>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Notas</p>
                      <p className="text-sm">{selectedAppointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientAppointmentsHistory;
