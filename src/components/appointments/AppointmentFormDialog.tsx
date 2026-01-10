import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Clock, User, Scissors, Check, Search, X } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AppointmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: Date;
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
  onSuccess 
}: AppointmentFormDialogProps) => {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  
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
        start_time: "",
        notes: ""
      });
      setClientSearch("");
      setClientDropdownOpen(false);
      fetchData();
    }
  }, [open, initialDate]);

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
      supabase.from("professionals").select("id, name, specialty, color, working_hours").order("name")
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

  // Get working hours for the selected professional and date
  const getWorkingHours = () => {
    if (!form.professional_id || !form.date) return null;
    const professional = professionals.find(p => String(p.id) === form.professional_id);
    if (!professional?.working_hours) return null;
    
    const selectedDate = new Date(form.date + "T12:00:00");
    const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const dayHours = professional.working_hours[String(dayOfWeek)];
    return dayHours || null; // null means closed
  };

  // Generate available time slots
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const selectedService = services.find(s => String(s.id) === form.service_id);
    const serviceDuration = selectedService?.duration || 30;
    
    const workingHours = getWorkingHours();
    
    // If professional is closed on this day, return empty slots
    if (!workingHours && form.professional_id && form.date) {
      return [];
    }
    
    // Parse working hours
    let workStart = 6 * 60; // Default 6:00
    let workEnd = 22 * 60;  // Default 22:00
    
    if (workingHours) {
      const [startH, startM] = workingHours.start.split(":").map(Number);
      const [endH, endM] = workingHours.end.split(":").map(Number);
      workStart = startH * 60 + startM;
      workEnd = endH * 60 + endM;
    }
    
    // Generate slots only within working hours
    for (let minutes = workStart; minutes < workEnd; minutes += 15) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const slotStart = minutes;
      const slotEnd = slotStart + serviceDuration;
      
      // Skip if service would end after working hours
      if (slotEnd > workEnd) {
        continue;
      }
      
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
      
      slots.push({ time, available });
    }
    
    return slots;
  }, [form.service_id, form.professional_id, form.date, existingAppointments, services, professionals]);

  const calculateEndTime = () => {
    const service = services.find(s => String(s.id) === form.service_id);
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

  const selectedService = services.find(s => String(s.id) === form.service_id);
  const selectedProfessional = professionals.find(p => String(p.id) === form.professional_id);
  const selectedClient = clients.find(c => String(c.id) === form.client_id);

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const searchLower = clientSearch.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.phone?.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower)
    );
  }, [clients, clientSearch]);

  // Only show available slots when filtering.
  const filteredSlots = timeSlots.filter(s => s.available);
  const availableSlots = filteredSlots.length > 0 ? filteredSlots : timeSlots;
  const showTimeSelector = form.professional_id && form.service_id && form.date;
  const workingHours = getWorkingHours();
  const isClosed = form.professional_id && form.date && !workingHours;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-visible flex flex-col bg-[#fffaf7]">
        <DialogHeader className="pb-2 border-b border-border/40">
          <DialogTitle className="text-xl font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Nueva Cita
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-visible flex flex-col gap-4 pt-4">
          {/* Client Selection with Search */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Cliente *
            </Label>
            <Popover open={clientDropdownOpen} onOpenChange={setClientDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientDropdownOpen}
                  className={cn(
                    "w-full justify-between font-normal",
                    !form.client_id && "text-muted-foreground"
                  )}
                >
                  {selectedClient ? selectedClient.name : "Seleccionar cliente"}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <input
                    className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="Buscar por nombre, teléfono o email..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                  {clientSearch && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setClientSearch("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <div className="max-h-[200px] overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No se encontraron clientes
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent transition-colors",
                          form.client_id === String(client.id) && "bg-accent"
                        )}
                        onClick={() => {
                          setForm({ ...form, client_id: String(client.id) });
                          setClientDropdownOpen(false);
                          setClientSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "h-4 w-4",
                            form.client_id === String(client.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{client.name}</p>
                          {(client.phone || client.email) && (
                            <p className="text-xs text-muted-foreground truncate">
                              {client.phone || client.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Service Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Servicio *
            </Label>
            <Select value={form.service_id || undefined} onValueChange={v => setForm({ ...form, service_id: v, start_time: "" })}>
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/40">
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {services.map(s => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.name} ({s.duration} min - {s.price}€)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Professional Selection */}
          <div className="space-y-2">
            <Label>Profesional *</Label>
            <Select value={form.professional_id || undefined} onValueChange={v => setForm({ ...form, professional_id: v, start_time: "" })}>
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/40">
                <SelectValue placeholder="Seleccionar profesional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map(p => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name} ({p.specialty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date & Time Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Fecha *
              </Label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value, start_time: "" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary/40"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Hora inicio *
                {selectedService && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({selectedService.duration} min)
                  </span>
                )}
              </Label>
              {isClosed ? (
                <div className="flex h-10 w-full rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive items-center">
                  Cerrado este día
                </div>
              ) : (
                <Select
                  value={form.start_time || undefined}
                  onValueChange={v => setForm({ ...form, start_time: v })}
                  disabled={!showTimeSelector || availableSlots.length === 0}
                >
                  <SelectTrigger className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/40">
                    <SelectValue placeholder={
                      !showTimeSelector
                        ? "Selecciona servicio y profesional"
                        : availableSlots.length === 0
                        ? "Sin disponibilidad"
                        : "Seleccionar hora"
                    } />
                  </SelectTrigger>
                  {showTimeSelector && availableSlots.length > 0 && (
                    <SelectContent>
                      {availableSlots.map(slot => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  )}
                </Select>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2 shrink-0">
            <Label className="text-sm text-muted-foreground">Notas (opcional)</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Añadir notas sobre la cita..."
              className="resize-none h-16 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary/40"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full btn-primary-gradient shrink-0"
              disabled={!form.client_id || !form.service_id || !form.professional_id || !form.start_time || loading}
            >
              {loading ? "Creando..." : "Crear Cita"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentFormDialog;
