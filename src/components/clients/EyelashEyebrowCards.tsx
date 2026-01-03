import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface Professional {
  id: string;
  name: string;
}

interface EyelashEyebrowCard {
  id: string;
  date: string;
  age: number | null;
  session_number: number | null;
  professional_id: string | null;
  professional_registration: string | null;
  skin_type: string | null;
  skin_type_other: string | null;
  eye_eyelid_state: string | null;
  eye_eyelid_state_other: string | null;
  has_eye_diseases: boolean | null;
  eye_disease_details: string | null;
  eyebrow_shape: string | null;
  eyebrow_shape_other: string | null;
  lash_brow_length: string | null;
  lash_brow_thickness: string | null;
  eyebrow_hair_color: string | null;
  eyelash_hair_color: string | null;
  general_observations: string | null;
  treatment_performed: string | null;
  external_treatments: string | null;
  eyebrow_tint: string | null;
  eyelash_tint: string | null;
  perm_type: string | null;
  mold_type: string | null;
  mold_size: string | null;
  other_products: string | null;
  exposure_time: string | null;
  treatment_reactions: string[] | null;
  treatment_reactions_other: string | null;
  avoid_wet_rub: string | null;
  avoid_wet_rub_other: string | null;
  specific_products: string | null;
  additional_observations: string | null;
}

interface Props {
  clientId: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Sensible"];
const EYE_STATES = ["Perfectos", "Irritados", "Sensibles"];
const EYEBROW_SHAPES = ["Natural", "Arqueadas", "Rectas"];
const LENGTHS = ["Cortas", "Medias", "Largas"];
const THICKNESSES = ["Fino", "Medio", "Grueso"];
const REACTIONS = ["Ninguna", "Enrojecimiento", "Sensibilidad", "Irritación", "Lagrimeo", "Picazón"];
const AVOID_OPTIONS = ["24 h", "48 h"];

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  age: "",
  session_number: "",
  professional_id: "",
  professional_registration: "",
  skin_type: "",
  skin_type_other: "",
  eye_eyelid_state: "",
  eye_eyelid_state_other: "",
  has_eye_diseases: false,
  eye_disease_details: "",
  eyebrow_shape: "",
  eyebrow_shape_other: "",
  lash_brow_length: "",
  lash_brow_thickness: "",
  eyebrow_hair_color: "",
  eyelash_hair_color: "",
  general_observations: "",
  treatment_performed: "",
  external_treatments: "",
  eyebrow_tint: "",
  eyelash_tint: "",
  perm_type: "",
  mold_type: "",
  mold_size: "",
  other_products: "",
  exposure_time: "",
  treatment_reactions: [] as string[],
  treatment_reactions_other: "",
  avoid_wet_rub: "",
  avoid_wet_rub_other: "",
  specific_products: "",
  additional_observations: "",
};

export function EyelashEyebrowCards({ clientId }: Props) {
  const { user } = useAuth();
  const [cards, setCards] = useState<EyelashEyebrowCard[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EyelashEyebrowCard | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCards();
      fetchProfessionals();
    }
  }, [user, clientId]);

  const fetchCards = async () => {
    const { data } = await (supabase
      .from("eyelash_eyebrow_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);
    setCards(data || []);
  };

  const fetchProfessionals = async () => {
    const { data } = await supabase
      .from("professionals")
      .select("id, name")
      .order("name");
    setProfessionals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      user_id: user!.id,
      client_id: clientId,
      date: form.date,
      age: form.age ? parseInt(form.age) : null,
      session_number: form.session_number ? parseInt(form.session_number) : null,
      professional_id: form.professional_id || null,
      professional_registration: form.professional_registration || null,
      skin_type: form.skin_type === "Otro" ? "Otro" : form.skin_type || null,
      skin_type_other: form.skin_type === "Otro" ? form.skin_type_other : null,
      eye_eyelid_state: form.eye_eyelid_state === "Otro" ? "Otro" : form.eye_eyelid_state || null,
      eye_eyelid_state_other: form.eye_eyelid_state === "Otro" ? form.eye_eyelid_state_other : null,
      has_eye_diseases: form.has_eye_diseases,
      eye_disease_details: form.has_eye_diseases ? form.eye_disease_details : null,
      eyebrow_shape: form.eyebrow_shape === "Otro" ? "Otro" : form.eyebrow_shape || null,
      eyebrow_shape_other: form.eyebrow_shape === "Otro" ? form.eyebrow_shape_other : null,
      lash_brow_length: form.lash_brow_length || null,
      lash_brow_thickness: form.lash_brow_thickness || null,
      eyebrow_hair_color: form.eyebrow_hair_color || null,
      eyelash_hair_color: form.eyelash_hair_color || null,
      general_observations: form.general_observations || null,
      treatment_performed: form.treatment_performed || null,
      external_treatments: form.external_treatments || null,
      eyebrow_tint: form.eyebrow_tint || null,
      eyelash_tint: form.eyelash_tint || null,
      perm_type: form.perm_type || null,
      mold_type: form.mold_type || null,
      mold_size: form.mold_size || null,
      other_products: form.other_products || null,
      exposure_time: form.exposure_time || null,
      treatment_reactions: form.treatment_reactions.length > 0 ? form.treatment_reactions : null,
      treatment_reactions_other: form.treatment_reactions.includes("Otro") ? form.treatment_reactions_other : null,
      avoid_wet_rub: form.avoid_wet_rub === "Otro" ? "Otro" : form.avoid_wet_rub || null,
      avoid_wet_rub_other: form.avoid_wet_rub === "Otro" ? form.avoid_wet_rub_other : null,
      specific_products: form.specific_products || null,
      additional_observations: form.additional_observations || null,
    };

    if (editing) {
      await (supabase
        .from("eyelash_eyebrow_cards" as any)
        .update(payload)
        .eq("id", editing.id) as any);
      toast.success("Ficha actualizada");
    } else {
      await (supabase
        .from("eyelash_eyebrow_cards" as any)
        .insert(payload) as any);
      toast.success("Ficha creada");
    }

    setOpen(false);
    setEditing(null);
    setForm(emptyForm);
    fetchCards();
  };

  const handleEdit = (card: EyelashEyebrowCard) => {
    setEditing(card);
    setForm({
      date: card.date,
      age: card.age?.toString() || "",
      session_number: card.session_number?.toString() || "",
      professional_id: card.professional_id || "",
      professional_registration: card.professional_registration || "",
      skin_type: card.skin_type || "",
      skin_type_other: card.skin_type_other || "",
      eye_eyelid_state: card.eye_eyelid_state || "",
      eye_eyelid_state_other: card.eye_eyelid_state_other || "",
      has_eye_diseases: card.has_eye_diseases || false,
      eye_disease_details: card.eye_disease_details || "",
      eyebrow_shape: card.eyebrow_shape || "",
      eyebrow_shape_other: card.eyebrow_shape_other || "",
      lash_brow_length: card.lash_brow_length || "",
      lash_brow_thickness: card.lash_brow_thickness || "",
      eyebrow_hair_color: card.eyebrow_hair_color || "",
      eyelash_hair_color: card.eyelash_hair_color || "",
      general_observations: card.general_observations || "",
      treatment_performed: card.treatment_performed || "",
      external_treatments: card.external_treatments || "",
      eyebrow_tint: card.eyebrow_tint || "",
      eyelash_tint: card.eyelash_tint || "",
      perm_type: card.perm_type || "",
      mold_type: card.mold_type || "",
      mold_size: card.mold_size || "",
      other_products: card.other_products || "",
      exposure_time: card.exposure_time || "",
      treatment_reactions: card.treatment_reactions || [],
      treatment_reactions_other: card.treatment_reactions_other || "",
      avoid_wet_rub: card.avoid_wet_rub || "",
      avoid_wet_rub_other: card.avoid_wet_rub_other || "",
      specific_products: card.specific_products || "",
      additional_observations: card.additional_observations || "",
    });
    setOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await (supabase
        .from("eyelash_eyebrow_cards" as any)
        .delete()
        .eq("id", deleteId) as any);
      toast.success("Ficha eliminada");
      setDeleteId(null);
      fetchCards();
    }
  };

  const toggleReaction = (reaction: string) => {
    setForm((prev) => ({
      ...prev,
      treatment_reactions: prev.treatment_reactions.includes(reaction)
        ? prev.treatment_reactions.filter((r) => r !== reaction)
        : [...prev.treatment_reactions, reaction],
    }));
  };

  const getProfessionalName = (id: string | null) => {
    if (!id) return "Sin asignar";
    return professionals.find((p) => p.id === id)?.name || "Desconocido";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Eye className="w-5 h-5 text-violet-500" />
          Fichas de Pestañas y Cejas
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
                {editing ? "Editar" : "Nueva"} Ficha - Pestañas y Cejas
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Datos generales</h4>
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
                    <Label>Nº de sesión</Label>
                    <Input
                      type="number"
                      value={form.session_number}
                      onChange={(e) => setForm({ ...form, session_number: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Profesional</Label>
                    <Select
                      value={form.professional_id}
                      onValueChange={(v) => setForm({ ...form, professional_id: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Nº de matrícula / registro</Label>
                    <Input
                      value={form.professional_registration}
                      onChange={(e) => setForm({ ...form, professional_registration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Características</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel</Label>
                    <Select
                      value={form.skin_type}
                      onValueChange={(v) => setForm({ ...form, skin_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.skin_type === "Otro" && (
                      <Input
                        className="mt-2"
                        placeholder="Especificar..."
                        value={form.skin_type_other}
                        onChange={(e) => setForm({ ...form, skin_type_other: e.target.value })}
                      />
                    )}
                  </div>

                  <div>
                    <Label>Estado de ojos y párpados</Label>
                    <Select
                      value={form.eye_eyelid_state}
                      onValueChange={(v) => setForm({ ...form, eye_eyelid_state: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EYE_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.eye_eyelid_state === "Otro" && (
                      <Input
                        className="mt-2"
                        placeholder="Especificar..."
                        value={form.eye_eyelid_state_other}
                        onChange={(e) => setForm({ ...form, eye_eyelid_state_other: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Enfermedades oculares</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.has_eye_diseases}
                        onCheckedChange={(v) => setForm({ ...form, has_eye_diseases: v === true })}
                      />
                      <span className="text-sm">Sí</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={!form.has_eye_diseases}
                        onCheckedChange={(v) => setForm({ ...form, has_eye_diseases: v !== true })}
                      />
                      <span className="text-sm">No</span>
                    </div>
                  </div>
                  {form.has_eye_diseases && (
                    <Input
                      placeholder="Especificar enfermedad..."
                      value={form.eye_disease_details}
                      onChange={(e) => setForm({ ...form, eye_disease_details: e.target.value })}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Dirección / forma de cejas</Label>
                    <Select
                      value={form.eyebrow_shape}
                      onValueChange={(v) => setForm({ ...form, eyebrow_shape: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EYEBROW_SHAPES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.eyebrow_shape === "Otro" && (
                      <Input
                        className="mt-2"
                        placeholder="Especificar..."
                        value={form.eyebrow_shape_other}
                        onChange={(e) => setForm({ ...form, eyebrow_shape_other: e.target.value })}
                      />
                    )}
                  </div>

                  <div>
                    <Label>Longitud pestañas/cejas</Label>
                    <Select
                      value={form.lash_brow_length}
                      onValueChange={(v) => setForm({ ...form, lash_brow_length: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {LENGTHS.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Espesor pestañas/cejas</Label>
                    <Select
                      value={form.lash_brow_thickness}
                      onValueChange={(v) => setForm({ ...form, lash_brow_thickness: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {THICKNESSES.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Color pelo cejas</Label>
                    <Input
                      value={form.eyebrow_hair_color}
                      onChange={(e) => setForm({ ...form, eyebrow_hair_color: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Color pelo pestañas</Label>
                    <Input
                      value={form.eyelash_hair_color}
                      onChange={(e) => setForm({ ...form, eyelash_hair_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Observaciones generales</Label>
                  <Textarea
                    value={form.general_observations}
                    onChange={(e) => setForm({ ...form, general_observations: e.target.value })}
                  />
                </div>
              </div>

              {/* Tratamiento realizado */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Tratamiento realizado</h4>
                <div>
                  <Label>Tratamiento realizado</Label>
                  <Textarea
                    value={form.treatment_performed}
                    onChange={(e) => setForm({ ...form, treatment_performed: e.target.value })}
                  />
                </div>
              </div>

              {/* Tratamientos externos */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Tratamientos externos previos</h4>
                <div>
                  <Label>Tratamientos realizados fuera del centro</Label>
                  <Textarea
                    value={form.external_treatments}
                    onChange={(e) => setForm({ ...form, external_treatments: e.target.value })}
                  />
                </div>
              </div>

              {/* Productos usados */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Productos usados</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tinte de cejas</Label>
                    <Input
                      value={form.eyebrow_tint}
                      onChange={(e) => setForm({ ...form, eyebrow_tint: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tinte de pestañas</Label>
                    <Input
                      value={form.eyelash_tint}
                      onChange={(e) => setForm({ ...form, eyelash_tint: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tipo de permanente</Label>
                    <Input
                      value={form.perm_type}
                      onChange={(e) => setForm({ ...form, perm_type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tipo de molde</Label>
                    <Input
                      value={form.mold_type}
                      onChange={(e) => setForm({ ...form, mold_type: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tamaño del molde</Label>
                    <Input
                      value={form.mold_size}
                      onChange={(e) => setForm({ ...form, mold_size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Tiempo de exposición</Label>
                    <Input
                      value={form.exposure_time}
                      onChange={(e) => setForm({ ...form, exposure_time: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Otros productos</Label>
                    <Input
                      value={form.other_products}
                      onChange={(e) => setForm({ ...form, other_products: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Reacciones */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Reacciones durante el tratamiento</h4>
                <div className="flex flex-wrap gap-3">
                  {REACTIONS.map((reaction) => (
                    <div key={reaction} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.treatment_reactions.includes(reaction)}
                        onCheckedChange={() => toggleReaction(reaction)}
                      />
                      <span className="text-sm">{reaction}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={form.treatment_reactions.includes("Otro")}
                      onCheckedChange={() => toggleReaction("Otro")}
                    />
                    <span className="text-sm">Otro</span>
                  </div>
                </div>
                {form.treatment_reactions.includes("Otro") && (
                  <Input
                    placeholder="Especificar otra reacción..."
                    value={form.treatment_reactions_other}
                    onChange={(e) => setForm({ ...form, treatment_reactions_other: e.target.value })}
                  />
                )}
              </div>

              {/* Cuidado posterior */}
              <div className="space-y-4">
                <h4 className="font-medium border-b pb-2">Cuidado posterior / Recomendaciones</h4>
                <div>
                  <Label>Evitar mojar / frotar</Label>
                  <Select
                    value={form.avoid_wet_rub}
                    onValueChange={(v) => setForm({ ...form, avoid_wet_rub: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVOID_OPTIONS.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.avoid_wet_rub === "Otro" && (
                    <Input
                      className="mt-2"
                      placeholder="Especificar..."
                      value={form.avoid_wet_rub_other}
                      onChange={(e) => setForm({ ...form, avoid_wet_rub_other: e.target.value })}
                    />
                  )}
                </div>
                <div>
                  <Label>Uso de productos específicos</Label>
                  <Input
                    value={form.specific_products}
                    onChange={(e) => setForm({ ...form, specific_products: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Observaciones adicionales</Label>
                  <Textarea
                    value={form.additional_observations}
                    onChange={(e) => setForm({ ...form, additional_observations: e.target.value })}
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
        {cards.map((card) => (
          <Card key={card.id} className="card-hover">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium">
                    Sesión {card.session_number || "-"} -{" "}
                    {new Date(card.date).toLocaleDateString("es-ES")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Profesional: {getProfessionalName(card.professional_id)}
                  </p>
                  {card.treatment_performed && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      Tratamiento: {card.treatment_performed}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(card)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(card.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {cards.length === 0 && (
          <p className="text-muted-foreground text-sm py-4 text-center">
            No hay fichas de pestañas y cejas para este cliente
          </p>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta ficha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
