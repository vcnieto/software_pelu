import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Plus, Brush, ChevronDown, ChevronUp, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface MakeupProfessionalCard {
  id: string;
  date: string;
  phone: string | null;
  email: string | null;

  skin_type: string | null;
  skin_sensitivity: string | null;
  phototype: string | null;
  skin_alterations: string[] | null;
  skin_alterations_other: string | null;
  general_observations: string | null;

  makeup_type: string | null;
  makeup_type_other: string | null;
  style: string | null;
  style_other: string | null;
  previous_treatments: string | null;
  occasion_observations: string | null;

  base_concealer: string | null;
  powders_highlighter: string | null;
  eyes_products: string | null;
  lips_products: string | null;
  other_products: string | null;
  exposure_time: string | null;

  tools_techniques: string | null;

  reactions: string[] | null;
  reactions_other: string | null;

  professional_notes: string | null;
  created_at: string;
}

interface MakeupProfessionalCardsProps {
  clientId: string;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Grasa", "Sensible"];
const SKIN_SENSITIVITY = ["Baja", "Media", "Alta"];
const PHOTOTYPES = ["I", "II", "III", "IV", "V", "VI"];
const SKIN_ALTERATIONS = [
  "Acné",
  "Rosácea",
  "Manchas",
  "Melasma",
  "Deshidratación",
  "Flacidez",
  "Otro",
];

const MAKEUP_TYPES = ["Social", "Profesional", "Nupcial", "Fotografía", "Fallera", "Otro"];
const MAKEUP_STYLES = ["Natural", "Smokey", "Glam", "Artístico", "Otro"];

const REACTIONS = ["Ninguna", "Enrojecimiento", "Sensibilidad", "Picor", "Otro"];

const MakeupProfessionalCards = ({ clientId, clientName, clientPhone, clientEmail }: MakeupProfessionalCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<MakeupProfessionalCard[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<MakeupProfessionalCard | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const getInitialForm = () => ({
    date: new Date(),
    phone: clientPhone || "",
    email: clientEmail || "",

    skin_type: "",
    skin_sensitivity: "",
    phototype: "",
    skin_alterations: [] as string[],
    skin_alterations_other: "",
    general_observations: "",

    makeup_type: "",
    makeup_type_other: "",
    style: "",
    style_other: "",
    previous_treatments: "",
    occasion_observations: "",

    base_concealer: "",
    powders_highlighter: "",
    eyes_products: "",
    lips_products: "",
    other_products: "",
    exposure_time: "",

    tools_techniques: "",

    reactions: [] as string[],
    reactions_other: "",

    professional_notes: "",
  });

  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    fetchCards();
  }, [clientId]);

  const fetchCards = async () => {
    const { data, error } = await (supabase
      .from("makeup_professional_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);
    if (error) {
      console.error("Error fetching makeup professional cards:", error);
    }
    setCards((data as MakeupProfessionalCard[]) || []);
  };

  const resetForm = () => {
    setForm(getInitialForm());
    setEditingCard(null);
  };

  const toggleArrayItem = (arr: string[], item: string, setter: (arr: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      setter([...arr, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Usuario no autenticado");
      return;
    }

    const payload = {
      user_id: user.id,
      client_id: clientId,
      date: format(form.date, "yyyy-MM-dd"),
      phone: form.phone || null,
      email: form.email || null,

      skin_type: form.skin_type || null,
      skin_sensitivity: form.skin_sensitivity || null,
      phototype: form.phototype || null,
      skin_alterations: form.skin_alterations.length > 0 ? form.skin_alterations : null,
      skin_alterations_other: form.skin_alterations.includes("Otro") ? form.skin_alterations_other || null : null,
      general_observations: form.general_observations || null,

      makeup_type: form.makeup_type || null,
      makeup_type_other: form.makeup_type === "Otro" ? form.makeup_type_other || null : null,
      style: form.style || null,
      style_other: form.style === "Otro" ? form.style_other || null : null,
      previous_treatments: form.previous_treatments || null,
      occasion_observations: form.occasion_observations || null,

      base_concealer: form.base_concealer || null,
      powders_highlighter: form.powders_highlighter || null,
      eyes_products: form.eyes_products || null,
      lips_products: form.lips_products || null,
      other_products: form.other_products || null,
      exposure_time: form.exposure_time || null,

      tools_techniques: form.tools_techniques || null,

      reactions: form.reactions.length > 0 ? form.reactions : null,
      reactions_other: form.reactions.includes("Otro") ? form.reactions_other || null : null,

      professional_notes: form.professional_notes || null,
    };

    if (editingCard) {
      const { error } = await (supabase
        .from("makeup_professional_cards" as any)
        .update(payload)
        .eq("id", editingCard.id) as any);
      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await (supabase
        .from("makeup_professional_cards" as any)
        .insert(payload) as any);
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

  const handleEdit = (card: MakeupProfessionalCard) => {
    setEditingCard(card);
    setForm({
      date: new Date(card.date),
      phone: card.phone || "",
      email: card.email || "",

      skin_type: card.skin_type || "",
      skin_sensitivity: card.skin_sensitivity || "",
      phototype: card.phototype || "",
      skin_alterations: card.skin_alterations || [],
      skin_alterations_other: card.skin_alterations_other || "",
      general_observations: card.general_observations || "",

      makeup_type: card.makeup_type || "",
      makeup_type_other: card.makeup_type_other || "",
      style: card.style || "",
      style_other: card.style_other || "",
      previous_treatments: card.previous_treatments || "",
      occasion_observations: card.occasion_observations || "",

      base_concealer: card.base_concealer || "",
      powders_highlighter: card.powders_highlighter || "",
      eyes_products: card.eyes_products || "",
      lips_products: card.lips_products || "",
      other_products: card.other_products || "",
      exposure_time: card.exposure_time || "",

      tools_techniques: card.tools_techniques || "",

      reactions: card.reactions || [],
      reactions_other: card.reactions_other || "",

      professional_notes: card.professional_notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    const { error } = await (supabase
      .from("makeup_professional_cards" as any)
      .delete()
      .eq("id", cardId) as any);
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brush className="w-5 h-5 text-amber-600" />
          Ficha Técnica de Maquillaje Profesional
        </h3>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard
                  ? "Editar Ficha Técnica de Maquillaje Profesional"
                  : `Nueva Ficha Técnica de Maquillaje Profesional - ${clientName}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Datos generales</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha *</Label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.date && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.date
                            ? format(form.date, "PPP", { locale: es })
                            : "Seleccionar"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.date}
                          onSelect={(d) => {
                            if (d) {
                              setForm({ ...form, date: d });
                              setDateOpen(false);
                            }
                          }}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="Teléfono"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>

              {/* Características del cliente */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Características del cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sensibilidad de la piel</Label>
                    <Select
                      value={form.skin_sensitivity}
                      onValueChange={(v) => setForm({ ...form, skin_sensitivity: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_SENSITIVITY.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fototipo</Label>
                    <Select
                      value={form.phototype}
                      onValueChange={(v) => setForm({ ...form, phototype: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {PHOTOTYPES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Alteraciones cutáneas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {SKIN_ALTERATIONS.map((alt) => (
                      <div key={alt} className="flex items-center space-x-2">
                        <Checkbox
                          id={`alt-${alt}`}
                          checked={form.skin_alterations.includes(alt)}
                          onCheckedChange={() =>
                            toggleArrayItem(
                              form.skin_alterations,
                              alt,
                              (arr) => setForm({ ...form, skin_alterations: arr }),
                            )
                          }
                        />
                        <label htmlFor={`alt-${alt}`} className="text-sm">
                          {alt}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.skin_alterations.includes("Otro") && (
                    <Input
                      className="mt-2"
                      value={form.skin_alterations_other}
                      onChange={(e) =>
                        setForm({ ...form, skin_alterations_other: e.target.value })
                      }
                      placeholder="Especificar otras alteraciones"
                    />
                  )}
                </div>

                <div>
                  <Label>Observaciones generales</Label>
                  <Textarea
                    value={form.general_observations}
                    onChange={(e) =>
                      setForm({ ...form, general_observations: e.target.value })
                    }
                    placeholder="Información adicional sobre la piel del cliente"
                  />
                </div>
              </div>

              {/* Maquillaje solicitado / ocasión */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Maquillaje solicitado / ocasión</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de maquillaje</Label>
                    <Select
                      value={form.makeup_type}
                      onValueChange={(v) => setForm({ ...form, makeup_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAKEUP_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.makeup_type === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.makeup_type_other}
                        onChange={(e) =>
                          setForm({ ...form, makeup_type_other: e.target.value })
                        }
                        placeholder="Especificar otro tipo de maquillaje"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Estilo preferido</Label>
                    <Select
                      value={form.style}
                      onValueChange={(v) => setForm({ ...form, style: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {MAKEUP_STYLES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.style === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.style_other}
                        onChange={(e) =>
                          setForm({ ...form, style_other: e.target.value })
                        }
                        placeholder="Especificar otro estilo"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tratamientos previos en la piel</Label>
                    <Textarea
                      value={form.previous_treatments}
                      onChange={(e) =>
                        setForm({ ...form, previous_treatments: e.target.value })
                      }
                      placeholder="Limpiezas, peelings, tratamientos recientes, etc."
                    />
                  </div>
                  <div>
                    <Label>Observaciones</Label>
                    <Textarea
                      value={form.occasion_observations}
                      onChange={(e) =>
                        setForm({ ...form, occasion_observations: e.target.value })
                      }
                      placeholder="Detalles de la ocasión, preferencias específicas, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Productos utilizados */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Productos utilizados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Base / corrector</Label>
                    <Input
                      value={form.base_concealer}
                      onChange={(e) =>
                        setForm({ ...form, base_concealer: e.target.value })
                      }
                      placeholder="Marcas, tonos, tipo de base/corrector"
                    />
                  </div>
                  <div>
                    <Label>Polvos / iluminador</Label>
                    <Input
                      value={form.powders_highlighter}
                      onChange={(e) =>
                        setForm({ ...form, powders_highlighter: e.target.value })
                      }
                      placeholder="Productos usados para sellar e iluminar"
                    />
                  </div>
                  <div>
                    <Label>Sombras / delineador</Label>
                    <Input
                      value={form.eyes_products}
                      onChange={(e) =>
                        setForm({ ...form, eyes_products: e.target.value })
                      }
                      placeholder="Paletas, delineadores, acabados, etc."
                    />
                  </div>
                  <div>
                    <Label>Labial / brillo labial</Label>
                    <Input
                      value={form.lips_products}
                      onChange={(e) =>
                        setForm({ ...form, lips_products: e.target.value })
                      }
                      placeholder="Productos para labios"
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={form.other_products}
                      onChange={(e) =>
                        setForm({ ...form, other_products: e.target.value })
                      }
                      placeholder="Fijadores, primers, tratamientos, etc."
                    />
                  </div>
                  <div>
                    <Label>Tiempo de exposición (si aplica)</Label>
                    <Input
                      value={form.exposure_time}
                      onChange={(e) =>
                        setForm({ ...form, exposure_time: e.target.value })
                      }
                      placeholder="Tiempo aproximado de exposición"
                    />
                  </div>
                </div>
              </div>

              {/* Técnicas / herramientas */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Técnicas / herramientas utilizadas</h4>
                <Textarea
                  value={form.tools_techniques}
                  onChange={(e) =>
                    setForm({ ...form, tools_techniques: e.target.value })
                  }
                  placeholder="Pinceles, esponjas, aerógrafo u otras herramientas y técnicas"
                />
              </div>

              {/* Reacciones durante la aplicación */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Reacciones durante la aplicación</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {REACTIONS.map((r) => (
                    <div key={r} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reaction-${r}`}
                        checked={form.reactions.includes(r)}
                        onCheckedChange={() =>
                          toggleArrayItem(
                            form.reactions,
                            r,
                            (arr) => setForm({ ...form, reactions: arr }),
                          )
                        }
                      />
                      <label htmlFor={`reaction-${r}`} className="text-sm">
                        {r}
                      </label>
                    </div>
                  ))}
                </div>
                {form.reactions.includes("Otro") && (
                  <Input
                    className="mt-2"
                    value={form.reactions_other}
                    onChange={(e) =>
                      setForm({ ...form, reactions_other: e.target.value })
                    }
                    placeholder="Especificar otras reacciones"
                  />
                )}
              </div>

              {/* Observaciones del profesional */}
              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Observaciones del profesional</h4>
                <Textarea
                  value={form.professional_notes}
                  onChange={(e) =>
                    setForm({ ...form, professional_notes: e.target.value })
                  }
                  placeholder="Recomendaciones futuras, respuesta del cliente, ajustes a tener en cuenta, etc."
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCard ? "Guardar cambios" : "Guardar ficha"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No hay fichas de maquillaje profesional para este cliente
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
                    <Brush className="w-4 h-4 text-amber-600" />
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Ficha de Maquillaje Profesional
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(card.date), "d 'de' MMMM 'de' yyyy", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(card)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar ficha de maquillaje profesional?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. La ficha será eliminada
                            permanentemente.
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {card.phone && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Teléfono:
                          </span>{" "}
                          {card.phone}
                        </div>
                      )}
                      {card.email && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Email:
                          </span>{" "}
                          {card.email}
                        </div>
                      )}
                      {card.skin_type && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Tipo de piel:
                          </span>{" "}
                          {card.skin_type}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground border-b pb-1">
                        Características del cliente
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.skin_sensitivity && (
                          <div>
                            <span className="text-muted-foreground">
                              Sensibilidad:
                            </span>{" "}
                            {card.skin_sensitivity}
                          </div>
                        )}
                        {card.phototype && (
                          <div>
                            <span className="text-muted-foreground">Fototipo:</span>{" "}
                            {card.phototype}
                          </div>
                        )}
                        {card.skin_alterations && card.skin_alterations.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              Alteraciones cutáneas:
                            </span>{" "}
                            {card.skin_alterations.join(", ")}
                            {card.skin_alterations.includes("Otro") &&
                            card.skin_alterations_other
                              ? ` (${card.skin_alterations_other})`
                              : ""}
                          </div>
                        )}
                      </div>
                      {card.general_observations && (
                        <div>
                          <span className="text-muted-foreground">
                            Observaciones generales:
                          </span>{" "}
                          {card.general_observations}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground border-b pb-1">
                        Maquillaje solicitado / ocasión
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {card.makeup_type && (
                          <div>
                            <span className="text-muted-foreground">Tipo:</span>{" "}
                            {card.makeup_type}
                            {card.makeup_type === "Otro" && card.makeup_type_other
                              ? ` (${card.makeup_type_other})`
                              : ""}
                          </div>
                        )}
                        {card.style && (
                          <div>
                            <span className="text-muted-foreground">Estilo:</span>{" "}
                            {card.style}
                            {card.style === "Otro" && card.style_other
                              ? ` (${card.style_other})`
                              : ""}
                          </div>
                        )}
                      </div>
                      {card.previous_treatments && (
                        <div>
                          <span className="text-muted-foreground">
                            Tratamientos previos:
                          </span>{" "}
                          {card.previous_treatments}
                        </div>
                      )}
                      {card.occasion_observations && (
                        <div>
                          <span className="text-muted-foreground">Observaciones:</span>{" "}
                          {card.occasion_observations}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground border-b pb-1">
                        Productos utilizados
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.base_concealer && (
                          <div>
                            <span className="text-muted-foreground">
                              Base/corrector:
                            </span>{" "}
                            {card.base_concealer}
                          </div>
                        )}
                        {card.powders_highlighter && (
                          <div>
                            <span className="text-muted-foreground">
                              Polvos/iluminador:
                            </span>{" "}
                            {card.powders_highlighter}
                          </div>
                        )}
                        {card.eyes_products && (
                          <div>
                            <span className="text-muted-foreground">
                              Sombras/delineador:
                            </span>{" "}
                            {card.eyes_products}
                          </div>
                        )}
                        {card.lips_products && (
                          <div>
                            <span className="text-muted-foreground">
                              Labios:
                            </span>{" "}
                            {card.lips_products}
                          </div>
                        )}
                        {card.other_products && (
                          <div>
                            <span className="text-muted-foreground">
                              Otros productos:
                            </span>{" "}
                            {card.other_products}
                          </div>
                        )}
                        {card.exposure_time && (
                          <div>
                            <span className="text-muted-foreground">
                              Tiempo exposición:
                            </span>{" "}
                            {card.exposure_time}
                          </div>
                        )}
                      </div>
                    </div>

                    {card.tools_techniques && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Técnicas / herramientas utilizadas
                        </p>
                        <p>{card.tools_techniques}</p>
                      </div>
                    )}

                    {card.reactions && card.reactions.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Reacciones durante la aplicación
                        </p>
                        <p>
                          <span className="text-muted-foreground">Reacciones:</span>{" "}
                          {card.reactions.join(", ")}
                          {card.reactions.includes("Otro") && card.reactions_other
                            ? ` (${card.reactions_other})`
                            : ""}
                        </p>
                      </div>
                    )}

                    {card.professional_notes && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Observaciones del profesional
                        </p>
                        <p>{card.professional_notes}</p>
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

export default MakeupProfessionalCards;
