import { useState } from "react";
import { useServices, useServiceMutations } from "@/hooks/useServices";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Clock, Euro } from "lucide-react";
import type { Service } from "@/hooks/useServices";

const Services = () => {
  const { data: services = [], isLoading } = useServices();
  const { createService, updateService, deleteService } = useServiceMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", duration: "30", price: "0" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, duration: parseInt(form.duration), price: parseFloat(form.price) };
    if (editing) {
      await updateService.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createService.mutateAsync(payload);
    }
    setOpen(false); setEditing(null); setForm({ name: "", duration: "30", price: "0" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este servicio?")) {
      await deleteService.mutateAsync(id);
    }
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Servicios</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", duration: "30", price: "0" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nuevo Servicio</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Servicio</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>Duración (minutos) *</Label><Input type="number" min="5" value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} required /></div>
                <div><Label>Precio (€) *</Label><Input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
                <Button type="submit" className="w-full btn-primary-gradient" disabled={createService.isPending || updateService.isPending}>
                  {editing ? "Guardar" : "Añadir"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-center text-muted-foreground py-8 col-span-full">Cargando...</p>}
          {services.map(service => (
            <Card key={service.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="font-display font-semibold text-lg">{service.name}</p>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditing(service); setForm({ name: service.name, duration: service.duration.toString(), price: service.price.toString() }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(service.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-4 h-4" />{service.duration} min</span>
                  <span className="flex items-center gap-1 font-medium text-primary"><Euro className="w-4 h-4" />{service.price.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && services.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-full">No hay servicios</p>}
        </div>
      </div>
    </Sidebar>
  );
};
export default Services;
