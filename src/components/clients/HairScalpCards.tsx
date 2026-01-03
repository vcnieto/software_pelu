import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface HairScalpCard {
  id: string;
  date: string;
  phone: string | null;
  email: string | null;
  hair_type: string | null;
  hair_type_other: string | null;
  hair_texture: string | null;
  hair_density: string | null;
  hair_porosity: string | null;
  hair_elasticity: string | null;
  natural_color: string | null;
  current_color: string | null;
  previous_treatments: string[] | null;
  previous_treatments_other: string | null;
  scalp_type: string | null;
  scalp_type_other: string | null;
  scalp_problems: string[] | null;
  scalp_problems_other: string | null;
  product_sensitivity: string | null;
  scalp_observations: string | null;
  wash_frequency: string | null;
  wash_frequency_other: string | null;
  usual_products: string | null;
  heat_tools: string[] | null;
  heat_tools_other: string | null;
  supplements_treatments: string | null;
  treatment_service: string | null;
  treated_zones: string | null;
  session_time: string | null;
  shampoo_conditioner: string | null;
  mask_treatment: string | null;
  oils_serums: string | null;
  other_products: string | null;
  exposure_time: string | null;
  improve_hair_health: boolean | null;
  control_hair_loss: boolean | null;
  hydration_nutrition: boolean | null;
  restoration_repair: boolean | null;
  other_objective: string | null;
  professional_observations: string | null;
}

interface HairScalpCardsProps {
  clientId: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
}

const HAIR_TYPES = ["Liso", "Ondulado", "Rizado", "Muy rizado", "Otro"];
const TEXTURES = ["Fina", "Media", "Gruesa"];
const DENSITIES = ["Baja", "Media", "Alta"];
const POROSITIES = ["Baja", "Media", "Alta"];
const ELASTICITIES = ["Baja", "Media", "Alta"];
const PREVIOUS_TREATMENTS = ["Tintes", "Mechas", "Decoloración", "Alisado", "Permanente", "Otro"];
const SCALP_TYPES = ["Normal", "Graso", "Seco", "Sensible", "Otro"];
const SCALP_PROBLEMS = ["Caspa", "Descamación", "Picor", "Irritación", "Eccema", "Psoriasis", "Otro"];
const SENSITIVITIES = ["Baja", "Media", "Alta"];
const WASH_FREQUENCIES = ["Diario", "Cada 2 días", "Semanal", "Otro"];
const HEAT_TOOLS = ["Planchas", "Secador", "Tenacillas", "Otro"];

const createEmptyForm = (clientPhone?: string | null, clientEmail?: string | null) => ({
  date: new Date().toISOString().split("T")[0],
  phone: clientPhone || "",
  email: clientEmail || "",
  hair_type: "",
  hair_type_other: "",
  hair_texture: "",
  hair_density: "",
  hair_porosity: "",
  hair_elasticity: "",
  natural_color: "",
  current_color: "",
  previous_treatments: [] as string[],
  previous_treatments_other: "",
  scalp_type: "",
  scalp_type_other: "",
  scalp_problems: [] as string[],
  scalp_problems_other: "",
  product_sensitivity: "",
  scalp_observations: "",
  wash_frequency: "",
  wash_frequency_other: "",
  usual_products: "",
  heat_tools: [] as string[],
  heat_tools_other: "",
  supplements_treatments: "",
  treatment_service: "",
  treated_zones: "",
  session_time: "",
  shampoo_conditioner: "",
  mask_treatment: "",
  oils_serums: "",
  other_products: "",
  exposure_time: "",
  improve_hair_health: false,
  control_hair_loss: false,
  hydration_nutrition: false,
  restoration_repair: false,
  other_objective: "",
  professional_observations: "",
});

export function HairScalpCards({ clientId, clientPhone, clientEmail }: HairScalpCardsProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<HairScalpCard[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HairScalpCard | null>(null);
  const [form, setForm] = useState(createEmptyForm(clientPhone, clientEmail));
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user && clientId) fetchCards();
  }, [user, clientId]);

  const fetchCards = async () => {
    const { data } = await supabase
      .from("hair_scalp_cards")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });
    setCards((data as any) || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      client_id: clientId,
      user_id: user!.id,
      date: form.date,
      phone: form.phone || null,
      email: form.email || null,
      hair_type: form.hair_type || null,
      hair_type_other: form.hair_type === "Otro" ? form.hair_type_other : null,
      hair_texture: form.hair_texture || null,
      hair_density: form.hair_density || null,
      hair_porosity: form.hair_porosity || null,
      hair_elasticity: form.hair_elasticity || null,
      natural_color: form.natural_color || null,
      current_color: form.current_color || null,
      previous_treatments: form.previous_treatments.length > 0 ? form.previous_treatments : null,
      previous_treatments_other: form.previous_treatments.includes("Otro") ? form.previous_treatments_other : null,
      scalp_type: form.scalp_type || null,
      scalp_type_other: form.scalp_type === "Otro" ? form.scalp_type_other : null,
      scalp_problems: form.scalp_problems.length > 0 ? form.scalp_problems : null,
      scalp_problems_other: form.scalp_problems.includes("Otro") ? form.scalp_problems_other : null,
      product_sensitivity: form.product_sensitivity || null,
      scalp_observations: form.scalp_observations || null,
      wash_frequency: form.wash_frequency || null,
      wash_frequency_other: form.wash_frequency === "Otro" ? form.wash_frequency_other : null,
      usual_products: form.usual_products || null,
      heat_tools: form.heat_tools.length > 0 ? form.heat_tools : null,
      heat_tools_other: form.heat_tools.includes("Otro") ? form.heat_tools_other : null,
      supplements_treatments: form.supplements_treatments || null,
      treatment_service: form.treatment_service || null,
      treated_zones: form.treated_zones || null,
      session_time: form.session_time || null,
      shampoo_conditioner: form.shampoo_conditioner || null,
      mask_treatment: form.mask_treatment || null,
      oils_serums: form.oils_serums || null,
      other_products: form.other_products || null,
      exposure_time: form.exposure_time || null,
      improve_hair_health: form.improve_hair_health,
      control_hair_loss: form.control_hair_loss,
      hydration_nutrition: form.hydration_nutrition,
      restoration_repair: form.restoration_repair,
      other_objective: form.other_objective || null,
      professional_observations: form.professional_observations || null,
    };

    if (editing) {
      await supabase.from("hair_scalp_cards").update(payload as any).eq("id", editing.id);
      toast.success("Ficha de cabello actualizada");
    } else {
      await supabase.from("hair_scalp_cards").insert(payload as any);
      toast.success("Ficha de cabello creada");
    }

    setOpen(false);
    setEditing(null);
    setForm(createEmptyForm(clientPhone, clientEmail));
    fetchCards();
  };

  const handleEdit = (card: HairScalpCard) => {
    setEditing(card);
    setForm({
      date: card.date,
      phone: card.phone || "",
      email: card.email || "",
      hair_type: card.hair_type || "",
      hair_type_other: card.hair_type_other || "",
      hair_texture: card.hair_texture || "",
      hair_density: card.hair_density || "",
      hair_porosity: card.hair_porosity || "",
      hair_elasticity: card.hair_elasticity || "",
      natural_color: card.natural_color || "",
      current_color: card.current_color || "",
      previous_treatments: card.previous_treatments || [],
      previous_treatments_other: card.previous_treatments_other || "",
      scalp_type: card.scalp_type || "",
      scalp_type_other: card.scalp_type_other || "",
      scalp_problems: card.scalp_problems || [],
      scalp_problems_other: card.scalp_problems_other || "",
      product_sensitivity: card.product_sensitivity || "",
      scalp_observations: card.scalp_observations || "",
      wash_frequency: card.wash_frequency || "",
      wash_frequency_other: card.wash_frequency_other || "",
      usual_products: card.usual_products || "",
      heat_tools: card.heat_tools || [],
      heat_tools_other: card.heat_tools_other || "",
      supplements_treatments: card.supplements_treatments || "",
      treatment_service: card.treatment_service || "",
      treated_zones: card.treated_zones || "",
      session_time: card.session_time || "",
      shampoo_conditioner: card.shampoo_conditioner || "",
      mask_treatment: card.mask_treatment || "",
      oils_serums: card.oils_serums || "",
      other_products: card.other_products || "",
      exposure_time: card.exposure_time || "",
      improve_hair_health: card.improve_hair_health || false,
      control_hair_loss: card.control_hair_loss || false,
      hydration_nutrition: card.hydration_nutrition || false,
      restoration_repair: card.restoration_repair || false,
      other_objective: card.other_objective || "",
      professional_observations: card.professional_observations || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from("hair_scalp_cards").delete().eq("id", deleteId);
      toast.success("Ficha de cabello eliminada");
      setDeleteId(null);
      fetchCards();
    }
  };

  const toggleArrayValue = (field: "previous_treatments" | "scalp_problems" | "heat_tools", value: string) => {
    const current = form[field];
    if (current.includes(value)) {
      setForm({ ...form, [field]: current.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...current, value] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Fichas de Cabello y Cuero Cabelludo
        </h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditing(null);
              setForm(createEmptyForm(clientPhone, clientEmail));
            }
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar" : "Nueva"} Ficha de Cabello y Cuero Cabelludo
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Datos Generales</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Características del cabello */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Características del Cabello</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de cabello</Label>
                    <Select value={form.hair_type} onValueChange={(v) => setForm({ ...form, hair_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {HAIR_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Textura</Label>
                    <Select value={form.hair_texture} onValueChange={(v) => setForm({ ...form, hair_texture: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {TEXTURES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Densidad</Label>
                    <Select value={form.hair_density} onValueChange={(v) => setForm({ ...form, hair_density: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {DENSITIES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Porosidad</Label>
                    <Select value={form.hair_porosity} onValueChange={(v) => setForm({ ...form, hair_porosity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {POROSITIES.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Elasticidad</Label>
                    <Select value={form.hair_elasticity} onValueChange={(v) => setForm({ ...form, hair_elasticity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {ELASTICITIES.map((e) => (
                          <SelectItem key={e} value={e}>{e}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.hair_type === "Otro" && (
                  <div>
                    <Label>Especificar tipo</Label>
                    <Input
                      value={form.hair_type_other}
                      onChange={(e) => setForm({ ...form, hair_type_other: e.target.value })}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Color natural</Label>
                    <Input
                      value={form.natural_color}
                      onChange={(e) => setForm({ ...form, natural_color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Color actual</Label>
                    <Input
                      value={form.current_color}
                      onChange={(e) => setForm({ ...form, current_color: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="mb-2 block">Alteraciones o tratamientos previos</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PREVIOUS_TREATMENTS.map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <Checkbox
                          id={`prev-${t}`}
                          checked={form.previous_treatments.includes(t)}
                          onCheckedChange={() => toggleArrayValue("previous_treatments", t)}
                        />
                        <Label htmlFor={`prev-${t}`} className="font-normal">{t}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.previous_treatments.includes("Otro") && (
                  <div>
                    <Label>Especificar otro tratamiento</Label>
                    <Input
                      value={form.previous_treatments_other}
                      onChange={(e) => setForm({ ...form, previous_treatments_other: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Estado del cuero cabelludo */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Estado del Cuero Cabelludo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de cuero cabelludo</Label>
                    <Select value={form.scalp_type} onValueChange={(v) => setForm({ ...form, scalp_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {SCALP_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sensibilidad a productos</Label>
                    <Select value={form.product_sensitivity} onValueChange={(v) => setForm({ ...form, product_sensitivity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {SENSITIVITIES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.scalp_type === "Otro" && (
                  <div>
                    <Label>Especificar tipo</Label>
                    <Input
                      value={form.scalp_type_other}
                      onChange={(e) => setForm({ ...form, scalp_type_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label className="mb-2 block">Problemas presentes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCALP_PROBLEMS.map((p) => (
                      <div key={p} className="flex items-center space-x-2">
                        <Checkbox
                          id={`prob-${p}`}
                          checked={form.scalp_problems.includes(p)}
                          onCheckedChange={() => toggleArrayValue("scalp_problems", p)}
                        />
                        <Label htmlFor={`prob-${p}`} className="font-normal">{p}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.scalp_problems.includes("Otro") && (
                  <div>
                    <Label>Especificar otro problema</Label>
                    <Input
                      value={form.scalp_problems_other}
                      onChange={(e) => setForm({ ...form, scalp_problems_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={form.scalp_observations}
                    onChange={(e) => setForm({ ...form, scalp_observations: e.target.value })}
                  />
                </div>
              </div>

              {/* Hábitos del cliente */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Hábitos del Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Frecuencia de lavado</Label>
                    <Select value={form.wash_frequency} onValueChange={(v) => setForm({ ...form, wash_frequency: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {WASH_FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Productos habituales</Label>
                    <Input
                      value={form.usual_products}
                      onChange={(e) => setForm({ ...form, usual_products: e.target.value })}
                    />
                  </div>
                </div>
                {form.wash_frequency === "Otro" && (
                  <div>
                    <Label>Especificar frecuencia</Label>
                    <Input
                      value={form.wash_frequency_other}
                      onChange={(e) => setForm({ ...form, wash_frequency_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label className="mb-2 block">Uso de herramientas de calor</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {HEAT_TOOLS.map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <Checkbox
                          id={`heat-${t}`}
                          checked={form.heat_tools.includes(t)}
                          onCheckedChange={() => toggleArrayValue("heat_tools", t)}
                        />
                        <Label htmlFor={`heat-${t}`} className="font-normal">{t}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.heat_tools.includes("Otro") && (
                  <div>
                    <Label>Especificar otra herramienta</Label>
                    <Input
                      value={form.heat_tools_other}
                      onChange={(e) => setForm({ ...form, heat_tools_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Suplementos o tratamientos internos</Label>
                  <Input
                    value={form.supplements_treatments}
                    onChange={(e) => setForm({ ...form, supplements_treatments: e.target.value })}
                  />
                </div>
              </div>

              {/* Tratamiento realizado */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Tratamiento o Servicio Realizado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Tratamiento / Servicio</Label>
                    <Input
                      value={form.treatment_service}
                      onChange={(e) => setForm({ ...form, treatment_service: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Zonas tratadas</Label>
                    <Input
                      value={form.treated_zones}
                      onChange={(e) => setForm({ ...form, treated_zones: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tiempo / sesión</Label>
                    <Input
                      value={form.session_time}
                      onChange={(e) => setForm({ ...form, session_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Productos utilizados */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Productos Utilizados</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Champú / acondicionador</Label>
                    <Input
                      value={form.shampoo_conditioner}
                      onChange={(e) => setForm({ ...form, shampoo_conditioner: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Mascarilla / tratamiento</Label>
                    <Input
                      value={form.mask_treatment}
                      onChange={(e) => setForm({ ...form, mask_treatment: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Aceites / sérums</Label>
                    <Input
                      value={form.oils_serums}
                      onChange={(e) => setForm({ ...form, oils_serums: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={form.other_products}
                      onChange={(e) => setForm({ ...form, other_products: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tiempo de exposición</Label>
                    <Input
                      value={form.exposure_time}
                      onChange={(e) => setForm({ ...form, exposure_time: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Objetivos del tratamiento */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Objetivos del Tratamiento</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="improve-health"
                      checked={form.improve_hair_health}
                      onCheckedChange={(checked) => setForm({ ...form, improve_hair_health: !!checked })}
                    />
                    <Label htmlFor="improve-health" className="font-normal">Mejorar salud del cabello</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="control-loss"
                      checked={form.control_hair_loss}
                      onCheckedChange={(checked) => setForm({ ...form, control_hair_loss: !!checked })}
                    />
                    <Label htmlFor="control-loss" className="font-normal">Control de caída</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hydration"
                      checked={form.hydration_nutrition}
                      onCheckedChange={(checked) => setForm({ ...form, hydration_nutrition: !!checked })}
                    />
                    <Label htmlFor="hydration" className="font-normal">Hidratación y nutrición</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="restoration"
                      checked={form.restoration_repair}
                      onCheckedChange={(checked) => setForm({ ...form, restoration_repair: !!checked })}
                    />
                    <Label htmlFor="restoration" className="font-normal">Restauración y reparación</Label>
                  </div>
                </div>
                <div>
                  <Label>Otro objetivo</Label>
                  <Input
                    value={form.other_objective}
                    onChange={(e) => setForm({ ...form, other_objective: e.target.value })}
                  />
                </div>
              </div>

              {/* Observaciones del profesional */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Observaciones del Profesional</h4>
                <div>
                  <Textarea
                    value={form.professional_observations}
                    onChange={(e) => setForm({ ...form, professional_observations: e.target.value })}
                    rows={4}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full btn-primary-gradient">
                {editing ? "Guardar cambios" : "Crear ficha"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards list */}
      <div className="space-y-3">
        {cards.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No hay fichas de cabello para este cliente
          </p>
        ) : (
          cards.map((card) => (
            <Card key={card.id} className="card-hover">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">
                      {format(new Date(card.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                    <div className="text-sm text-muted-foreground space-y-0.5">
                      {card.hair_type && <p>Tipo: {card.hair_type}</p>}
                      {card.scalp_type && <p>Cuero cabelludo: {card.scalp_type}</p>}
                      {card.treatment_service && <p>Tratamiento: {card.treatment_service}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(card)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(card.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ficha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La ficha de cabello será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
