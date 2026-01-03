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
import { Plus, Sparkles, ChevronDown, ChevronUp, Pencil, Trash2, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface VisagismCard {
  id: string;
  date: string;
  phone: string | null;
  email: string | null;
  face_shape: string | null;
  face_shape_other: string | null;
  forehead: string | null;
  cheekbones: string | null;
  cheekbones_other: string | null;
  jawline: string | null;
  jawline_other: string | null;
  nose: string | null;
  nose_other: string | null;
  lips: string | null;
  eyes: string | null;
  eyebrows: string | null;
  eyebrows_other: string | null;
  highlight_features: string | null;
  correct_features: string | null;
  makeup_types: string[] | null;
  makeup_types_other: string | null;
  recommended_colors: string | null;
  recommended_techniques: string[] | null;
  recommended_techniques_other: string | null;
  additional_notes: string | null;
  created_at: string;
}

interface VisagismCardsProps {
  clientId: string;
  clientName: string;
  clientPhone?: string | null;
  clientEmail?: string | null;
}

const FACE_SHAPES = ["Ovalado", "Redondo", "Cuadrado", "Corazón", "Alargado", "Diamante", "Otro"];
const FOREHEAD_OPTIONS = ["Alta", "Media", "Baja"];
const CHEEKBONES_OPTIONS = ["Marcados", "Suaves", "Otro"];
const JAWLINE_OPTIONS = ["Angular", "Redondeada", "Otro"];
const NOSE_OPTIONS = ["Grande", "Pequeña", "Recta", "Otra"];
const LIPS_OPTIONS = ["Finos", "Medianos", "Gruesos"];
const EYES_OPTIONS = ["Almendrados", "Redondos", "Hundidos", "Saltones"];
const EYEBROWS_OPTIONS = ["Rectas", "Arqueadas", "Redondeadas", "Otra"];

const MAKEUP_TYPES = ["Natural", "Dramático", "Artístico", "Otro"];
const TECHNIQUES = ["Contouring", "Iluminación", "Corrección de cejas", "Otra"];

const VisagismCards = ({ clientId, clientName, clientPhone, clientEmail }: VisagismCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<VisagismCard[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<VisagismCard | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const getInitialForm = () => ({
    date: new Date(),
    phone: clientPhone || "",
    email: clientEmail || "",
    face_shape: "",
    face_shape_other: "",
    forehead: "",
    cheekbones: "",
    cheekbones_other: "",
    jawline: "",
    jawline_other: "",
    nose: "",
    nose_other: "",
    lips: "",
    eyes: "",
    eyebrows: "",
    eyebrows_other: "",
    highlight_features: "",
    correct_features: "",
    makeup_types: [] as string[],
    makeup_types_other: "",
    recommended_colors: "",
    recommended_techniques: [] as string[],
    recommended_techniques_other: "",
    additional_notes: "",
  });

  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    fetchCards();
  }, [clientId]);

  const fetchCards = async () => {
    const { data, error } = await (supabase
      .from("visagism_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);
    if (error) {
      console.error("Error fetching visagism cards:", error);
    }
    setCards((data as VisagismCard[]) || []);
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
      face_shape: form.face_shape || null,
      face_shape_other: form.face_shape === "Otro" ? form.face_shape_other || null : null,
      forehead: form.forehead || null,
      cheekbones: form.cheekbones || null,
      cheekbones_other: form.cheekbones === "Otro" ? form.cheekbones_other || null : null,
      jawline: form.jawline || null,
      jawline_other: form.jawline === "Otro" ? form.jawline_other || null : null,
      nose: form.nose || null,
      nose_other: form.nose === "Otra" ? form.nose_other || null : null,
      lips: form.lips || null,
      eyes: form.eyes || null,
      eyebrows: form.eyebrows || null,
      eyebrows_other: form.eyebrows === "Otra" ? form.eyebrows_other || null : null,
      highlight_features: form.highlight_features || null,
      correct_features: form.correct_features || null,
      makeup_types: form.makeup_types.length > 0 ? form.makeup_types : null,
      makeup_types_other: form.makeup_types.includes("Otro") ? form.makeup_types_other || null : null,
      recommended_colors: form.recommended_colors || null,
      recommended_techniques: form.recommended_techniques.length > 0 ? form.recommended_techniques : null,
      recommended_techniques_other: form.recommended_techniques.includes("Otra") ? form.recommended_techniques_other || null : null,
      additional_notes: form.additional_notes || null,
    };

    if (editingCard) {
      const { error } = await (supabase
        .from("visagism_cards" as any)
        .update(payload)
        .eq("id", editingCard.id) as any);
      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await (supabase
        .from("visagism_cards" as any)
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

  const handleEdit = (card: VisagismCard) => {
    setEditingCard(card);
    setForm({
      date: new Date(card.date),
      phone: card.phone || "",
      email: card.email || "",
      face_shape: card.face_shape || "",
      face_shape_other: card.face_shape_other || "",
      forehead: card.forehead || "",
      cheekbones: card.cheekbones || "",
      cheekbones_other: card.cheekbones_other || "",
      jawline: card.jawline || "",
      jawline_other: card.jawline_other || "",
      nose: card.nose || "",
      nose_other: card.nose_other || "",
      lips: card.lips || "",
      eyes: card.eyes || "",
      eyebrows: card.eyebrows || "",
      eyebrows_other: card.eyebrows_other || "",
      highlight_features: card.highlight_features || "",
      correct_features: card.correct_features || "",
      makeup_types: card.makeup_types || [],
      makeup_types_other: card.makeup_types_other || "",
      recommended_colors: card.recommended_colors || "",
      recommended_techniques: card.recommended_techniques || [],
      recommended_techniques_other: card.recommended_techniques_other || "",
      additional_notes: card.additional_notes || "",
    });
    setOpen(true);
  };

  const handleDelete = async (cardId: string) => {
    const { error } = await (supabase
      .from("visagism_cards" as any)
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
          <Sparkles className="w-5 h-5 text-pink-600" />
          Ficha Técnica de Visagismo
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
                  ? "Editar Ficha Técnica de Visagismo"
                  : `Nueva Ficha Técnica de Visagismo - ${clientName}`}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            !form.date && "text-muted-foreground"
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

              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">Análisis del rostro</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Forma del rostro</Label>
                    <Select
                      value={form.face_shape}
                      onValueChange={(v) => setForm({ ...form, face_shape: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FACE_SHAPES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.face_shape === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.face_shape_other}
                        onChange={(e) =>
                          setForm({ ...form, face_shape_other: e.target.value })
                        }
                        placeholder="Especificar otra forma"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Frente</Label>
                    <Select
                      value={form.forehead}
                      onValueChange={(v) => setForm({ ...form, forehead: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOREHEAD_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Pómulos</Label>
                    <Select
                      value={form.cheekbones}
                      onValueChange={(v) => setForm({ ...form, cheekbones: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {CHEEKBONES_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.cheekbones === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.cheekbones_other}
                        onChange={(e) =>
                          setForm({ ...form, cheekbones_other: e.target.value })
                        }
                        placeholder="Especificar"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Mandíbula</Label>
                    <Select
                      value={form.jawline}
                      onValueChange={(v) => setForm({ ...form, jawline: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {JAWLINE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.jawline === "Otro" && (
                      <Input
                        className="mt-2"
                        value={form.jawline_other}
                        onChange={(e) =>
                          setForm({ ...form, jawline_other: e.target.value })
                        }
                        placeholder="Especificar"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Nariz</Label>
                    <Select
                      value={form.nose}
                      onValueChange={(v) => setForm({ ...form, nose: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {NOSE_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.nose === "Otra" && (
                      <Input
                        className="mt-2"
                        value={form.nose_other}
                        onChange={(e) =>
                          setForm({ ...form, nose_other: e.target.value })
                        }
                        placeholder="Especificar"
                      />
                    )}
                  </div>
                  <div>
                    <Label>Labios</Label>
                    <Select
                      value={form.lips}
                      onValueChange={(v) => setForm({ ...form, lips: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIPS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ojos</Label>
                    <Select
                      value={form.eyes}
                      onValueChange={(v) => setForm({ ...form, eyes: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EYES_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Cejas</Label>
                    <Select
                      value={form.eyebrows}
                      onValueChange={(v) => setForm({ ...form, eyebrows: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {EYEBROWS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.eyebrows === "Otra" && (
                      <Input
                        className="mt-2"
                        value={form.eyebrows_other}
                        onChange={(e) =>
                          setForm({ ...form, eyebrows_other: e.target.value })
                        }
                        placeholder="Especificar"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">
                  Rasgos a resaltar / corregir
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Rasgos a resaltar</Label>
                    <Textarea
                      value={form.highlight_features}
                      onChange={(e) =>
                        setForm({ ...form, highlight_features: e.target.value })
                      }
                      placeholder="Rasgos que se quieren potenciar"
                    />
                  </div>
                  <div>
                    <Label>Rasgos a corregir</Label>
                    <Textarea
                      value={form.correct_features}
                      onChange={(e) =>
                        setForm({ ...form, correct_features: e.target.value })
                      }
                      placeholder="Rasgos que se quieren disimular o equilibrar"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">
                  Recomendaciones estéticas
                </h4>
                <div className="space-y-3">
                  <Label>Tipos de maquillaje sugeridos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {MAKEUP_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`mk-${type}`}
                          checked={form.makeup_types.includes(type)}
                          onCheckedChange={() =>
                            toggleArrayItem(
                              form.makeup_types,
                              type,
                              (arr) => setForm({ ...form, makeup_types: arr })
                            )
                          }
                        />
                        <label htmlFor={`mk-${type}`} className="text-sm">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.makeup_types.includes("Otro") && (
                    <Input
                      className="mt-2"
                      value={form.makeup_types_other}
                      onChange={(e) =>
                        setForm({ ...form, makeup_types_other: e.target.value })
                      }
                      placeholder="Especificar otros estilos de maquillaje"
                    />
                  )}
                </div>

                <div>
                  <Label>Colores recomendados</Label>
                  <Input
                    value={form.recommended_colors}
                    onChange={(e) =>
                      setForm({ ...form, recommended_colors: e.target.value })
                    }
                    placeholder="Gama de colores sugerida (ojos, labios, mejillas, etc.)"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Técnicas recomendadas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TECHNIQUES.map((t) => (
                      <div key={t} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tech-${t}`}
                          checked={form.recommended_techniques.includes(t)}
                          onCheckedChange={() =>
                            toggleArrayItem(
                              form.recommended_techniques,
                              t,
                              (arr) =>
                                setForm({
                                  ...form,
                                  recommended_techniques: arr,
                                })
                            )
                          }
                        />
                        <label htmlFor={`tech-${t}`} className="text-sm">
                          {t}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.recommended_techniques.includes("Otra") && (
                    <Input
                      className="mt-2"
                      value={form.recommended_techniques_other}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          recommended_techniques_other: e.target.value,
                        })
                      }
                      placeholder="Especificar otras técnicas"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-sm border-b pb-2">
                  Observaciones adicionales
                </h4>
                <Textarea
                  value={form.additional_notes}
                  onChange={(e) =>
                    setForm({ ...form, additional_notes: e.target.value })
                  }
                  placeholder="Notas adicionales sobre visagismo, recomendaciones personalizadas, etc."
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
          No hay fichas de visagismo para este cliente
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
                    <Sparkles className="w-4 h-4 text-pink-600" />
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Ficha de Visagismo
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
                            Eliminar ficha de visagismo?
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
                      {card.face_shape && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Forma del rostro:
                          </span>{" "}
                          {card.face_shape}
                          {card.face_shape === "Otro" && card.face_shape_other
                            ? ` (${card.face_shape_other})`
                            : ""}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium text-muted-foreground border-b pb-1">
                        Rasgos faciales
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {card.forehead && (
                          <div>
                            <span className="text-muted-foreground">Frente:</span>{" "}
                            {card.forehead}
                          </div>
                        )}
                        {card.cheekbones && (
                          <div>
                            <span className="text-muted-foreground">Pómulos:</span>{" "}
                            {card.cheekbones}
                            {card.cheekbones === "Otro" && card.cheekbones_other
                              ? ` (${card.cheekbones_other})`
                              : ""}
                          </div>
                        )}
                        {card.jawline && (
                          <div>
                            <span className="text-muted-foreground">Mandíbula:</span>{" "}
                            {card.jawline}
                            {card.jawline === "Otro" && card.jawline_other
                              ? ` (${card.jawline_other})`
                              : ""}
                          </div>
                        )}
                        {card.nose && (
                          <div>
                            <span className="text-muted-foreground">Nariz:</span>{" "}
                            {card.nose}
                            {card.nose === "Otra" && card.nose_other
                              ? ` (${card.nose_other})`
                              : ""}
                          </div>
                        )}
                        {card.lips && (
                          <div>
                            <span className="text-muted-foreground">Labios:</span>{" "}
                            {card.lips}
                          </div>
                        )}
                        {card.eyes && (
                          <div>
                            <span className="text-muted-foreground">Ojos:</span>{" "}
                            {card.eyes}
                          </div>
                        )}
                        {card.eyebrows && (
                          <div>
                            <span className="text-muted-foreground">Cejas:</span>{" "}
                            {card.eyebrows}
                            {card.eyebrows === "Otra" && card.eyebrows_other
                              ? ` (${card.eyebrows_other})`
                              : ""}
                          </div>
                        )}
                      </div>
                    </div>

                    {(card.highlight_features || card.correct_features) && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Rasgos a resaltar / corregir
                        </p>
                        {card.highlight_features && (
                          <div>
                            <span className="text-muted-foreground">
                              A resaltar:
                            </span>{" "}
                            {card.highlight_features}
                          </div>
                        )}
                        {card.correct_features && (
                          <div>
                            <span className="text-muted-foreground">
                              A corregir:
                            </span>{" "}
                            {card.correct_features}
                          </div>
                        )}
                      </div>
                    )}

                    {(card.makeup_types || card.recommended_colors || card.recommended_techniques) && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Recomendaciones estéticas
                        </p>
                        {card.makeup_types && card.makeup_types.length > 0 && (
                          <div>
                            <span className="text-muted-foreground">
                              Tipos de maquillaje:
                            </span>{" "}
                            {card.makeup_types.join(", ")}
                            {card.makeup_types.includes("Otro") &&
                            card.makeup_types_other
                              ? ` (${card.makeup_types_other})`
                              : ""}
                          </div>
                        )}
                        {card.recommended_colors && (
                          <div>
                            <span className="text-muted-foreground">
                              Colores recomendados:
                            </span>{" "}
                            {card.recommended_colors}
                          </div>
                        )}
                        {card.recommended_techniques &&
                          card.recommended_techniques.length > 0 && (
                            <div>
                              <span className="text-muted-foreground">
                                Técnicas:
                              </span>{" "}
                              {card.recommended_techniques.join(", ")}
                              {card.recommended_techniques.includes("Otra") &&
                              card.recommended_techniques_other
                                ? ` (${card.recommended_techniques_other})`
                                : ""}
                            </div>
                          )}
                      </div>
                    )}

                    {card.additional_notes && (
                      <div className="space-y-1">
                        <p className="font-medium text-muted-foreground border-b pb-1">
                          Observaciones adicionales
                        </p>
                        <p>{card.additional_notes}</p>
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

export default VisagismCards;
