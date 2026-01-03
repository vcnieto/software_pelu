import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MassageDlmCard {
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
  general_observations: string | null;
  uses_massage: boolean | null;
  uses_dlm: boolean | null;
  massage_time: string | null;
  dlm_time: string | null;
  treated_zones: string | null;
  oils_creams: string | null;
  gel_lotion: string | null;
  other_products: string | null;
  treatment_reactions: string[] | null;
  treatment_reactions_other: string | null;
  final_observations: string | null;
}

interface Professional {
  id: string;
  name: string;
  specialty: string;
}

interface MassageDlmCardsProps {
  clientId: string;
}

const SKIN_TYPES = ["Normal", "Seca", "Mixta", "Sensible", "Grasa", "Otro"];
const SKIN_SENSITIVITIES = ["Baja", "Media", "Alta"];
const SKIN_ALTERATIONS = [
  "Ninguna", "Lesiones", "Inflamación", "Edemas", "Varices", 
  "Celulitis", "Cicatrices", "Moretones / hematomas", "Quemaduras", 
  "Erupciones / dermatitis", "Otro"
];
const TREATMENT_REACTIONS = ["Ninguna", "Enrojecimiento", "Sensibilidad", "Dolor", "Mareo", "Otro"];

export function MassageDlmCards({ clientId }: MassageDlmCardsProps) {
  const { user } = useAuth();
  const [cards, setCards] = useState<MassageDlmCard[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<MassageDlmCard | null>(null);
  const [formData, setFormData] = useState<Partial<MassageDlmCard>>({});

  useEffect(() => {
    if (clientId) {
      fetchCards();
      fetchProfessionals();
    }
  }, [clientId]);

  const fetchCards = async () => {
    const { data, error } = await (supabase
      .from("massage_dlm_cards" as any)
      .select("*")
      .eq("client_id", clientId)
      .order("date", { ascending: false }) as any);

    if (error) {
      console.error("Error fetching massage/dlm cards:", error);
      return;
    }
    setCards(data || []);
  };

  const fetchProfessionals = async () => {
    const { data, error } = await supabase
      .from("professionals")
      .select("id, name, specialty")
      .order("name");

    if (error) {
      console.error("Error fetching professionals:", error);
      return;
    }
    setProfessionals(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cardData = {
      ...formData,
      user_id: user.id,
      client_id: clientId,
    };

    if (editingCard) {
      const { error } = await (supabase
        .from("massage_dlm_cards" as any)
        .update(cardData)
        .eq("id", editingCard.id) as any);

      if (error) {
        toast.error("Error al actualizar la ficha");
        return;
      }
      toast.success("Ficha actualizada correctamente");
    } else {
      const { error } = await (supabase
        .from("massage_dlm_cards" as any)
        .insert([cardData]) as any);

      if (error) {
        toast.error("Error al crear la ficha");
        return;
      }
      toast.success("Ficha creada correctamente");
    }

    setIsDialogOpen(false);
    setEditingCard(null);
    setFormData({});
    fetchCards();
  };

  const handleDelete = async (id: string) => {
    const { error } = await (supabase
      .from("massage_dlm_cards" as any)
      .delete()
      .eq("id", id) as any);

    if (error) {
      toast.error("Error al eliminar la ficha");
      return;
    }
    toast.success("Ficha eliminada correctamente");
    fetchCards();
  };

  const openEditDialog = (card: MassageDlmCard) => {
    setEditingCard(card);
    setFormData(card);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingCard(null);
    setFormData({ date: new Date().toISOString().split("T")[0] });
    setIsDialogOpen(true);
  };

  const handleMultiSelect = (field: "skin_alterations" | "treatment_reactions", value: string) => {
    const current = formData[field] || [];
    if (current.includes(value)) {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HandHeart className="h-5 w-5 text-emerald-500" />
          Fichas de Masaje y DLM
        </h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={openNewDialog}>
              <Plus className="h-4 w-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Editar Ficha de Masaje y DLM" : "Nueva Ficha de Masaje y DLM"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos generales */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Datos Generales</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha</Label>
                    <Input
                      type="date"
                      value={formData.date || ""}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Edad</Label>
                    <Input
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
                    />
                  </div>
                  <div>
                    <Label>Número de sesión</Label>
                    <Input
                      type="number"
                      value={formData.session_number || ""}
                      onChange={(e) => setFormData({ ...formData, session_number: parseInt(e.target.value) || null })}
                    />
                  </div>
                  <div>
                    <Label>Profesional</Label>
                    <Select
                      value={formData.professional_id || ""}
                      onValueChange={(value) => setFormData({ ...formData, professional_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar profesional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} - {p.specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Nº de matrícula / registro del profesional</Label>
                    <Input
                      value={formData.professional_registration || ""}
                      onChange={(e) => setFormData({ ...formData, professional_registration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Características del cliente */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Características del Cliente</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de piel</Label>
                    <Select
                      value={formData.skin_type || ""}
                      onValueChange={(value) => setFormData({ ...formData, skin_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.skin_type === "Otro" && (
                    <div>
                      <Label>Especificar tipo de piel</Label>
                      <Input
                        value={formData.skin_type_other || ""}
                        onChange={(e) => setFormData({ ...formData, skin_type_other: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Sensibilidad de la piel</Label>
                    <Select
                      value={formData.skin_sensitivity || ""}
                      onValueChange={(value) => setFormData({ ...formData, skin_sensitivity: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_SENSITIVITIES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Alteraciones o lesiones en la piel</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {SKIN_ALTERATIONS.map((alt) => (
                      <div key={alt} className="flex items-center space-x-2">
                        <Checkbox
                          id={`alt-${alt}`}
                          checked={(formData.skin_alterations || []).includes(alt)}
                          onCheckedChange={() => handleMultiSelect("skin_alterations", alt)}
                        />
                        <Label htmlFor={`alt-${alt}`} className="text-sm font-normal">{alt}</Label>
                      </div>
                    ))}
                  </div>
                  {(formData.skin_alterations || []).includes("Otro") && (
                    <Input
                      className="mt-2"
                      placeholder="Especificar otra alteración"
                      value={formData.skin_alterations_other || ""}
                      onChange={(e) => setFormData({ ...formData, skin_alterations_other: e.target.value })}
                    />
                  )}
                </div>

                <div>
                  <Label>Observaciones generales</Label>
                  <Textarea
                    value={formData.general_observations || ""}
                    onChange={(e) => setFormData({ ...formData, general_observations: e.target.value })}
                  />
                </div>
              </div>

              {/* Tipo de masaje / técnica */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Tipo de Masaje / Técnica Utilizada</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uses_massage"
                      checked={formData.uses_massage || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, uses_massage: !!checked })}
                    />
                    <Label htmlFor="uses_massage">Masaje</Label>
                  </div>
                  <div>
                    <Label>Tiempo de masaje</Label>
                    <Input
                      value={formData.massage_time || ""}
                      onChange={(e) => setFormData({ ...formData, massage_time: e.target.value })}
                      placeholder="ej: 30 min"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="uses_dlm"
                      checked={formData.uses_dlm || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, uses_dlm: !!checked })}
                    />
                    <Label htmlFor="uses_dlm">DLM</Label>
                  </div>
                  <div>
                    <Label>Tiempo de DLM</Label>
                    <Input
                      value={formData.dlm_time || ""}
                      onChange={(e) => setFormData({ ...formData, dlm_time: e.target.value })}
                      placeholder="ej: 45 min"
                    />
                  </div>
                </div>
              </div>

              {/* Zonas tratadas */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Zonas Tratadas</h4>
                <Textarea
                  value={formData.treated_zones || ""}
                  onChange={(e) => setFormData({ ...formData, treated_zones: e.target.value })}
                  placeholder="Describir las zonas tratadas..."
                />
              </div>

              {/* Productos usados */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Productos Usados</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Aceites / cremas</Label>
                    <Input
                      value={formData.oils_creams || ""}
                      onChange={(e) => setFormData({ ...formData, oils_creams: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Gel / loción específica</Label>
                    <Input
                      value={formData.gel_lotion || ""}
                      onChange={(e) => setFormData({ ...formData, gel_lotion: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Otros productos</Label>
                    <Input
                      value={formData.other_products || ""}
                      onChange={(e) => setFormData({ ...formData, other_products: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Reacciones durante el tratamiento */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Reacciones Durante el Tratamiento</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TREATMENT_REACTIONS.map((reaction) => (
                    <div key={reaction} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reaction-${reaction}`}
                        checked={(formData.treatment_reactions || []).includes(reaction)}
                        onCheckedChange={() => handleMultiSelect("treatment_reactions", reaction)}
                      />
                      <Label htmlFor={`reaction-${reaction}`} className="text-sm font-normal">{reaction}</Label>
                    </div>
                  ))}
                </div>
                {(formData.treatment_reactions || []).includes("Otro") && (
                  <Input
                    placeholder="Especificar otra reacción"
                    value={formData.treatment_reactions_other || ""}
                    onChange={(e) => setFormData({ ...formData, treatment_reactions_other: e.target.value })}
                  />
                )}
              </div>

              {/* Observaciones finales */}
              <div className="space-y-4">
                <h4 className="font-semibold border-b pb-2">Observaciones Finales</h4>
                <Textarea
                  value={formData.final_observations || ""}
                  onChange={(e) => setFormData({ ...formData, final_observations: e.target.value })}
                  placeholder="Observaciones finales del tratamiento..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCard ? "Guardar Cambios" : "Crear Ficha"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No hay fichas de masaje/DLM para este cliente
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id}>
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {format(new Date(card.date), "d 'de' MMMM, yyyy", { locale: es })}
                    {card.session_number && ` - Sesión ${card.session_number}`}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(card)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
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
                          <AlertDialogAction onClick={() => handleDelete(card.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {card.uses_massage && <span className="text-muted-foreground">Masaje: {card.massage_time || "Sí"}</span>}
                  {card.uses_dlm && <span className="text-muted-foreground">DLM: {card.dlm_time || "Sí"}</span>}
                  {card.treated_zones && <span className="text-muted-foreground col-span-2">Zonas: {card.treated_zones}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
