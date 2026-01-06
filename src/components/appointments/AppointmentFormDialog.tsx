import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Clock, User, Scissors, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
  initialTime?: string;
  onSuccess?: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const AppointmentFormDialog = ({ 
  open, 
  onOpenChange, 
  initialDate, 
  initialTime,
  onSuccess 
}: AppointmentFormDialogProps) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    client_id: "",
    service_id: "",
    professional_id: "",
    date: format(new Date(), "yyyy-MM-dd"),
    start_time: "",
    notes: ""
  });

  // Reset form when dialog opens with initial values
  useEffect(() => {
    if (open) {
      setForm({
        client_id: "",
        service_id: "",
        professional_id: "",
        date: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        start_time: initialTime || "",
        notes: ""
      });
      fetchData();
    }
  }, [open, initialDate, initialTime]);

  // Fetch appointments when date or professional changes
  useEffect(() => {
    if (form.date && form.professional_id) {
      fetchExistingAppointments();
    }
  }, [form.date, form.professional_id]);

  const fetchData = async () => {
    const [clientsRes, servicesRes, professionalsRes] = await Promise.all([
      supabase.from("clients").select("*").order("name"),
      supabase.from("services").select("*").order("name"),
      supabase.from("professionals").select("*").order("name")
    ]);
    setClients(clientsRes.data || []);
    setServices(servicesRes.data || []);
    setProfessionals(professionalsRes.data || []);
  };

  const fetchExistingAppointments = async () => {
    const { data } = await supabase
      .from("appointments")
      .select("start_time, duration")
      .eq("date", form.date)
      .eq("professional_id", form.professional_id);
    setExistingAppointments(data || []);
  };

  // Generate available time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const selectedService = services.find(s => s.id === form.service_id);
    const serviceDuration = selectedService?.duration || 30;
    
    // Generate slots from 6:00 to 21:00
    for (let hour = 6; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        const slotStart = hour * 60 + minute;
        const slotEnd = slotStart + serviceDuration;
        
        // Check if this slot overlaps with any existing appointment
        let available = true;
        
        if (form.professional_id && existingAppointments.length > 0) {
          for (const apt of existingAppointments) {
            const [aptH, aptM] = apt.start_time.split(":").map(Number);
            const aptStart = aptH * 60 + aptM;
            const aptEnd = aptStart + apt.duration;
            
            // Check for overlap
            if (slotStart < aptEnd && slotEnd > aptStart) {
              available = false;
              break;
            }
          }
        }
        
        // Don't show slots that would end after 22:00
        if (slotEnd > 22 * 60) {
          available = false;
        }
        
        slots.push({ time, available });
      }
    }
    
    return slots;
  }, [form.service_id, form.professional_id, existingAppointments, services]);

  const calculateEndTime = () => {
    const service = services.find(s => s.id === form.service_id);
    if (!service || !form.start_time) return null;
    const [hours, minutes] = form.start_time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const service = services.find(s => s.id === form.service_id);
    const payload = {
      client_id: form.client_id,
      service_id: form.service_id,
      professional_id: form.professional_id,
      date: form.date,
      start_time: form.start_time,
      duration: service?.duration || 30,
      notes: form.notes || null,
      user_id: user!.id
    };

    const { error } = await supabase.from("appointments").insert(payload);
    
    if (error) {
      if (error.message.includes("ya tiene una cita")) {
        toast.error("El profesional ya tiene una cita en ese horario");
      } else {
        toast.error("Error al crear la cita");
      }
      setLoading(false);
      return;
    }
    
    toast.success("Cita creada correctamente");
    setLoading(false);
    onOpenChange(false);
    onSuccess?.();
  };

  const selectedService = services.find(s => s.id === form.service_id);
  const selectedProfessional = professionals.find(p => p.id === form.professional_id);

  // Only show available slots when filtering
  const availableSlots = timeSlots.filter(s => s.available);
  const showTimeSelector = form.professional_id && form.service_id && form.date;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Nueva Cita
          </DialogTitle>
          {initialDate && (
            <p className="text-sm text-muted-foreground">
              {format(initialDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              {initialTime && ` a las ${initialTime}`}
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente
            </Label>
            <Select value={form.client_id} onValueChange={v => setForm({ ...form, client_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Servicio
            </Label>
            <Select value={form.service_id} onValueChange={v => setForm({ ...form, service_id: v, start_time: "" })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.duration} min - {s.price}€)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional Selection */}
          <div className="space-y-2">
            <Label>Profesional</Label>
            <Select value={form.professional_id} onValueChange={v => setForm({ ...form, professional_id: v, start_time: "" })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.specialty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date (hidden if passed from calendar, shown if opened from button) */}
          {!initialDate && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha
              </Label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value, start_time: "" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Time Slot Selection - Visual Grid */}
          {showTimeSelector && (
            <div className="space-y-2 flex-1 overflow-hidden flex flex-col min-h-0">
              <Label className="flex items-center gap-2 shrink-0">
                <Clock className="w-4 h-4" />
                Hora disponible
                {selectedService && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({selectedService.duration} min)
                  </span>
                )}
              </Label>
              
              {availableSlots.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground bg-muted/50 rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay horas disponibles para este día</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 border rounded-lg p-3">
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map(slot => (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={form.start_time === slot.time ? "default" : "outline"}
                        size="sm"
                        className={cn(
                          "h-9 text-xs font-medium transition-all",
                          form.start_time === slot.time && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => setForm({ ...form, start_time: slot.time })}
                      >
                        {form.start_time === slot.time && (
                          <Check className="w-3 h-3 mr-1" />
                        )}
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Summary */}
          {form.service_id && form.start_time && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Duración:</span>
                <span className="font-medium">{selectedService?.duration} min</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-muted-foreground">Horario:</span>
                <span className="font-medium">{form.start_time} - {calculateEndTime()}</span>
              </div>
              {selectedProfessional && (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-muted-foreground">Profesional:</span>
                  <span className="font-medium">{selectedProfessional.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2 shrink-0">
            <Label>Notas (opcional)</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Añadir notas sobre la cita..."
              className="resize-none h-16"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full btn-primary-gradient shrink-0"
            disabled={!form.client_id || !form.service_id || !form.professional_id || !form.start_time || loading}
          >
            {loading ? "Creando..." : "Crear Cita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
