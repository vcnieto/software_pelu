import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Phone, Mail, Search } from "lucide-react";
import { toast } from "sonner";

interface Client { id: string; name: string; phone: string | null; email: string | null; notes: string | null; }

const Clients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "" });

  useEffect(() => { if (user) fetchClients(); }, [user]);

  const fetchClients = async () => {
    const { data } = await supabase.from("clients").select("*").order("name");
    setClients(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await supabase.from("clients").update({ name: form.name, phone: form.phone || null, email: form.email || null, notes: form.notes || null }).eq("id", editing.id);
      toast.success("Cliente actualizado");
    } else {
      await supabase.from("clients").insert({ user_id: user!.id, name: form.name, phone: form.phone || null, email: form.email || null, notes: form.notes || null });
      toast.success("Cliente añadido");
    }
    setOpen(false); setEditing(null); setForm({ name: "", phone: "", email: "", notes: "" }); fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este cliente?")) {
      await supabase.from("clients").delete().eq("id", id);
      toast.success("Cliente eliminado"); fetchClients();
    }
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Clientes</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", phone: "", email: "", notes: "" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nuevo Cliente</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Cliente</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>Teléfono</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><Label>Notas</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
                <Button type="submit" className="w-full btn-primary-gradient">{editing ? "Guardar" : "Añadir"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input placeholder="Buscar cliente..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className="grid gap-4">
          {filtered.map(client => (
            <Card key={client.id} className="card-hover">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-display font-semibold text-lg">{client.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    {client.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{client.phone}</span>}
                    {client.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{client.email}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(client); setForm({ name: client.name, phone: client.phone || "", email: client.email || "", notes: client.notes || "" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(client.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No hay clientes</p>}
        </div>
      </div>
    </Sidebar>
  );
};
export default Clients;