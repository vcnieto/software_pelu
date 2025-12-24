import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, Calendar, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ client_id: "", service_id: "", professional_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" });

  useEffect(() => { if (user) { fetchAppointments(); fetchClients(); fetchServices(); fetchProfessionals(); } }, [user]);

  const fetchAppointments = async () => {
    const { data } = await supabase.from("appointments").select("*, clients(name), services(name, duration, price), professionals(name, specialty)").order("date", { ascending: false }).order("start_time");
    setAppointments(data || []);
  };
  const fetchClients = async () => { const { data } = await supabase.from("clients").select("*").order("name"); setClients(data || []); };
  const fetchServices = async () => { const { data } = await supabase.from("services").select("*").order("name"); setServices(data || []); };
  const fetchProfessionals = async () => { const { data } = await supabase.from("professionals").select("*").order("name"); setProfessionals(data || []); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === form.service_id);
    const payload = { 
      client_id: form.client_id, 
      service_id: form.service_id, 
      professional_id: form.professional_id,
      date: form.date, 
      start_time: form.start_time, 
      duration: service?.duration || 30, 
      notes: form.notes || null 
    };
    
    if (editing) {
      const { error } = await supabase.from("appointments").update(payload).eq("id", editing.id);
      if (error) {
        if (error.message.includes("ya tiene una cita")) {
          toast.error("El profesional ya tiene una cita en ese horario");
        } else {
          toast.error("Error al actualizar la cita");
        }
        return;
      }
      toast.success("Cita actualizada");
    } else {
      const { error } = await supabase.from("appointments").insert({ ...payload, user_id: user!.id });
      if (error) {
        if (error.message.includes("ya tiene una cita")) {
          toast.error("El profesional ya tiene una cita en ese horario");
        } else {
          toast.error("Error al crear la cita");
        }
        return;
      }
      toast.success("Cita creada");
    }
    setOpen(false); setEditing(null); setForm({ client_id: "", service_id: "", professional_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" }); fetchAppointments();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta cita?")) { await supabase.from("appointments").delete().eq("id", id); toast.success("Cita eliminada"); fetchAppointments(); }
  };

  const calculateEndTime = () => {
    const service = services.find(s => s.id === form.service_id);
    if (!service || !form.start_time) return null;
    const [hours, minutes] = form.start_time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`;
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Citas</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ client_id: "", service_id: "", professional_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nueva Cita</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} Cita</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Cliente *</Label><Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}><SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Servicio *</Label><Select value={form.service_id} onValueChange={v => setForm({...form, service_id: v})}><SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration} min - {s.price}€)</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Profesional *</Label><Select value={form.professional_id} onValueChange={v => setForm({...form, professional_id: v})}><SelectTrigger><SelectValue placeholder="Seleccionar profesional" /></SelectTrigger><SelectContent>{professionals.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.specialty})</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                  <div><Label>Hora inicio *</Label><Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required /></div>
                </div>
                {form.service_id && form.start_time && (
                  <div className="p-3 rounded-lg bg-muted text-sm">
                    <span className="text-muted-foreground">Duración: </span>
                    <span className="font-medium">{services.find(s => s.id === form.service_id)?.duration} min</span>
                    <span className="text-muted-foreground"> • Finaliza: </span>
                    <span className="font-medium">{calculateEndTime()}</span>
                  </div>
                )}
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full btn-primary-gradient" disabled={!form.client_id || !form.service_id || !form.professional_id}>{editing ? "Guardar" : "Crear"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="space-y-3">
          {appointments.map(apt => (
            <Card key={apt.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-lg">{apt.clients?.name}</p>
                  <p className="text-sm text-muted-foreground">{apt.services?.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(apt.date), "d MMM yyyy", { locale: es })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{apt.start_time.slice(0, 5)}</span>
                    {apt.professionals && <span className="flex items-center gap-1"><UserCircle className="w-4 h-4" />{apt.professionals.name}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(apt); setForm({ client_id: apt.client_id, service_id: apt.service_id, professional_id: apt.professional_id || "", date: apt.date, start_time: apt.start_time, notes: apt.notes || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(apt.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {appointments.length === 0 && <p className="text-center text-muted-foreground py-8">No hay citas</p>}
        </div>
      </div>
    </Sidebar>
  );
};
export default Appointments;