import { useState } from "react";
import { useProfessionals, useProfessionalMutations, type Professional } from "@/hooks/useProfessionals";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, UserCircle } from "lucide-react";

const PRESET_COLORS = [
  "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
  "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#84CC16"
];

const Professionals = () => {
  const { data: professionals = [], isLoading } = useProfessionals();
  const { createProfessional, updateProfessional, deleteProfessional } = useProfessionalMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", color: "#8B5CF6" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await updateProfessional.mutateAsync({ id: editing.id, ...form });
    } else {
      await createProfessional.mutateAsync(form);
    }
    setOpen(false); setEditing(null); setForm({ name: "", specialty: "", color: "#8B5CF6" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este profesional?")) {
      await deleteProfessional.mutateAsync(id);
    }
  };

  return (
    <Sidebar>
      <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-display font-semibold">Profesionales</h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditing(null); setForm({ name: "", specialty: "", color: "#8B5CF6" }); } }}>
            <DialogTrigger asChild><Button className="btn-primary-gradient gap-2"><Plus className="w-4 h-4" />Nuevo Profesional</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Editar" : "Nuevo"} Profesional</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Nombre *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                <div><Label>Especialidad *</Label><Input value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})} placeholder="ej: Peluquería, Estética" required /></div>
                <div>
                  <Label>Color identificativo</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2 mt-1">
                        <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: form.color }} />
                        <span>{form.color}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <div className="grid grid-cols-5 gap-2">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setForm({...form, color})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${form.color === color ? 'border-foreground ring-2 ring-primary' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button type="submit" className="w-full btn-primary-gradient" disabled={createProfessional.isPending || updateProfessional.isPending}>
                  {editing ? "Guardar" : "Crear"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p className="text-center text-muted-foreground py-8 col-span-full">Cargando...</p>}
          {professionals.map(pro => (
            <Card key={pro.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: (pro.color || "#8B5CF6") + "20" }}
                    >
                      <UserCircle className="w-6 h-6" style={{ color: pro.color || "#8B5CF6" }} />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-lg">{pro.name}</p>
                      <p className="text-sm text-muted-foreground">{pro.specialty}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(pro); setForm({ name: pro.name, specialty: pro.specialty, color: pro.color || "#8B5CF6" }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(pro.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && professionals.length === 0 && <p className="text-center text-muted-foreground py-8 col-span-full">No hay profesionales</p>}
        </div>
      </div>
    </Sidebar>
  );
};
export default Professionals;
