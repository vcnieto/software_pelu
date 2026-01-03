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

interface WaxingTreatmentCard {
  id: string;
  date: string;
  age: number | null;
  session_number: number | null;
  professional_id: string | null;
  professional_registration: string | null;
  skin_type: string | null;
  skin_condition: string | null;
  skin_condition_other: string | null;
  special_observations: string | null;
  hair_type: string | null;
  hair_color: string | null;
  hair_density: string | null;
  hair_length: string | null;
  previous_external_treatments: string | null;
  wax_type: string | null;
  wax_type_other: string | null;
  wax_batch: string | null;
  pre_cleanser: string | null;
  pre_talc: string | null;
  pre_oil: string | null;
  pre_other_products: string | null;
  post_calming_cream: string | null;
  post_aloe_gel: string | null;
  post_oil: string | null;
  post_other_products: string | null;
  waxing_areas: string[] | null;
  waxing_areas_other: string | null;
  waxing_method: string | null;
  waxing_method_other: string | null;
  hair_removal_direction: string | null;
  treatment_reactions: string[] | null;
  treatment_reactions_other: string | null;
  client_recommendations: string | null;
}

interface Professional {
  id: string;
  name: string;
}

interface WaxingTreatmentCardsProps {
  clientId: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Sensible", "Grasa"];
const SKIN_CONDITIONS = ["Perfecta", "Irritada", "Con lesiones", "Con manchas", "Otro"];
const HAIR_TYPES = ["Fino", "Medio", "Grueso", "Rizado", "Liso"];
const HAIR_COLORS = ["Rubio", "Castaño", "Negro", "Pelirrojo", "Canoso"];
const HAIR_DENSITIES = ["Baja", "Media", "Alta"];
const HAIR_LENGTHS = ["Corto", "Medio", "Largo"];
const WAX_TYPES = ["Cera tibia", "Cera caliente", "Cera fría", "Otro"];
const WAXING_AREAS = ["Axilas", "Piernas", "Brazos", "Cejas", "Labio superior", "Bikini", "Completa", "Otra"];
const WAXING_METHODS = ["Tira", "Sin tira", "Otro"];
const HAIR_REMOVAL_DIRECTIONS = ["A favor del crecimiento", "En contra del crecimiento", "Ambos"];
const TREATMENT_REACTIONS = ["Ninguna", "Enrojecimiento", "Irritación", "Sensibilidad", "Otro"];

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  age: "",
  session_number: "",
  professional_id: "",
  professional_registration: "",
  skin_type: "",
  skin_condition: "",
  skin_condition_other: "",
  special_observations: "",
  hair_type: "",
  hair_color: "",
  hair_density: "",
  hair_length: "",
  previous_external_treatments: "",
  wax_type: "",
  wax_type_other: "",
  wax_batch: "",
  pre_cleanser: "",
  pre_talc: "",
  pre_oil: "",
  pre_other_products: "",
  post_calming_cream: "",
  post_aloe_gel: "",
  post_oil: "",
  post_other_products: "",
  waxing_areas: [] as string[],
  waxing_areas_other: "",
  waxing_method: "",
  waxing_method_other: "",
  hair_removal_direction: "",
  treatment_reactions: [] as string[],
  treatment_reactions_other: "",
  client_recommendations: "",
};

export function WaxingTreatmentCards({ clientId }: WaxingTreatmentCardsProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<WaxingTreatmentCard[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WaxingTreatmentCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user && clientId) {
      fetchCards();
      fetchProfessionals();
    }
  }, [user, clientId]);

  const fetchCards = async () => {
    const { data } = await supabase
      .from("waxing_treatment_cards")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });
    setCards((data as any) || []);
  };

  const fetchProfessionals = async () => {
    const { data } = await supabase.from("professionals").select("id, name").order("name");
    setProfessionals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      client_id: clientId,
      user_id: user!.id,
      date: form.date,
      age: form.age ? parseInt(form.age) : null,
      session_number: form.session_number ? parseInt(form.session_number) : null,
      professional_id: form.professional_id || null,
      professional_registration: form.professional_registration || null,
      skin_type: form.skin_type || null,
      skin_condition: form.skin_condition || null,
      skin_condition_other: form.skin_condition === "Otro" ? form.skin_condition_other : null,
      special_observations: form.special_observations || null,
      hair_type: form.hair_type || null,
      hair_color: form.hair_color || null,
      hair_density: form.hair_density || null,
      hair_length: form.hair_length || null,
      previous_external_treatments: form.previous_external_treatments || null,
      wax_type: form.wax_type || null,
      wax_type_other: form.wax_type === "Otro" ? form.wax_type_other : null,
      wax_batch: form.wax_batch || null,
      pre_cleanser: form.pre_cleanser || null,
      pre_talc: form.pre_talc || null,
      pre_oil: form.pre_oil || null,
      pre_other_products: form.pre_other_products || null,
      post_calming_cream: form.post_calming_cream || null,
      post_aloe_gel: form.post_aloe_gel || null,
      post_oil: form.post_oil || null,
      post_other_products: form.post_other_products || null,
      waxing_areas: form.waxing_areas.length > 0 ? form.waxing_areas : null,
      waxing_areas_other: form.waxing_areas.includes("Otra") ? form.waxing_areas_other : null,
      waxing_method: form.waxing_method || null,
      waxing_method_other: form.waxing_method === "Otro" ? form.waxing_method_other : null,
      hair_removal_direction: form.hair_removal_direction || null,
      treatment_reactions: form.treatment_reactions.length > 0 ? form.treatment_reactions : null,
      treatment_reactions_other: form.treatment_reactions.includes("Otro") ? form.treatment_reactions_other : null,
      client_recommendations: form.client_recommendations || null,
    };

    if (editing) {
      await supabase.from("waxing_treatment_cards").update(payload as any).eq("id", editing.id);
      toast.success("Ficha de depilación actualizada");
    } else {
      await supabase.from("waxing_treatment_cards").insert(payload as any);
      toast.success("Ficha de depilación creada");
    }

    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchCards();
  };

  const handleEdit = (card: WaxingTreatmentCard) => {
    setEditing(card);
    setForm({
      date: card.date,
      age: card.age?.toString() || "",
      session_number: card.session_number?.toString() || "",
      professional_id: card.professional_id || "",
      professional_registration: card.professional_registration || "",
      skin_type: card.skin_type || "",
      skin_condition: card.skin_condition || "",
      skin_condition_other: card.skin_condition_other || "",
      special_observations: card.special_observations || "",
      hair_type: card.hair_type || "",
      hair_color: card.hair_color || "",
      hair_density: card.hair_density || "",
      hair_length: card.hair_length || "",
      previous_external_treatments: card.previous_external_treatments || "",
      wax_type: card.wax_type || "",
      wax_type_other: card.wax_type_other || "",
      wax_batch: card.wax_batch || "",
      pre_cleanser: card.pre_cleanser || "",
      pre_talc: card.pre_talc || "",
      pre_oil: card.pre_oil || "",
      pre_other_products: card.pre_other_products || "",
      post_calming_cream: card.post_calming_cream || "",
      post_aloe_gel: card.post_aloe_gel || "",
      post_oil: card.post_oil || "",
      post_other_products: card.post_other_products || "",
      waxing_areas: card.waxing_areas || [],
      waxing_areas_other: card.waxing_areas_other || "",
      waxing_method: card.waxing_method || "",
      waxing_method_other: card.waxing_method_other || "",
      hair_removal_direction: card.hair_removal_direction || "",
      treatment_reactions: card.treatment_reactions || [],
      treatment_reactions_other: card.treatment_reactions_other || "",
      client_recommendations: card.client_recommendations || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from("waxing_treatment_cards").delete().eq("id", deleteId);
      toast.success("Ficha de depilación eliminada");
      setDeleteId(null);
      fetchCards();
    }
  };

  const toggleArrayValue = (field: "waxing_areas" | "treatment_reactions", value: string) => {
    const current = form[field];
    if (current.includes(value)) {
      setForm({ ...form, [field]: current.filter((v) => v !== value) });
    } else {
      setForm({ ...form, [field]: [...current, value] });
    }
  };

  const getProfessionalName = (id: string | null) => {
    if (!id) return null;
    return professionals.find((p) => p.id === id)?.name;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-500" />
          Fichas de Depilación
        </h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              setEditing(null);
              setForm(emptyForm);
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
                {editing ? "Editar" : "Nueva"} Ficha de Depilación
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
                    <Label>Edad</Label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Número de sesión</Label>
                    <Input
                      type="number"
                      value={form.session_number}
                      onChange={(e) => setForm({ ...form, session_number: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Datos del profesional */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Datos del Profesional</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Profesional</Label>
                    <Select value={form.professional_id} onValueChange={(v) => setForm({ ...form, professional_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nº matrícula / registro</Label>
                    <Input
                      value={form.professional_registration}
                      onChange={(e) => setForm({ ...form, professional_registration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Información de la piel */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Información de la Piel</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel corporal</Label>
                    <Select value={form.skin_type} onValueChange={(v) => setForm({ ...form, skin_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado de la piel</Label>
                    <Select value={form.skin_condition} onValueChange={(v) => setForm({ ...form, skin_condition: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {SKIN_CONDITIONS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.skin_condition === "Otro" && (
                  <div>
                    <Label>Especificar estado</Label>
                    <Input
                      value={form.skin_condition_other}
                      onChange={(e) => setForm({ ...form, skin_condition_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Observaciones especiales</Label>
                  <Textarea
                    value={form.special_observations}
                    onChange={(e) => setForm({ ...form, special_observations: e.target.value })}
                  />
                </div>
              </div>

              {/* Información del vello */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Información del Vello</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de vello</Label>
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
                    <Label>Color del vello</Label>
                    <Select value={form.hair_color} onValueChange={(v) => setForm({ ...form, hair_color: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {HAIR_COLORS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Densidad</Label>
                    <Select value={form.hair_density} onValueChange={(v) => setForm({ ...form, hair_density: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {HAIR_DENSITIES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Longitud del vello</Label>
                    <Select value={form.hair_length} onValueChange={(v) => setForm({ ...form, hair_length: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {HAIR_LENGTHS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Tratamientos previos fuera del centro</Label>
                  <Textarea
                    value={form.previous_external_treatments}
                    onChange={(e) => setForm({ ...form, previous_external_treatments: e.target.value })}
                  />
                </div>
              </div>

              {/* Cera y productos */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Cera y Productos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de cera utilizada</Label>
                    <Select value={form.wax_type} onValueChange={(v) => setForm({ ...form, wax_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {WAX_TYPES.map((w) => (
                          <SelectItem key={w} value={w}>{w}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Lote de la cera</Label>
                    <Input
                      value={form.wax_batch}
                      onChange={(e) => setForm({ ...form, wax_batch: e.target.value })}
                    />
                  </div>
                </div>
                {form.wax_type === "Otro" && (
                  <div>
                    <Label>Especificar tipo de cera</Label>
                    <Input
                      value={form.wax_type_other}
                      onChange={(e) => setForm({ ...form, wax_type_other: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Productos pre-depilación */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Productos Pre-depilación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Limpiador</Label>
                    <Input
                      value={form.pre_cleanser}
                      onChange={(e) => setForm({ ...form, pre_cleanser: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Talco / polvo protector</Label>
                    <Input
                      value={form.pre_talc}
                      onChange={(e) => setForm({ ...form, pre_talc: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Aceite preparador</Label>
                    <Input
                      value={form.pre_oil}
                      onChange={(e) => setForm({ ...form, pre_oil: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={form.pre_other_products}
                      onChange={(e) => setForm({ ...form, pre_other_products: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Productos post-depilación */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Productos Post-depilación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Crema calmante</Label>
                    <Input
                      value={form.post_calming_cream}
                      onChange={(e) => setForm({ ...form, post_calming_cream: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Gel de aloe vera</Label>
                    <Input
                      value={form.post_aloe_gel}
                      onChange={(e) => setForm({ ...form, post_aloe_gel: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Aceite post-depilatorio</Label>
                    <Input
                      value={form.post_oil}
                      onChange={(e) => setForm({ ...form, post_oil: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={form.post_other_products}
                      onChange={(e) => setForm({ ...form, post_other_products: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Área a depilar */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Área a Depilar</h4>
                <div className="grid grid-cols-2 gap-2">
                  {WAXING_AREAS.map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area}`}
                        checked={form.waxing_areas.includes(area)}
                        onCheckedChange={() => toggleArrayValue("waxing_areas", area)}
                      />
                      <Label htmlFor={`area-${area}`} className="font-normal">{area}</Label>
                    </div>
                  ))}
                </div>
                {form.waxing_areas.includes("Otra") && (
                  <div>
                    <Label>Especificar otra área</Label>
                    <Input
                      value={form.waxing_areas_other}
                      onChange={(e) => setForm({ ...form, waxing_areas_other: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Técnica */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Técnica</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Método de depilación</Label>
                    <Select value={form.waxing_method} onValueChange={(v) => setForm({ ...form, waxing_method: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {WAXING_METHODS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dirección del retiro</Label>
                    <Select value={form.hair_removal_direction} onValueChange={(v) => setForm({ ...form, hair_removal_direction: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                      <SelectContent>
                        {HAIR_REMOVAL_DIRECTIONS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.waxing_method === "Otro" && (
                  <div>
                    <Label>Especificar método</Label>
                    <Input
                      value={form.waxing_method_other}
                      onChange={(e) => setForm({ ...form, waxing_method_other: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Observaciones finales */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Observaciones Finales</h4>
                <div>
                  <Label className="mb-2 block">Reacciones durante la depilación</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TREATMENT_REACTIONS.map((reaction) => (
                      <div key={reaction} className="flex items-center space-x-2">
                        <Checkbox
                          id={`reaction-${reaction}`}
                          checked={form.treatment_reactions.includes(reaction)}
                          onCheckedChange={() => toggleArrayValue("treatment_reactions", reaction)}
                        />
                        <Label htmlFor={`reaction-${reaction}`} className="font-normal">{reaction}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                {form.treatment_reactions.includes("Otro") && (
                  <div>
                    <Label>Especificar otra reacción</Label>
                    <Input
                      value={form.treatment_reactions_other}
                      onChange={(e) => setForm({ ...form, treatment_reactions_other: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <Label>Recomendaciones para el cliente</Label>
                  <Textarea
                    value={form.client_recommendations}
                    onChange={(e) => setForm({ ...form, client_recommendations: e.target.value })}
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
            No hay fichas de depilación para este cliente
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
                      {card.session_number && <p>Sesión #{card.session_number}</p>}
                      {getProfessionalName(card.professional_id) && (
                        <p>Prof: {getProfessionalName(card.professional_id)}</p>
                      )}
                      {card.waxing_areas && card.waxing_areas.length > 0 && (
                        <p>Zonas: {card.waxing_areas.join(", ")}</p>
                      )}
                      {card.wax_type && <p>Cera: {card.wax_type}</p>}
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
              Esta acción no se puede deshacer. La ficha de depilación será eliminada permanentemente.
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
