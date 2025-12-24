import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react";
import { toast } from "sonner";

const Professionals = () => {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", specialty: "" });

  useEffect(() => { if (user) fetchProfessionals(); }, [user]);

  const fetchProfessionals = async () => {
    const { data } = await supabase.from("professionals").select("*").order("name");
    setProfessionals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const { error } = await supabase.from("professionals").update(form).eq("id", editing.id);
      if (error) { toast.error("Error al actualizar"); return; }
      toast.success("Profesional actualizado");
    } else {
      const { error } = await supabase.from("professionals").insert({ ...form, user_id: user!.id });
      if (error) { toast.error("Error al crear"); return; }
      toast.success("Profesional creado");
    }
    setOpen(false); setEditing(null); setForm({ name: "", specialty: "" }); fetchProfessionals();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este profesional?")) {
      const { error } = await supabase.from("professionals").delete().eq("id", id);
      if (error) { toast.error("Error al eliminar"); return; }
      toast.success("Profesional eliminado"); fetchProfessionals();
    }
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Profesionales</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", specialty: "" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nuevo Profesional</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Profesional</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>Especialidad *</Label><Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="ej: Peluquería, Estética" required /></div>
                <Button type="submit" className="w-full btn-primary-gradient">{editing ? "Guardar" : "Crear"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {professionals.map(pro => (
            <Card key={pro.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-lg">{pro.name}</p>
                      <p className="text-sm text-muted-foreground">{pro.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(pro); setForm({ name: pro.name, specialty: pro.specialty }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pro.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {professionals.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-full">No hay profesionales</p>}
        </div>
      </div>
    </Sidebar>
  );
};
export default Professionals;