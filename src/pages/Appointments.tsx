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
import { Plus, Pencil, Trash2, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ client_id: "", service_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" });

  useEffect(() => { if (user) { fetchAppointments(); fetchClients(); fetchServices(); } }, [user]);

  const fetchAppointments = async () => {
    const { data } = await supabase.from("appointments").select("*, clients(name), services(name, duration, price)").order("date", { ascending: false }).order("start_time");
    setAppointments(data || []);
  };
  const fetchClients = async () => { const { data } = await supabase.from("clients").select("*").order("name"); setClients(data || []); };
  const fetchServices = async () => { const { data } = await supabase.from("services").select("*").order("name"); setServices(data || []); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const service = services.find(s => s.id === form.service_id);
    const payload = { client_id: form.client_id, service_id: form.service_id, date: form.date, start_time: form.start_time, duration: service?.duration || 30, notes: form.notes || null };
    if (editing) {
      await supabase.from("appointments").update(payload).eq("id", editing.id);
      toast.success("Cita actualizada");
    } else {
      await supabase.from("appointments").insert({ ...payload, user_id: user!.id });
      toast.success("Cita creada");
    }
    setOpen(false); setEditing(null); setForm({ client_id: "", service_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" }); fetchAppointments();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar esta cita?")) { await supabase.from("appointments").delete().eq("id", id); toast.success("Cita eliminada"); fetchAppointments(); }
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Citas</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ client_id: "", service_id: "", date: format(new Date(), "yyyy-MM-dd"), start_time: "09:00", notes: "" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nueva Cita</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nueva"} Cita</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Cliente *</Label><Select value={form.client_id} onValueChange={v => setForm({...form, client_id: v})}><SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger><SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>Servicio *</Label><Select value={form.service_id} onValueChange={v => setForm({...form, service_id: v})}><SelectTrigger><SelectValue placeholder="Seleccionar servicio" /></SelectTrigger><SelectContent>{services.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration} min - {s.price}€)</SelectItem>)}</SelectContent></Select></div>
                <div className="grid grid-cols-2 gap-4"><div><Label>Fecha *</Label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required /></div><div><Label>Hora *</Label><Input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} required /></div></div>
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full btn-primary-gradient" disabled={!form.client_id || !form.service_id}>{editing ? "Guardar" : "Crear"}</Button>
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
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(apt.date), "d MMM yyyy", { locale: es })}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{apt.start_time.slice(0, 5)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(apt); setForm({ client_id: apt.client_id, service_id: apt.service_id, date: apt.date, start_time: apt.start_time, notes: apt.notes || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
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