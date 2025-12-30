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
import { Plus, Smile, ChevronDown, ChevronUp, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FacialSkinCard {
  id: string;
  date: string;
  age: number | null;
  session_number: number | null;
  professional_id: string | null;
  professional_registration: string | null;
  skin_type: string | null;
  skin_condition: string | null;
  skin_condition_other: string | null;
  texture: string | null;
  texture_other: string | null;
  sensitivity: string | null;
  visible_pores: string | null;
  wrinkles: string | null;
  bags_dark_circles: string | null;
  lips: string | null;
  lips_other: string | null;
  skin_conditions: string[] | null;
  skin_conditions_other: string | null;
  has_milia: boolean | null;
  general_observations: string | null;
  treatment_performed: string | null;
  equipment_used: string | null;
  cleanser: string | null;
  toner: string | null;
  serum: string | null;
  moisturizer: string | null;
  sunscreen: string | null;
  other_products: string | null;
  daily_cleansing: string | null;
  hydration: string | null;
  special_treatments: string | null;
  home_sunscreen: string | null;
  home_other_products: string | null;
  routine_observations: string | null;
  treatment_reactions: string[] | null;
  treatment_reactions_other: string | null;
  final_observations: string | null;
  professional_recommendations: string | null;
  created_at: string;
}

interface Professional {
  id: string;
  name: string;
}

interface FacialSkinCardsProps {
  clientId: string;
  clientName: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Sensible", "Grasa"];
const SKIN_CONDITIONS = ["Perfecta", "Con imperfecciones", "Irritada", "Con acné", "Con manchas", "Otro"];
const TEXTURES = ["Suave", "Rugosa", "Deshidratada", "Grasa", "Otro"];
const SENSITIVITY = ["Baja", "Media", "Alta"];
const VISIBLE_PORES = ["No", "Sí", "Moderado"];
const WRINKLES = ["Ninguna", "Finas", "Marcadas", "Profundas"];
const BAGS_DARK_CIRCLES = ["Ninguna", "Leves", "Moderadas", "Marcadas"];
const LIPS = ["Hidratados", "Secos", "Exfoliados", "Otro"];
const SKIN_CONDITIONS_OPTIONS = ["Rosácea", "Psoriasis", "Eczema", "Dermatitis", "Otro"];
const TREATMENT_REACTIONS = ["Ninguna", "Enrojecimiento", "Sensibilidad", "Irritación", "Picazón", "Hormigueo", "Calor", "Descamación", "Sequedad", "Otros"];

const FacialSkinCards = ({ clientId, clientName }: FacialSkinCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<FacialSkinCard[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<FacialSkinCard | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [form, setForm] = useState({
    date: new Date(),
    age: "",
    session_number: "",
    professional_id: "",
    professional_registration: "",
    skin_type: "",
    skin_condition: "",
    skin_condition_other: "",
    texture: "",
    texture_other: "",
    sensitivity: "",
    visible_pores: "",
    wrinkles: "",
    bags_dark_circles: "",
    lips: "",
    lips_other: "",
    skin_conditions: [] as string[],
    skin_conditions_other: "",
    has_milia: false,
    general_observations: "",
    treatment_performed: "",
    equipment_used: "",
    cleanser: "",
    toner: "",
    serum: "",
    moisturizer: "",
    sunscreen: "",
    other_products: "",
    daily_cleansing: "",
    hydration: "",
    special_treatments: "",
    home_sunscreen: "",
    home_other_products: "",
    routine_observations: "",
    treatment_reactions: [] as string[],
    treatment_reactions_other: "",
    final_observations: "",
    professional_recommendations: "",
  });

  useEffect(() => {
    fetchCards();
    fetchProfessionals();
  }, [clientId]);

  const fetchCards = async () => {
    const { data, error } = await (supabase
      .from("facial_skin_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);
    if (error) console.error("Error fetching facial skin cards:", error);
    setCards((data as FacialSkinCard[]) || []);
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
      skin_condition: "",
      skin_condition_other: "",
      texture: "",
      texture_other: "",
      sensitivity: "",
      visible_pores: "",
      wrinkles: "",
      bags_dark_circles: "",
      lips: "",
      lips_other: "",
      skin_conditions: [],
      skin_conditions_other: "",
      has_milia: false,
      general_observations: "",
      treatment_performed: "",
      equipment_used: "",
      cleanser: "",
      toner: "",
      serum: "",
      moisturizer: "",
      sunscreen: "",
      other_products: "",
      daily_cleansing: "",
      hydration: "",
      special_treatments: "",
      home_sunscreen: "",
      home_other_products: "",
      routine_observations: "",
      treatment_reactions: [],
      treatment_reactions_other: "",
      final_observations: "",
      professional_recommendations: "",
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
      skin_condition: form.skin_condition || null,
      skin_condition_other: form.skin_condition === "Otro" ? form.skin_condition_other || null : null,
      texture: form.texture || null,
      texture_other: form.texture === "Otro" ? form.texture_other || null : null,
      sensitivity: form.sensitivity || null,
      visible_pores: form.visible_pores || null,
      wrinkles: form.wrinkles || null,
      bags_dark_circles: form.bags_dark_circles || null,
      lips: form.lips || null,
      lips_other: form.lips === "Otro" ? form.lips_other || null : null,
      skin_conditions: form.skin_conditions.length > 0 ? form.skin_conditions : null,
      skin_conditions_other: form.skin_conditions.includes("Otro") ? form.skin_conditions_other || null : null,
      has_milia: form.has_milia,
      general_observations: form.general_observations || null,
      treatment_performed: form.treatment_performed || null,
      equipment_used: form.equipment_used || null,
      cleanser: form.cleanser || null,
      toner: form.toner || null,
      serum: form.serum || null,
      moisturizer: form.moisturizer || null,
      sunscreen: form.sunscreen || null,
      other_products: form.other_products || null,
      daily_cleansing: form.daily_cleansing || null,
      hydration: form.hydration || null,
      special_treatments: form.special_treatments || null,
      home_sunscreen: form.home_sunscreen || null,
      home_other_products: form.home_other_products || null,
      routine_observations: form.routine_observations || null,
      treatment_reactions: form.treatment_reactions.length > 0 ? form.treatment_reactions : null,
      treatment_reactions_other: form.treatment_reactions.includes("Otros") ? form.treatment_reactions_other || null : null,
      final_observations: form.final_observations || null,
      professional_recommendations: form.professional_recommendations || null,
    };

    if (editingCard) {
      const { error } = await (supabase.from("facial_skin_cards" as any).update(cardData).eq("id", editingCard.id) as any);
      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await (supabase.from("facial_skin_cards" as any).insert(cardData) as any);
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

  const handleEdit = (card: FacialSkinCard) => {
    setEditingCard(card);
    setForm({
      date: new Date(card.date),
      age: card.age?.toString() || "",
      session_number: card.session_number?.toString() || "",
      professional_id: card.professional_id || "",
      professional_registration: card.professional_registration || "",
      skin_type: card.skin_type || "",
      skin_condition: card.skin_condition || "",
      skin_condition_other: card.skin_condition_other || "",
      texture: card.texture || "",
      texture_other: card.texture_other || "",
      sensitivity: card.sensitivity || "",
      visible_pores: card.visible_pores || "",
      wrinkles: card.wrinkles || "",
      bags_dark_circles: card.bags_dark_circles || "",
      lips: card.lips || "",
      lips_other: card.lips_other || "",
      skin_conditions: card.skin_conditions || [],
      skin_conditions_other: card.skin_conditions_other || "",
      has_milia: card.has_milia || false,
      general_observations: card.general_observations || "",
      treatment_performed: card.treatment_performed || "",
      equipment_used: card.equipment_used || "",
      cleanser: card.cleanser || "",
      toner: card.toner || "",
      serum: card.serum || "",
      moisturizer: card.moisturizer || "",
      sunscreen: card.sunscreen || "",
      other_products: card.other_products || "",
      daily_cleansing: card.daily_cleansing || "",
      hydration: card.hydration || "",
      special_treatments: card.special_treatments || "",
      home_sunscreen: card.home_sunscreen || "",
      home_other_products: card.home_other_products || "",
      routine_observations: card.routine_observations || "",
      treatment_reactions: card.treatment_reactions || [],
      treatment_reactions_other: card.treatment_reactions_other || "",
      final_observations: card.final_observations || "",
      professional_recommendations: card.professional_recommendations || "",
    });
    setOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    const { error } = await (supabase.from("facial_skin_cards" as any).delete().eq("id", cardId) as any);
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
          <Smile className="w-5 h-5 text-pink-500" />
          Fichas de Estudio de Piel Facial
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
                {editingCard ? "Editar Ficha de Piel Facial" : `Nueva Ficha de Piel Facial - ${clientName}`}
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
                    <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Años" />
                  </div>
                  <div>
                    <Label>Nº de sesión</Label>
                    <Input type="number" value={form.session_number} onChange={(e) => setForm({ ...form, session_number: e.target.value })} placeholder="Número" />
                  </div>
                  <div>
                    <Label>Profesional</Label>
                    <Select value={form.professional_id} onValueChange={(v) => setForm({ ...form, professional_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Nº de matrícula / registro</Label>
                    <Input value={form.professional_registration} onChange={(e) => setForm({ ...form, professional_registration: e.target.value })} placeholder="Número de registro" />
                  </div>
                </div>
              </div>

              {/* Evaluación de la piel */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Evaluación de la Piel</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel</Label>
                    <Select value={form.skin_type} onValueChange={(v) => setForm({ ...form, skin_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{SKIN_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado de la piel</Label>
                    <Select value={form.skin_condition} onValueChange={(v) => setForm({ ...form, skin_condition: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{SKIN_CONDITIONS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                    {form.skin_condition === "Otro" && <Input className="mt-2" value={form.skin_condition_other} onChange={(e) => setForm({ ...form, skin_condition_other: e.target.value })} placeholder="Especificar..." />}
                  </div>
                  <div>
                    <Label>Textura</Label>
                    <Select value={form.texture} onValueChange={(v) => setForm({ ...form, texture: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{TEXTURES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                    </Select>
                    {form.texture === "Otro" && <Input className="mt-2" value={form.texture_other} onChange={(e) => setForm({ ...form, texture_other: e.target.value })} placeholder="Especificar..." />}
                  </div>
                  <div>
                    <Label>Sensibilidad</Label>
                    <Select value={form.sensitivity} onValueChange={(v) => setForm({ ...form, sensitivity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{SENSITIVITY.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Poros visibles</Label>
                    <Select value={form.visible_pores} onValueChange={(v) => setForm({ ...form, visible_pores: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{VISIBLE_PORES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Líneas de expresión / arrugas</Label>
                    <Select value={form.wrinkles} onValueChange={(v) => setForm({ ...form, wrinkles: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{WRINKLES.map((w) => (<SelectItem key={w} value={w}>{w}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bolsas y ojeras</Label>
                    <Select value={form.bags_dark_circles} onValueChange={(v) => setForm({ ...form, bags_dark_circles: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{BAGS_DARK_CIRCLES.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Labios</Label>
                    <Select value={form.lips} onValueChange={(v) => setForm({ ...form, lips: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{LIPS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                    </Select>
                    {form.lips === "Otro" && <Input className="mt-2" value={form.lips_other} onChange={(e) => setForm({ ...form, lips_other: e.target.value })} placeholder="Especificar..." />}
                  </div>
                </div>

                <div>
                  <Label>Afecciones de la piel</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {SKIN_CONDITIONS_OPTIONS.map((cond) => (
                      <div key={cond} className="flex items-center space-x-2">
                        <Checkbox id={`cond-${cond}`} checked={form.skin_conditions.includes(cond)} onCheckedChange={() => toggleArrayItem(form.skin_conditions, cond, (arr) => setForm({ ...form, skin_conditions: arr }))} />
                        <label htmlFor={`cond-${cond}`} className="text-sm">{cond}</label>
                      </div>
                    ))}
                  </div>
                  {form.skin_conditions.includes("Otro") && <Input className="mt-2" value={form.skin_conditions_other} onChange={(e) => setForm({ ...form, skin_conditions_other: e.target.value })} placeholder="Especificar otras afecciones..." />}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="has_milia" checked={form.has_milia} onCheckedChange={(c) => setForm({ ...form, has_milia: c === true })} />
                  <label htmlFor="has_milia" className="text-sm">Presencia de milliums</label>
                </div>

                <div>
                  <Label>Observaciones generales</Label>
                  <Textarea value={form.general_observations} onChange={(e) => setForm({ ...form, general_observations: e.target.value })} placeholder="Observaciones sobre la evaluación..." />
                </div>
              </div>

              {/* Tratamiento realizado */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Tratamiento Realizado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tratamiento realizado</Label>
                    <Input value={form.treatment_performed} onChange={(e) => setForm({ ...form, treatment_performed: e.target.value })} placeholder="Descripción del tratamiento" />
                  </div>
                  <div>
                    <Label>Aparatología usada</Label>
                    <Input value={form.equipment_used} onChange={(e) => setForm({ ...form, equipment_used: e.target.value })} placeholder="Equipos utilizados" />
                  </div>
                </div>
              </div>

              {/* Productos utilizados */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Productos Utilizados</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Limpiador</Label><Input value={form.cleanser} onChange={(e) => setForm({ ...form, cleanser: e.target.value })} placeholder="Limpiador usado" /></div>
                  <div><Label>Tónico</Label><Input value={form.toner} onChange={(e) => setForm({ ...form, toner: e.target.value })} placeholder="Tónico usado" /></div>
                  <div><Label>Sérum / tratamiento específico</Label><Input value={form.serum} onChange={(e) => setForm({ ...form, serum: e.target.value })} placeholder="Sérum o tratamiento" /></div>
                  <div><Label>Hidratante</Label><Input value={form.moisturizer} onChange={(e) => setForm({ ...form, moisturizer: e.target.value })} placeholder="Hidratante" /></div>
                  <div><Label>Protector solar</Label><Input value={form.sunscreen} onChange={(e) => setForm({ ...form, sunscreen: e.target.value })} placeholder="Protector solar" /></div>
                  <div><Label>Otros productos</Label><Input value={form.other_products} onChange={(e) => setForm({ ...form, other_products: e.target.value })} placeholder="Otros productos" /></div>
                </div>
              </div>

              {/* Rutina facial en casa */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Rutina Facial en Casa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Limpieza diaria</Label><Input value={form.daily_cleansing} onChange={(e) => setForm({ ...form, daily_cleansing: e.target.value })} placeholder="Rutina de limpieza" /></div>
                  <div><Label>Hidratación</Label><Input value={form.hydration} onChange={(e) => setForm({ ...form, hydration: e.target.value })} placeholder="Hidratación diaria" /></div>
                  <div><Label>Tratamientos especiales</Label><Input value={form.special_treatments} onChange={(e) => setForm({ ...form, special_treatments: e.target.value })} placeholder="Tratamientos especiales" /></div>
                  <div><Label>Protector solar</Label><Input value={form.home_sunscreen} onChange={(e) => setForm({ ...form, home_sunscreen: e.target.value })} placeholder="Protector solar en casa" /></div>
                  <div className="col-span-2"><Label>Otros productos</Label><Input value={form.home_other_products} onChange={(e) => setForm({ ...form, home_other_products: e.target.value })} placeholder="Otros productos en casa" /></div>
                </div>
                <div>
                  <Label>Observaciones / recomendaciones</Label>
                  <Textarea value={form.routine_observations} onChange={(e) => setForm({ ...form, routine_observations: e.target.value })} placeholder="Observaciones sobre la rutina..." />
                </div>
              </div>

              {/* Reacciones durante el tratamiento */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Reacciones Durante el Tratamiento</h4>
                <div className="grid grid-cols-4 gap-2">
                  {TREATMENT_REACTIONS.map((r) => (
                    <div key={r} className="flex items-center space-x-2">
                      <Checkbox id={`react-${r}`} checked={form.treatment_reactions.includes(r)} onCheckedChange={() => toggleArrayItem(form.treatment_reactions, r, (arr) => setForm({ ...form, treatment_reactions: arr }))} />
                      <label htmlFor={`react-${r}`} className="text-sm">{r}</label>
                    </div>
                  ))}
                </div>
                {form.treatment_reactions.includes("Otros") && <Input value={form.treatment_reactions_other} onChange={(e) => setForm({ ...form, treatment_reactions_other: e.target.value })} placeholder="Especificar otras reacciones..." />}
              </div>

              {/* Cierre */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Cierre</h4>
                <div>
                  <Label>Observaciones finales</Label>
                  <Textarea value={form.final_observations} onChange={(e) => setForm({ ...form, final_observations: e.target.value })} placeholder="Observaciones finales..." />
                </div>
                <div>
                  <Label>Recomendaciones del profesional</Label>
                  <Textarea value={form.professional_recommendations} onChange={(e) => setForm({ ...form, professional_recommendations: e.target.value })} placeholder="Recomendaciones para el cliente..." />
                </div>
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
          No hay fichas de estudio de piel facial para este cliente
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(card.id)}>
                    <Smile className="w-4 h-4 text-pink-500" />
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(card)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar ficha?</AlertDialogTitle>
                          <AlertDialogDescription>Esta acción no se puede deshacer. La ficha será eliminada permanentemente.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(card.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleExpand(card.id)}>
                      {expandedCard === card.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
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

                    {/* Evaluación */}
                    <div className="space-y-2">
                      <p className="font-medium text-muted-foreground border-b pb-1">Evaluación de la piel</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.skin_type && <div><span className="text-muted-foreground">Tipo:</span> {card.skin_type}</div>}
                        {card.skin_condition && <div><span className="text-muted-foreground">Estado:</span> {card.skin_condition}{card.skin_condition === "Otro" && card.skin_condition_other ? ` (${card.skin_condition_other})` : ""}</div>}
                        {card.texture && <div><span className="text-muted-foreground">Textura:</span> {card.texture}{card.texture === "Otro" && card.texture_other ? ` (${card.texture_other})` : ""}</div>}
                        {card.sensitivity && <div><span className="text-muted-foreground">Sensibilidad:</span> {card.sensitivity}</div>}
                        {card.visible_pores && <div><span className="text-muted-foreground">Poros visibles:</span> {card.visible_pores}</div>}
                        {card.wrinkles && <div><span className="text-muted-foreground">Arrugas:</span> {card.wrinkles}</div>}
                        {card.bags_dark_circles && <div><span className="text-muted-foreground">Bolsas/ojeras:</span> {card.bags_dark_circles}</div>}
                        {card.lips && <div><span className="text-muted-foreground">Labios:</span> {card.lips}{card.lips === "Otro" && card.lips_other ? ` (${card.lips_other})` : ""}</div>}
                        {card.has_milia && <div><span className="text-muted-foreground">Milliums:</span> Sí</div>}
                      </div>
                      {card.skin_conditions && card.skin_conditions.length > 0 && (
                        <div><span className="text-muted-foreground">Afecciones:</span> {card.skin_conditions.join(", ")}{card.skin_conditions.includes("Otro") && card.skin_conditions_other ? ` (${card.skin_conditions_other})` : ""}</div>
                      )}
                      {card.general_observations && <div><span className="text-muted-foreground">Observaciones:</span> {card.general_observations}</div>}
                    </div>

                    {/* Tratamiento */}
                    {(card.treatment_performed || card.equipment_used) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Tratamiento realizado</p>
                        <div className="grid grid-cols-2 gap-2">
                          {card.treatment_performed && <div><span className="text-muted-foreground">Tratamiento:</span> {card.treatment_performed}</div>}
                          {card.equipment_used && <div><span className="text-muted-foreground">Aparatología:</span> {card.equipment_used}</div>}
                        </div>
                      </div>
                    )}

                    {/* Productos */}
                    {(card.cleanser || card.toner || card.serum || card.moisturizer || card.sunscreen || card.other_products) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Productos utilizados</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {card.cleanser && <div><span className="text-muted-foreground">Limpiador:</span> {card.cleanser}</div>}
                          {card.toner && <div><span className="text-muted-foreground">Tónico:</span> {card.toner}</div>}
                          {card.serum && <div><span className="text-muted-foreground">Sérum:</span> {card.serum}</div>}
                          {card.moisturizer && <div><span className="text-muted-foreground">Hidratante:</span> {card.moisturizer}</div>}
                          {card.sunscreen && <div><span className="text-muted-foreground">Protector solar:</span> {card.sunscreen}</div>}
                          {card.other_products && <div><span className="text-muted-foreground">Otros:</span> {card.other_products}</div>}
                        </div>
                      </div>
                    )}

                    {/* Rutina en casa */}
                    {(card.daily_cleansing || card.hydration || card.special_treatments || card.home_sunscreen || card.home_other_products || card.routine_observations) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Rutina facial en casa</p>
                        <div className="grid grid-cols-2 gap-2">
                          {card.daily_cleansing && <div><span className="text-muted-foreground">Limpieza:</span> {card.daily_cleansing}</div>}
                          {card.hydration && <div><span className="text-muted-foreground">Hidratación:</span> {card.hydration}</div>}
                          {card.special_treatments && <div><span className="text-muted-foreground">Tratamientos:</span> {card.special_treatments}</div>}
                          {card.home_sunscreen && <div><span className="text-muted-foreground">Protector:</span> {card.home_sunscreen}</div>}
                          {card.home_other_products && <div><span className="text-muted-foreground">Otros:</span> {card.home_other_products}</div>}
                        </div>
                        {card.routine_observations && <div><span className="text-muted-foreground">Observaciones:</span> {card.routine_observations}</div>}
                      </div>
                    )}

                    {/* Reacciones */}
                    {card.treatment_reactions && card.treatment_reactions.length > 0 && (
                      <div><span className="text-muted-foreground">Reacciones:</span> {card.treatment_reactions.join(", ")}{card.treatment_reactions.includes("Otros") && card.treatment_reactions_other ? ` (${card.treatment_reactions_other})` : ""}</div>
                    )}

                    {/* Cierre */}
                    {(card.final_observations || card.professional_recommendations) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Cierre</p>
                        {card.final_observations && <div><span className="text-muted-foreground">Observaciones finales:</span> {card.final_observations}</div>}
                        {card.professional_recommendations && <div><span className="text-muted-foreground">Recomendaciones:</span> {card.professional_recommendations}</div>}
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

export default FacialSkinCards;
