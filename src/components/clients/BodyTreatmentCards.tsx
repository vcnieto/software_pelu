import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Activity, ChevronDown, ChevronUp, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface BodyTreatmentCard {
  id: string;
  date: string;
  age: number | null;
  session_number: number | null;
  professional_id: string | null;
  professional_registration: string | null;
  skin_type: string | null;
  skin_type_other: string | null;
  skin_sensitivity: string | null;
  skin_alterations: string[] | null;
  skin_alterations_other: string | null;
  cellulite_type: string | null;
  fluid_retention: string | null;
  flaccidity: string | null;
  localized_fat: boolean | null;
  muscle_tonicity: string | null;
  general_observations: string | null;
  treatment_performed: string | null;
  equipment_used: string | null;
  treated_zones: string | null;
  treatment_time: string | null;
  oils_creams: string | null;
  gel_lotion: string | null;
  other_products: string | null;
  treatment_reactions: string[] | null;
  treatment_reactions_other: string | null;
  final_observations: string | null;
  created_at: string;
}

interface Professional {
  id: string;
  name: string;
}

interface BodyTreatmentCardsProps {
  clientId: string;
  clientName: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Sensible", "Grasa", "Otro"];
const SKIN_SENSITIVITY = ["Baja", "Media", "Alta"];
const SKIN_ALTERATIONS = [
  "Ninguna", "Lesiones", "Inflamación", "Edemas", "Varices", "Celulitis",
  "Cicatrices", "Moretones / hematomas", "Quemaduras", "Erupciones / dermatitis", "Otro"
];
const CELLULITE_TYPES = ["Blanda", "Dura", "Edematosa", "Mixta"];
const FLUID_RETENTION = ["Leve", "Moderada", "Alta"];
const FLACCIDITY = ["Leve", "Moderada", "Alta"];
const MUSCLE_TONICITY = ["Buena", "Regular", "Baja"];
const TREATMENT_REACTIONS = [
  "Ninguna", "Enrojecimiento", "Sensibilidad", "Dolor", "Mareo", "Hormigueo", "Otro"
];

const BodyTreatmentCards = ({ clientId, clientName }: BodyTreatmentCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<BodyTreatmentCard[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<BodyTreatmentCard | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date(),
    age: "",
    session_number: "",
    professional_id: "",
    professional_registration: "",
    skin_type: "",
    skin_type_other: "",
    skin_sensitivity: "",
    skin_alterations: [] as string[],
    skin_alterations_other: "",
    cellulite_type: "",
    fluid_retention: "",
    flaccidity: "",
    localized_fat: false,
    muscle_tonicity: "",
    general_observations: "",
    treatment_performed: "",
    equipment_used: "",
    treated_zones: "",
    treatment_time: "",
    oils_creams: "",
    gel_lotion: "",
    other_products: "",
    treatment_reactions: [] as string[],
    treatment_reactions_other: "",
    final_observations: "",
  });

  useEffect(() => {
    fetchCards();
    fetchProfessionals();
  }, [clientId]);

  const fetchCards = async () => {
    const { data, error } = await (supabase
      .from("body_treatment_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);
    if (error) console.error("Error fetching body treatment cards:", error);
    setCards((data as BodyTreatmentCard[]) || []);
  };

  const fetchProfessionals = async () => {
    const { data } = await supabase.from("professionals").select("id, name").order("name");
    setProfessionals(data || []);
  };

  const resetForm = () => {
    setForm({
      date: new Date(),
      age: "",
      session_number: "",
      professional_id: "",
      professional_registration: "",
      skin_type: "",
      skin_type_other: "",
      skin_sensitivity: "",
      skin_alterations: [],
      skin_alterations_other: "",
      cellulite_type: "",
      fluid_retention: "",
      flaccidity: "",
      localized_fat: false,
      muscle_tonicity: "",
      general_observations: "",
      treatment_performed: "",
      equipment_used: "",
      treated_zones: "",
      treatment_time: "",
      oils_creams: "",
      gel_lotion: "",
      other_products: "",
      treatment_reactions: [],
      treatment_reactions_other: "",
      final_observations: "",
    });
    setEditingCard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardData = {
      user_id: user!.id,
      client_id: clientId,
      date: format(form.date, "yyyy-MM-dd"),
      age: form.age ? parseInt(form.age) : null,
      session_number: form.session_number ? parseInt(form.session_number) : null,
      professional_id: form.professional_id || null,
      professional_registration: form.professional_registration || null,
      skin_type: form.skin_type || null,
      skin_type_other: form.skin_type === "Otro" ? form.skin_type_other || null : null,
      skin_sensitivity: form.skin_sensitivity || null,
      skin_alterations: form.skin_alterations.length > 0 ? form.skin_alterations : null,
      skin_alterations_other: form.skin_alterations.includes("Otro") ? form.skin_alterations_other || null : null,
      cellulite_type: form.cellulite_type || null,
      fluid_retention: form.fluid_retention || null,
      flaccidity: form.flaccidity || null,
      localized_fat: form.localized_fat,
      muscle_tonicity: form.muscle_tonicity || null,
      general_observations: form.general_observations || null,
      treatment_performed: form.treatment_performed || null,
      equipment_used: form.equipment_used || null,
      treated_zones: form.treated_zones || null,
      treatment_time: form.treatment_time || null,
      oils_creams: form.oils_creams || null,
      gel_lotion: form.gel_lotion || null,
      other_products: form.other_products || null,
      treatment_reactions: form.treatment_reactions.length > 0 ? form.treatment_reactions : null,
      treatment_reactions_other: form.treatment_reactions.includes("Otro") ? form.treatment_reactions_other || null : null,
      final_observations: form.final_observations || null,
    };

    if (editingCard) {
      const { error } = await (supabase.from("body_treatment_cards" as any).update(cardData).eq("id", editingCard.id) as any);
      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await (supabase.from("body_treatment_cards" as any).insert(cardData) as any);
      if (error) {
        toast.error("Error al crear la ficha");
        return;
      }
      toast.success("Ficha creada correctamente");
    }

    setOpen(false);
    resetForm();
    fetchCards();
  };

  const handleEdit = (card: BodyTreatmentCard) => {
    setEditingCard(card);
    setForm({
      date: new Date(card.date),
      age: card.age?.toString() || "",
      session_number: card.session_number?.toString() || "",
      professional_id: card.professional_id || "",
      professional_registration: card.professional_registration || "",
      skin_type: card.skin_type || "",
      skin_type_other: card.skin_type_other || "",
      skin_sensitivity: card.skin_sensitivity || "",
      skin_alterations: card.skin_alterations || [],
      skin_alterations_other: card.skin_alterations_other || "",
      cellulite_type: card.cellulite_type || "",
      fluid_retention: card.fluid_retention || "",
      flaccidity: card.flaccidity || "",
      localized_fat: card.localized_fat || false,
      muscle_tonicity: card.muscle_tonicity || "",
      general_observations: card.general_observations || "",
      treatment_performed: card.treatment_performed || "",
      equipment_used: card.equipment_used || "",
      treated_zones: card.treated_zones || "",
      treatment_time: card.treatment_time || "",
      oils_creams: card.oils_creams || "",
      gel_lotion: card.gel_lotion || "",
      other_products: card.other_products || "",
      treatment_reactions: card.treatment_reactions || [],
      treatment_reactions_other: card.treatment_reactions_other || "",
      final_observations: card.final_observations || "",
    });
    setOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    const { error } = await (supabase.from("body_treatment_cards" as any).delete().eq("id", cardId) as any);
    if (error) {
      toast.error("Error al eliminar la ficha");
      return;
    }
    toast.success("Ficha eliminada correctamente");
    fetchCards();
  };

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const getProfessionalName = (id: string | null) => {
    const prof = professionals.find((p) => p.id === id);
    return prof?.name || "Sin asignar";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-teal-600" />
          Fichas de Tratamientos Corporales
        </h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Editar Ficha de Tratamiento Corporal" : `Nueva Ficha de Tratamiento Corporal - ${clientName}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Datos Generales</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.date}
                          onSelect={(d) => { if (d) { setForm({ ...form, date: d }); setDateOpen(false); } }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Edad</Label>
                    <Input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      placeholder="Años"
                    />
                  </div>
                  <div>
                    <Label>Nº de sesión</Label>
                    <Input
                      type="number"
                      value={form.session_number}
                      onChange={(e) => setForm({ ...form, session_number: e.target.value })}
                      placeholder="Número de sesión"
                    />
                  </div>
                  <div>
                    <Label>Profesional</Label>
                    <Select value={form.professional_id} onValueChange={(v) => setForm({ ...form, professional_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar profesional" /></SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Nº de matrícula / registro del profesional</Label>
                    <Input
                      value={form.professional_registration}
                      onChange={(e) => setForm({ ...form, professional_registration: e.target.value })}
                      placeholder="Número de registro"
                    />
                  </div>
                </div>
              </div>

              {/* Características del cliente */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Características del Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel</Label>
                    <Select value={form.skin_type} onValueChange={(v) => setForm({ ...form, skin_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    {form.skin_type === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.skin_type_other}
                        onChange={(e) => setForm({ ...form, skin_type_other: e.target.value })}
                        placeholder="Especificar..."
                      />
                    )}
                  </div>
                  <div>
                    <Label>Sensibilidad de la piel</Label>
                    <Select value={form.skin_sensitivity} onValueChange={(v) => setForm({ ...form, skin_sensitivity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {SKIN_SENSITIVITY.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Alteraciones o lesiones en la piel</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {SKIN_ALTERATIONS.map((alt) => (
                      <div key={alt} className="flex items-center space-x-2">
                        <Checkbox
                          id={`alt-${alt}`}
                          checked={form.skin_alterations.includes(alt)}
                          onCheckedChange={() => toggleArrayItem(form.skin_alterations, alt, (arr) => setForm({ ...form, skin_alterations: arr }))}
                        />
                        <label htmlFor={`alt-${alt}`} className="text-sm">{alt}</label>
                      </div>
                    ))}
                  </div>
                  {form.skin_alterations.includes("Otro") && (
                    <Input
                      className="mt-2"
                      value={form.skin_alterations_other}
                      onChange={(e) => setForm({ ...form, skin_alterations_other: e.target.value })}
                      placeholder="Especificar otras alteraciones..."
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de celulitis</Label>
                    <Select value={form.cellulite_type} onValueChange={(v) => setForm({ ...form, cellulite_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {CELLULITE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Retención de líquidos</Label>
                    <Select value={form.fluid_retention} onValueChange={(v) => setForm({ ...form, fluid_retention: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {FLUID_RETENTION.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Flacidez</Label>
                    <Select value={form.flaccidity} onValueChange={(v) => setForm({ ...form, flaccidity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {FLACCIDITY.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Tonicidad muscular</Label>
                    <Select value={form.muscle_tonicity} onValueChange={(v) => setForm({ ...form, muscle_tonicity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {MUSCLE_TONICITY.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="localized_fat"
                    checked={form.localized_fat}
                    onCheckedChange={(c) => setForm({ ...form, localized_fat: c === true })}
                  />
                  <label htmlFor="localized_fat" className="text-sm">Grasa localizada</label>
                </div>

                <div>
                  <Label>Observaciones generales</Label>
                  <Textarea
                    value={form.general_observations}
                    onChange={(e) => setForm({ ...form, general_observations: e.target.value })}
                    placeholder="Observaciones sobre las características del cliente..."
                  />
                </div>
              </div>

              {/* Tratamiento realizado */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Tratamiento Realizado / Zonas Tratadas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tratamiento realizado</Label>
                    <Input
                      value={form.treatment_performed}
                      onChange={(e) => setForm({ ...form, treatment_performed: e.target.value })}
                      placeholder="Descripción del tratamiento"
                    />
                  </div>
                  <div>
                    <Label>Aparatología utilizada</Label>
                    <Input
                      value={form.equipment_used}
                      onChange={(e) => setForm({ ...form, equipment_used: e.target.value })}
                      placeholder="Equipos o aparatos usados"
                    />
                  </div>
                  <div>
                    <Label>Zonas tratadas</Label>
                    <Input
                      value={form.treated_zones}
                      onChange={(e) => setForm({ ...form, treated_zones: e.target.value })}
                      placeholder="Ej: abdomen, piernas, brazos..."
                    />
                  </div>
                  <div>
                    <Label>Tiempo de tratamiento</Label>
                    <Input
                      value={form.treatment_time}
                      onChange={(e) => setForm({ ...form, treatment_time: e.target.value })}
                      placeholder="Ej: 45 minutos"
                    />
                  </div>
                </div>
              </div>

              {/* Productos usados */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Productos Usados</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Aceites / cremas</Label>
                    <Input
                      value={form.oils_creams}
                      onChange={(e) => setForm({ ...form, oils_creams: e.target.value })}
                      placeholder="Aceites o cremas usadas"
                    />
                  </div>
                  <div>
                    <Label>Gel / loción específica</Label>
                    <Input
                      value={form.gel_lotion}
                      onChange={(e) => setForm({ ...form, gel_lotion: e.target.value })}
                      placeholder="Geles o lociones"
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={form.other_products}
                      onChange={(e) => setForm({ ...form, other_products: e.target.value })}
                      placeholder="Otros productos"
                    />
                  </div>
                </div>
              </div>

              {/* Reacciones durante el tratamiento */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Reacciones Durante el Tratamiento</h4>
                <div className="grid grid-cols-4 gap-2">
                  {TREATMENT_REACTIONS.map((reaction) => (
                    <div key={reaction} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reaction-${reaction}`}
                        checked={form.treatment_reactions.includes(reaction)}
                        onCheckedChange={() => toggleArrayItem(form.treatment_reactions, reaction, (arr) => setForm({ ...form, treatment_reactions: arr }))}
                      />
                      <label htmlFor={`reaction-${reaction}`} className="text-sm">{reaction}</label>
                    </div>
                  ))}
                </div>
                {form.treatment_reactions.includes("Otro") && (
                  <Input
                    value={form.treatment_reactions_other}
                    onChange={(e) => setForm({ ...form, treatment_reactions_other: e.target.value })}
                    placeholder="Especificar otras reacciones..."
                  />
                )}
              </div>

              {/* Observaciones finales */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Observaciones Finales</h4>
                <Textarea
                  value={form.final_observations}
                  onChange={(e) => setForm({ ...form, final_observations: e.target.value })}
                  placeholder="Observaciones finales sobre la sesión..."
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCard ? "Guardar Cambios" : "Guardar Ficha"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No hay fichas de tratamientos corporales para este cliente
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => toggleExpand(card.id)}
                  >
                    <Activity className="w-4 h-4 text-teal-600" />
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Sesión {card.session_number || "-"} - {getProfessionalName(card.professional_id)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(card.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(card)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar ficha?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La ficha será eliminada permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(card.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleExpand(card.id)}
                    >
                      {expandedCard === card.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCard === card.id && (
                <CardContent className="py-3 px-4 border-t bg-muted/30">
                  <div className="grid gap-4 text-sm">
                    {/* Datos generales */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {card.age && <div><span className="font-medium text-muted-foreground">Edad:</span> {card.age} años</div>}
                      {card.professional_registration && <div><span className="font-medium text-muted-foreground">Nº Registro:</span> {card.professional_registration}</div>}
                    </div>

                    {/* Características */}
                    <div className="space-y-2">
                      <p className="font-medium text-muted-foreground border-b pb-1">Características del cliente</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.skin_type && <div><span className="text-muted-foreground">Tipo de piel:</span> {card.skin_type}{card.skin_type === "Otro" && card.skin_type_other ? ` (${card.skin_type_other})` : ""}</div>}
                        {card.skin_sensitivity && <div><span className="text-muted-foreground">Sensibilidad:</span> {card.skin_sensitivity}</div>}
                        {card.cellulite_type && <div><span className="text-muted-foreground">Celulitis:</span> {card.cellulite_type}</div>}
                        {card.fluid_retention && <div><span className="text-muted-foreground">Retención líquidos:</span> {card.fluid_retention}</div>}
                        {card.flaccidity && <div><span className="text-muted-foreground">Flacidez:</span> {card.flaccidity}</div>}
                        {card.muscle_tonicity && <div><span className="text-muted-foreground">Tonicidad:</span> {card.muscle_tonicity}</div>}
                        {card.localized_fat && <div><span className="text-muted-foreground">Grasa localizada:</span> Sí</div>}
                      </div>
                      {card.skin_alterations && card.skin_alterations.length > 0 && (
                        <div><span className="text-muted-foreground">Alteraciones:</span> {card.skin_alterations.join(", ")}{card.skin_alterations.includes("Otro") && card.skin_alterations_other ? ` (${card.skin_alterations_other})` : ""}</div>
                      )}
                      {card.general_observations && <div><span className="text-muted-foreground">Observaciones:</span> {card.general_observations}</div>}
                    </div>

                    {/* Tratamiento */}
                    {(card.treatment_performed || card.equipment_used || card.treated_zones || card.treatment_time) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Tratamiento realizado</p>
                        <div className="grid grid-cols-2 gap-2">
                          {card.treatment_performed && <div><span className="text-muted-foreground">Tratamiento:</span> {card.treatment_performed}</div>}
                          {card.equipment_used && <div><span className="text-muted-foreground">Aparatología:</span> {card.equipment_used}</div>}
                          {card.treated_zones && <div><span className="text-muted-foreground">Zonas:</span> {card.treated_zones}</div>}
                          {card.treatment_time && <div><span className="text-muted-foreground">Tiempo:</span> {card.treatment_time}</div>}
                        </div>
                      </div>
                    )}

                    {/* Productos */}
                    {(card.oils_creams || card.gel_lotion || card.other_products) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Productos usados</p>
                        <div className="grid grid-cols-3 gap-2">
                          {card.oils_creams && <div><span className="text-muted-foreground">Aceites/cremas:</span> {card.oils_creams}</div>}
                          {card.gel_lotion && <div><span className="text-muted-foreground">Gel/loción:</span> {card.gel_lotion}</div>}
                          {card.other_products && <div><span className="text-muted-foreground">Otros:</span> {card.other_products}</div>}
                        </div>
                      </div>
                    )}

                    {/* Reacciones */}
                    {card.treatment_reactions && card.treatment_reactions.length > 0 && (
                      <div>
                        <span className="text-muted-foreground">Reacciones:</span> {card.treatment_reactions.join(", ")}{card.treatment_reactions.includes("Otro") && card.treatment_reactions_other ? ` (${card.treatment_reactions_other})` : ""}
                      </div>
                    )}

                    {/* Observaciones finales */}
                    {card.final_observations && (
                      <div>
                        <span className="font-medium text-muted-foreground">Observaciones finales:</span>
                        <p className="mt-1">{card.final_observations}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BodyTreatmentCards;
