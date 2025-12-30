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
import { Plus, ClipboardList, ChevronDown, ChevronUp, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AestheticHistoryCard {
  id: string;
  date: string;
  birth_date: string | null;
  age: number | null;
  profession: string | null;
  phone: string | null;
  email: string | null;
  current_past_diseases: string | null;
  chronic_diseases: string | null;
  allergies: string | null;
  regular_medication: string | null;
  previous_surgeries: string | null;
  previous_aesthetic_treatments: string | null;
  family_history: string | null;
  sensitivities_contraindications: string | null;
  has_prosthesis: boolean | null;
  prosthesis_type: string | null;
  is_pregnant: boolean | null;
  is_breastfeeding: boolean | null;
  skin_type: string | null;
  phototype: string | null;
  skin_alterations: string[] | null;
  skin_alterations_other: string | null;
  previous_treatment_reactions: string | null;
  daily_water_consumption: string | null;
  diet: string[] | null;
  physical_activity: string | null;
  sleep_hours: string | null;
  stress_level: string | null;
  emotional_state: string | null;
  emotional_observations: string | null;
  smokes: boolean | null;
  smoking_quantity: string | null;
  alcohol_consumption: string | null;
  diuresis: string | null;
  intestinal_habit: string | null;
  regular_menstrual_cycle: boolean | null;
  previous_pregnancies: boolean | null;
  pregnancies_count: number | null;
  menopause: boolean | null;
  menopause_age: number | null;
  hormonal_treatments: string | null;
  main_interest_area: string | null;
  main_interest_area_other: string | null;
  specific_objectives: string | null;
  professional_observations: string | null;
  client_signature: string | null;
  signature_date: string | null;
  professional_signature: string | null;
  created_at: string;
}

interface AestheticHistoryCardsProps {
  clientId: string;
  clientName: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Grasa", "Sensible"];
const PHOTOTYPES = ["I", "II", "III", "IV", "V", "VI"];
const SKIN_ALTERATIONS = ["Acné", "Rosácea", "Manchas", "Melasma", "Deshidratación", "Flacidez", "Celulitis", "Estrías", "Otra"];
const WATER_CONSUMPTION = ["< 1L", "1–2L", "> 2L"];
const DIET_OPTIONS = ["Equilibrada", "Irregular", "Rica en grasas", "Rica en azúcares", "Vegetariana / Vegana"];
const PHYSICAL_ACTIVITY = ["Ninguna", "Ocasional", "Regular", "Intensa"];
const SLEEP_HOURS = ["< 6", "6–7", "7–8", "> 8"];
const STRESS_LEVELS = ["Bajo", "Medio", "Alto"];
const ALCOHOL_OPTIONS = ["No", "Ocasional", "Frecuente"];
const DIURESIS_OPTIONS = ["Normal", "Disminuida", "Aumentada"];
const INTESTINAL_HABIT = ["Regular", "Estreñimiento", "Diarrea"];
const INTEREST_AREAS = ["Facial", "Corporal", "Capilar", "Otro"];

const AestheticHistoryCards = ({ clientId, clientName }: AestheticHistoryCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<AestheticHistoryCard[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<AestheticHistoryCard | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [birthDateOpen, setBirthDateOpen] = useState(false);
  const [signatureDateOpen, setSignatureDateOpen] = useState(false);

  const getInitialForm = () => ({
    date: new Date(),
    birth_date: null as Date | null,
    age: "",
    profession: "",
    phone: "",
    email: "",
    current_past_diseases: "",
    chronic_diseases: "",
    allergies: "",
    regular_medication: "",
    previous_surgeries: "",
    previous_aesthetic_treatments: "",
    family_history: "",
    sensitivities_contraindications: "",
    has_prosthesis: false,
    prosthesis_type: "",
    is_pregnant: false,
    is_breastfeeding: false,
    skin_type: "",
    phototype: "",
    skin_alterations: [] as string[],
    skin_alterations_other: "",
    previous_treatment_reactions: "",
    daily_water_consumption: "",
    diet: [] as string[],
    physical_activity: "",
    sleep_hours: "",
    stress_level: "",
    emotional_state: "",
    emotional_observations: "",
    smokes: false,
    smoking_quantity: "",
    alcohol_consumption: "",
    diuresis: "",
    intestinal_habit: "",
    regular_menstrual_cycle: false,
    previous_pregnancies: false,
    pregnancies_count: "",
    menopause: false,
    menopause_age: "",
    hormonal_treatments: "",
    main_interest_area: "",
    main_interest_area_other: "",
    specific_objectives: "",
    professional_observations: "",
    client_signature: "",
    signature_date: null as Date | null,
    professional_signature: "",
  });

  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    fetchCards();
  }, [clientId]);

  const fetchCards = async () => {
    const { data } = await supabase
      .from("aesthetic_history_cards")
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false });
    setCards((data as AestheticHistoryCard[]) || []);
  };

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingCard(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cardData = {
      user_id: user!.id,
      client_id: clientId,
      date: format(form.date, "yyyy-MM-dd"),
      birth_date: form.birth_date ? format(form.birth_date, "yyyy-MM-dd") : null,
      age: form.age ? parseInt(form.age) : null,
      profession: form.profession || null,
      phone: form.phone || null,
      email: form.email || null,
      current_past_diseases: form.current_past_diseases || null,
      chronic_diseases: form.chronic_diseases || null,
      allergies: form.allergies || null,
      regular_medication: form.regular_medication || null,
      previous_surgeries: form.previous_surgeries || null,
      previous_aesthetic_treatments: form.previous_aesthetic_treatments || null,
      family_history: form.family_history || null,
      sensitivities_contraindications: form.sensitivities_contraindications || null,
      has_prosthesis: form.has_prosthesis,
      prosthesis_type: form.has_prosthesis ? form.prosthesis_type || null : null,
      is_pregnant: form.is_pregnant,
      is_breastfeeding: form.is_breastfeeding,
      skin_type: form.skin_type || null,
      phototype: form.phototype || null,
      skin_alterations: form.skin_alterations.length > 0 ? form.skin_alterations : null,
      skin_alterations_other: form.skin_alterations.includes("Otra") ? form.skin_alterations_other || null : null,
      previous_treatment_reactions: form.previous_treatment_reactions || null,
      daily_water_consumption: form.daily_water_consumption || null,
      diet: form.diet.length > 0 ? form.diet : null,
      physical_activity: form.physical_activity || null,
      sleep_hours: form.sleep_hours || null,
      stress_level: form.stress_level || null,
      emotional_state: form.emotional_state || null,
      emotional_observations: form.emotional_observations || null,
      smokes: form.smokes,
      smoking_quantity: form.smokes ? form.smoking_quantity || null : null,
      alcohol_consumption: form.alcohol_consumption || null,
      diuresis: form.diuresis || null,
      intestinal_habit: form.intestinal_habit || null,
      regular_menstrual_cycle: form.regular_menstrual_cycle,
      previous_pregnancies: form.previous_pregnancies,
      pregnancies_count: form.previous_pregnancies && form.pregnancies_count ? parseInt(form.pregnancies_count) : null,
      menopause: form.menopause,
      menopause_age: form.menopause && form.menopause_age ? parseInt(form.menopause_age) : null,
      hormonal_treatments: form.hormonal_treatments || null,
      main_interest_area: form.main_interest_area || null,
      main_interest_area_other: form.main_interest_area === "Otro" ? form.main_interest_area_other || null : null,
      specific_objectives: form.specific_objectives || null,
      professional_observations: form.professional_observations || null,
      client_signature: form.client_signature || null,
      signature_date: form.signature_date ? format(form.signature_date, "yyyy-MM-dd") : null,
      professional_signature: form.professional_signature || null,
    };

    if (editingCard) {
      const { error } = await supabase.from("aesthetic_history_cards").update(cardData).eq("id", editingCard.id);
      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await supabase.from("aesthetic_history_cards").insert(cardData);
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

  const handleEdit = (card: AestheticHistoryCard) => {
    setEditingCard(card);
    setForm({
      date: new Date(card.date),
      birth_date: card.birth_date ? new Date(card.birth_date) : null,
      age: card.age?.toString() || "",
      profession: card.profession || "",
      phone: card.phone || "",
      email: card.email || "",
      current_past_diseases: card.current_past_diseases || "",
      chronic_diseases: card.chronic_diseases || "",
      allergies: card.allergies || "",
      regular_medication: card.regular_medication || "",
      previous_surgeries: card.previous_surgeries || "",
      previous_aesthetic_treatments: card.previous_aesthetic_treatments || "",
      family_history: card.family_history || "",
      sensitivities_contraindications: card.sensitivities_contraindications || "",
      has_prosthesis: card.has_prosthesis || false,
      prosthesis_type: card.prosthesis_type || "",
      is_pregnant: card.is_pregnant || false,
      is_breastfeeding: card.is_breastfeeding || false,
      skin_type: card.skin_type || "",
      phototype: card.phototype || "",
      skin_alterations: card.skin_alterations || [],
      skin_alterations_other: card.skin_alterations_other || "",
      previous_treatment_reactions: card.previous_treatment_reactions || "",
      daily_water_consumption: card.daily_water_consumption || "",
      diet: card.diet || [],
      physical_activity: card.physical_activity || "",
      sleep_hours: card.sleep_hours || "",
      stress_level: card.stress_level || "",
      emotional_state: card.emotional_state || "",
      emotional_observations: card.emotional_observations || "",
      smokes: card.smokes || false,
      smoking_quantity: card.smoking_quantity || "",
      alcohol_consumption: card.alcohol_consumption || "",
      diuresis: card.diuresis || "",
      intestinal_habit: card.intestinal_habit || "",
      regular_menstrual_cycle: card.regular_menstrual_cycle || false,
      previous_pregnancies: card.previous_pregnancies || false,
      pregnancies_count: card.pregnancies_count?.toString() || "",
      menopause: card.menopause || false,
      menopause_age: card.menopause_age?.toString() || "",
      hormonal_treatments: card.hormonal_treatments || "",
      main_interest_area: card.main_interest_area || "",
      main_interest_area_other: card.main_interest_area_other || "",
      specific_objectives: card.specific_objectives || "",
      professional_observations: card.professional_observations || "",
      client_signature: card.client_signature || "",
      signature_date: card.signature_date ? new Date(card.signature_date) : null,
      professional_signature: card.professional_signature || "",
    });
    setOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    const { error } = await supabase.from("aesthetic_history_cards").delete().eq("id", cardId);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-violet-600" />
          Historial Integral Estético
        </h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Editar Historial Integral Estético" : `Nuevo Historial Integral Estético - ${clientName}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales del cliente */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Datos Generales del Cliente</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date ? format(form.date, "PPP", { locale: es }) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.date} onSelect={(d) => { if (d) { setForm({ ...form, date: d }); setDateOpen(false); } }} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Fecha de nacimiento</Label>
                    <Popover open={birthDateOpen} onOpenChange={setBirthDateOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.birth_date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.birth_date ? format(form.birth_date, "PPP", { locale: es }) : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={form.birth_date || undefined} onSelect={(d) => { setForm({ ...form, birth_date: d || null }); setBirthDateOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div><Label>Edad</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="Años" /></div>
                  <div><Label>Profesión</Label><Input value={form.profession} onChange={(e) => setForm({ ...form, profession: e.target.value })} placeholder="Profesión" /></div>
                  <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Teléfono" /></div>
                  <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" /></div>
                </div>
              </div>

              {/* Datos generales de salud */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Datos Generales de Salud</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Enfermedades actuales o pasadas</Label><Textarea value={form.current_past_diseases} onChange={(e) => setForm({ ...form, current_past_diseases: e.target.value })} placeholder="Enfermedades..." /></div>
                  <div><Label>Enfermedades crónicas</Label><Textarea value={form.chronic_diseases} onChange={(e) => setForm({ ...form, chronic_diseases: e.target.value })} placeholder="Enfermedades crónicas..." /></div>
                  <div><Label>Alergias</Label><Textarea value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} placeholder="Medicamentos, cosméticos, alimentos..." /></div>
                  <div><Label>Medicación habitual</Label><Textarea value={form.regular_medication} onChange={(e) => setForm({ ...form, regular_medication: e.target.value })} placeholder="Medicación..." /></div>
                  <div><Label>Intervenciones quirúrgicas previas</Label><Textarea value={form.previous_surgeries} onChange={(e) => setForm({ ...form, previous_surgeries: e.target.value })} placeholder="Cirugías previas..." /></div>
                  <div><Label>Tratamientos médico-estéticos previos</Label><Textarea value={form.previous_aesthetic_treatments} onChange={(e) => setForm({ ...form, previous_aesthetic_treatments: e.target.value })} placeholder="Tratamientos previos..." /></div>
                  <div><Label>Historial familiar</Label><Textarea value={form.family_history} onChange={(e) => setForm({ ...form, family_history: e.target.value })} placeholder="Enfermedades hereditarias..." /></div>
                  <div><Label>Sensibilidades y contraindicaciones</Label><Textarea value={form.sensitivities_contraindications} onChange={(e) => setForm({ ...form, sensitivities_contraindications: e.target.value })} placeholder="Frío, calor, sol, fragancias..." /></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="prosthesis" checked={form.has_prosthesis} onCheckedChange={(c) => setForm({ ...form, has_prosthesis: c === true })} />
                      <label htmlFor="prosthesis" className="text-sm">Prótesis</label>
                    </div>
                    {form.has_prosthesis && <Input value={form.prosthesis_type} onChange={(e) => setForm({ ...form, prosthesis_type: e.target.value })} placeholder="Tipo de prótesis" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pregnant" checked={form.is_pregnant} onCheckedChange={(c) => setForm({ ...form, is_pregnant: c === true })} />
                    <label htmlFor="pregnant" className="text-sm">Embarazo actual</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="breastfeeding" checked={form.is_breastfeeding} onCheckedChange={(c) => setForm({ ...form, is_breastfeeding: c === true })} />
                    <label htmlFor="breastfeeding" className="text-sm">Lactancia</label>
                  </div>
                </div>
              </div>

              {/* Historial dermatológico */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Historial Dermatológico y Estético</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel</Label>
                    <Select value={form.skin_type} onValueChange={(v) => setForm({ ...form, skin_type: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{SKIN_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fototipo</Label>
                    <Select value={form.phototype} onValueChange={(v) => setForm({ ...form, phototype: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{PHOTOTYPES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Alteraciones cutáneas</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {SKIN_ALTERATIONS.map((alt) => (
                      <div key={alt} className="flex items-center space-x-2">
                        <Checkbox id={`alt-${alt}`} checked={form.skin_alterations.includes(alt)} onCheckedChange={() => toggleArrayItem(form.skin_alterations, alt, (arr) => setForm({ ...form, skin_alterations: arr }))} />
                        <label htmlFor={`alt-${alt}`} className="text-sm">{alt}</label>
                      </div>
                    ))}
                  </div>
                  {form.skin_alterations.includes("Otra") && <Input className="mt-2" value={form.skin_alterations_other} onChange={(e) => setForm({ ...form, skin_alterations_other: e.target.value })} placeholder="Especificar..." />}
                </div>
                <div><Label>Reacciones previas a tratamientos estéticos</Label><Textarea value={form.previous_treatment_reactions} onChange={(e) => setForm({ ...form, previous_treatment_reactions: e.target.value })} placeholder="Reacciones previas..." /></div>
              </div>

              {/* Hábitos y estilo de vida */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Hábitos y Estilo de Vida</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Consumo de agua diario</Label>
                    <Select value={form.daily_water_consumption} onValueChange={(v) => setForm({ ...form, daily_water_consumption: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{WATER_CONSUMPTION.map((w) => (<SelectItem key={w} value={w}>{w}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Actividad física</Label>
                    <Select value={form.physical_activity} onValueChange={(v) => setForm({ ...form, physical_activity: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{PHYSICAL_ACTIVITY.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Horas de sueño</Label>
                    <Select value={form.sleep_hours} onValueChange={(v) => setForm({ ...form, sleep_hours: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{SLEEP_HOURS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nivel de estrés</Label>
                    <Select value={form.stress_level} onValueChange={(v) => setForm({ ...form, stress_level: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{STRESS_LEVELS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estado emocional</Label>
                    <Select value={form.emotional_state} onValueChange={(v) => setForm({ ...form, emotional_state: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{STRESS_LEVELS.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Alimentación</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {DIET_OPTIONS.map((d) => (
                      <div key={d} className="flex items-center space-x-2">
                        <Checkbox id={`diet-${d}`} checked={form.diet.includes(d)} onCheckedChange={() => toggleArrayItem(form.diet, d, (arr) => setForm({ ...form, diet: arr }))} />
                        <label htmlFor={`diet-${d}`} className="text-sm">{d}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div><Label>Observaciones estado emocional</Label><Input value={form.emotional_observations} onChange={(e) => setForm({ ...form, emotional_observations: e.target.value })} placeholder="Ansiedad, depresión u otras..." /></div>
              </div>

              {/* Otros hábitos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Otros Hábitos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="smokes" checked={form.smokes} onCheckedChange={(c) => setForm({ ...form, smokes: c === true })} />
                      <label htmlFor="smokes" className="text-sm">Tabaquismo</label>
                    </div>
                    {form.smokes && <Input value={form.smoking_quantity} onChange={(e) => setForm({ ...form, smoking_quantity: e.target.value })} placeholder="Cantidad" />}
                  </div>
                  <div>
                    <Label>Consumo de alcohol</Label>
                    <Select value={form.alcohol_consumption} onValueChange={(v) => setForm({ ...form, alcohol_consumption: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{ALCOHOL_OPTIONS.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Diuresis</Label>
                    <Select value={form.diuresis} onValueChange={(v) => setForm({ ...form, diuresis: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{DIURESIS_OPTIONS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Hábito intestinal</Label>
                    <Select value={form.intestinal_habit} onValueChange={(v) => setForm({ ...form, intestinal_habit: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{INTESTINAL_HABIT.map((h) => (<SelectItem key={h} value={h}>{h}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Salud hormonal */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Salud Hormonal y Fisiológica</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="menstrual" checked={form.regular_menstrual_cycle} onCheckedChange={(c) => setForm({ ...form, regular_menstrual_cycle: c === true })} />
                    <label htmlFor="menstrual" className="text-sm">Ciclo menstrual regular</label>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="prev_preg" checked={form.previous_pregnancies} onCheckedChange={(c) => setForm({ ...form, previous_pregnancies: c === true })} />
                      <label htmlFor="prev_preg" className="text-sm">Embarazos previos</label>
                    </div>
                    {form.previous_pregnancies && <Input type="number" value={form.pregnancies_count} onChange={(e) => setForm({ ...form, pregnancies_count: e.target.value })} placeholder="Número" />}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="menopause" checked={form.menopause} onCheckedChange={(c) => setForm({ ...form, menopause: c === true })} />
                      <label htmlFor="menopause" className="text-sm">Menopausia</label>
                    </div>
                    {form.menopause && <Input type="number" value={form.menopause_age} onChange={(e) => setForm({ ...form, menopause_age: e.target.value })} placeholder="Edad" />}
                  </div>
                </div>
                <div><Label>Tratamientos hormonales</Label><Input value={form.hormonal_treatments} onChange={(e) => setForm({ ...form, hormonal_treatments: e.target.value })} placeholder="Tratamientos hormonales..." /></div>
              </div>

              {/* Objetivos del cliente */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Objetivos del Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Área principal de interés</Label>
                    <Select value={form.main_interest_area} onValueChange={(v) => setForm({ ...form, main_interest_area: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>{INTEREST_AREAS.map((a) => (<SelectItem key={a} value={a}>{a}</SelectItem>))}</SelectContent>
                    </Select>
                    {form.main_interest_area === "Otro" && <Input className="mt-2" value={form.main_interest_area_other} onChange={(e) => setForm({ ...form, main_interest_area_other: e.target.value })} placeholder="Especificar..." />}
                  </div>
                </div>
                <div><Label>Objetivos específicos</Label><Textarea value={form.specific_objectives} onChange={(e) => setForm({ ...form, specific_objectives: e.target.value })} placeholder="Objetivos del cliente..." /></div>
              </div>

              {/* Observaciones y consentimiento */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Observaciones y Consentimiento</h4>
                <div><Label>Observaciones del profesional</Label><Textarea value={form.professional_observations} onChange={(e) => setForm({ ...form, professional_observations: e.target.value })} placeholder="Observaciones..." /></div>
                
                <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                  <p className="text-sm italic">"Declaro que la información facilitada es veraz y autorizo la realización de los tratamientos estéticos indicados."</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div><Label>Firma del cliente</Label><Input value={form.client_signature} onChange={(e) => setForm({ ...form, client_signature: e.target.value })} placeholder="Nombre completo" /></div>
                    <div>
                      <Label>Fecha de firma</Label>
                      <Popover open={signatureDateOpen} onOpenChange={setSignatureDateOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !form.signature_date && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {form.signature_date ? format(form.signature_date, "PPP", { locale: es }) : "Seleccionar"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={form.signature_date || undefined} onSelect={(d) => { setForm({ ...form, signature_date: d || null }); setSignatureDateOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div><Label>Firma del profesional</Label><Input value={form.professional_signature} onChange={(e) => setForm({ ...form, professional_signature: e.target.value })} placeholder="Nombre del profesional" /></div>
                  </div>
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
          No hay fichas de historial integral para este cliente
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => toggleExpand(card.id)}>
                    <ClipboardList className="w-4 h-4 text-violet-600" />
                    <div>
                      <CardTitle className="text-sm font-medium">Historial Integral Estético</CardTitle>
                      <p className="text-xs text-muted-foreground">{format(new Date(card.date), "d 'de' MMMM 'de' yyyy", { locale: es })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(card)}><Pencil className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar ficha?</AlertDialogTitle>
                          <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
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
                    <div className="space-y-2">
                      <p className="font-medium text-muted-foreground border-b pb-1">Datos generales</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.birth_date && <div><span className="text-muted-foreground">F. Nacimiento:</span> {format(new Date(card.birth_date), "dd/MM/yyyy")}</div>}
                        {card.age && <div><span className="text-muted-foreground">Edad:</span> {card.age} años</div>}
                        {card.profession && <div><span className="text-muted-foreground">Profesión:</span> {card.profession}</div>}
                        {card.phone && <div><span className="text-muted-foreground">Teléfono:</span> {card.phone}</div>}
                        {card.email && <div><span className="text-muted-foreground">Email:</span> {card.email}</div>}
                      </div>
                    </div>

                    {/* Salud */}
                    {(card.current_past_diseases || card.chronic_diseases || card.allergies || card.regular_medication) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Datos de salud</p>
                        <div className="grid gap-2">
                          {card.current_past_diseases && <div><span className="text-muted-foreground">Enfermedades:</span> {card.current_past_diseases}</div>}
                          {card.chronic_diseases && <div><span className="text-muted-foreground">Crónicas:</span> {card.chronic_diseases}</div>}
                          {card.allergies && <div><span className="text-muted-foreground">Alergias:</span> {card.allergies}</div>}
                          {card.regular_medication && <div><span className="text-muted-foreground">Medicación:</span> {card.regular_medication}</div>}
                          {card.has_prosthesis && <div><span className="text-muted-foreground">Prótesis:</span> {card.prosthesis_type || "Sí"}</div>}
                          {card.is_pregnant && <div><span className="text-muted-foreground">Embarazo:</span> Sí</div>}
                          {card.is_breastfeeding && <div><span className="text-muted-foreground">Lactancia:</span> Sí</div>}
                        </div>
                      </div>
                    )}

                    {/* Dermatológico */}
                    {(card.skin_type || card.phototype || card.skin_alterations) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Historial dermatológico</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {card.skin_type && <div><span className="text-muted-foreground">Tipo de piel:</span> {card.skin_type}</div>}
                          {card.phototype && <div><span className="text-muted-foreground">Fototipo:</span> {card.phototype}</div>}
                        </div>
                        {card.skin_alterations && card.skin_alterations.length > 0 && <div><span className="text-muted-foreground">Alteraciones:</span> {card.skin_alterations.join(", ")}</div>}
                      </div>
                    )}

                    {/* Objetivos */}
                    {(card.main_interest_area || card.specific_objectives) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Objetivos</p>
                        {card.main_interest_area && <div><span className="text-muted-foreground">Área de interés:</span> {card.main_interest_area}{card.main_interest_area === "Otro" && card.main_interest_area_other ? ` (${card.main_interest_area_other})` : ""}</div>}
                        {card.specific_objectives && <div><span className="text-muted-foreground">Objetivos:</span> {card.specific_objectives}</div>}
                      </div>
                    )}

                    {/* Consentimiento */}
                    {(card.client_signature || card.professional_signature) && (
                      <div className="space-y-2">
                        <p className="font-medium text-muted-foreground border-b pb-1">Consentimiento</p>
                        <div className="grid grid-cols-3 gap-2">
                          {card.client_signature && <div><span className="text-muted-foreground">Firma cliente:</span> {card.client_signature}</div>}
                          {card.signature_date && <div><span className="text-muted-foreground">Fecha:</span> {format(new Date(card.signature_date), "dd/MM/yyyy")}</div>}
                          {card.professional_signature && <div><span className="text-muted-foreground">Firma profesional:</span> {card.professional_signature}</div>}
                        </div>
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

export default AestheticHistoryCards;
