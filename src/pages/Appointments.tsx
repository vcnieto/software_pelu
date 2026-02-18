import { useState, useMemo } from "react";
import { useAppointments, useInvalidateAppointments, type AppointmentWithRelations } from "@/hooks/useAppointments";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Clock, Calendar, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import AppointmentFormDialog from "@/components/appointments/AppointmentFormDialog";

const Appointments = () => {
  const [formOpen, setFormOpen] = useState(false);
  const invalidateAppointments = useInvalidateAppointments();

  // Only load last 60 days of appointments
  const dateFrom = useMemo(() => format(subDays(new Date(), 60), "yyyy-MM-dd"), []);
  const { data: appointments = [], isLoading } = useAppointments({ dateFrom });

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta cita?")) {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) { toast.error("Error al eliminar la cita"); return; }
      toast.success("Cita eliminada");
      invalidateAppointments();
    }
  };

  const getEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Citas</h1>
          <Button 
            className="btn-primary-gradient gap-2"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          )}
          {appointments.map(apt => (
            <Card key={apt.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-lg">{apt.clients?.name}</p>
                  <p className="text-sm text-muted-foreground">{apt.services?.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(apt.date + "T00:00:00"), "d MMM yyyy", { locale: es })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {apt.start_time.slice(0, 5)} - {getEndTime(apt.start_time, apt.duration)}
                    </span>
                    {apt.professionals && (
                      <span className="flex items-center gap-1">
                        <UserCircle className="w-4 h-4" />
                        {apt.professionals.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(apt.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && appointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No hay citas</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setFormOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear primera cita
              </Button>
            </div>
          )}
        </div>
      </div>

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={invalidateAppointments}
      />
    </Sidebar>
  );
};

export default Appointments;
