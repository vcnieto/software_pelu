import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Heart, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ClientCard {
  id: string;
  card_type: "health" | "waxing";
  diseases: string | null;
  allergies: string | null;
  medication: string | null;
  treated_zone: string | null;
  hair_type: string | null;
  wax_type: string | null;
  product_batch: string | null;
  reactions: string | null;
  observations: string | null;
  created_at: string;
}

interface ClientCardsProps {
  clientId: string;
  clientName: string;
}

const ClientCards = ({ clientId, clientName }: ClientCardsProps) => {
  const { user } = useAuth();
  const [cards, setCards] = useState<ClientCard[]>([]);
  const [open, setOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [cardType, setCardType] = useState<"health" | "waxing">("health");
  const [form, setForm] = useState({
    diseases: "",
    allergies: "",
    medication: "",
    treated_zone: "",
    hair_type: "",
    wax_type: "",
    product_batch: "",
    reactions: "",
    observations: "",
  });

  useEffect(() => {
    fetchCards();
  }, [clientId]);

  const fetchCards = async () => {
    const { data } = await supabase
      .from("cards")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    setCards((data as ClientCard[]) || []);
  };

  const resetForm = () => {
    setForm({
      diseases: "",
      allergies: "",
      medication: "",
      treated_zone: "",
      hair_type: "",
      wax_type: "",
      product_batch: "",
      reactions: "",
      observations: "",
    });
    setCardType("health");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      user_id: user!.id,
      client_id: clientId,
      card_type: cardType,
      diseases: cardType === "health" ? form.diseases || null : null,
      allergies: cardType === "health" ? form.allergies || null : null,
      medication: cardType === "health" ? form.medication || null : null,
      treated_zone: cardType === "waxing" ? form.treated_zone || null : null,
      hair_type: cardType === "waxing" ? form.hair_type || null : null,
      wax_type: cardType === "waxing" ? form.wax_type || null : null,
      product_batch: cardType === "waxing" ? form.product_batch || null : null,
      reactions: cardType === "waxing" ? form.reactions || null : null,
      observations: form.observations || null,
    };

    const { error } = await supabase.from("cards").insert(cardData);
    
    if (error) {
      toast.error("Error al crear la ficha");
      return;
    }
    
    toast.success("Ficha creada correctamente");
    setOpen(false);
    resetForm();
    fetchCards();
  };

  const toggleExpand = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const getCardIcon = (type: "health" | "waxing") => {
    return type === "health" ? (
      <Heart className="w-4 h-4 text-rose-500" />
    ) : (
      <Sparkles className="w-4 h-4 text-amber-500" />
    );
  };

  const getCardLabel = (type: "health" | "waxing") => {
    return type === "health" ? "Ficha de Salud" : "Ficha de Depilación";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Fichas de {clientName}
        </h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Nueva Ficha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Ficha para {clientName}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo de ficha *</Label>
                <Select value={cardType} onValueChange={(v: "health" | "waxing") => setCardType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="health">
                      <span className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        Ficha de Salud
                      </span>
                    </SelectItem>
                    <SelectItem value="waxing">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Ficha de Depilación
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {cardType === "health" && (
                <>
                  <div>
                    <Label>Enfermedades</Label>
                    <Textarea
                      value={form.diseases}
                      onChange={(e) => setForm({ ...form, diseases: e.target.value })}
                      placeholder="Enfermedades conocidas..."
                    />
                  </div>
                  <div>
                    <Label>Alergias</Label>
                    <Textarea
                      value={form.allergies}
                      onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                      placeholder="Alergias conocidas..."
                    />
                  </div>
                  <div>
                    <Label>Medicación habitual</Label>
                    <Textarea
                      value={form.medication}
                      onChange={(e) => setForm({ ...form, medication: e.target.value })}
                      placeholder="Medicación que toma habitualmente..."
                    />
                  </div>
                </>
              )}

              {cardType === "waxing" && (
                <>
                  <div>
                    <Label>Zona tratada</Label>
                    <Input
                      value={form.treated_zone}
                      onChange={(e) => setForm({ ...form, treated_zone: e.target.value })}
                      placeholder="Ej: piernas, axilas, ingles..."
                    />
                  </div>
                  <div>
                    <Label>Tipo de pelo</Label>
                    <Input
                      value={form.hair_type}
                      onChange={(e) => setForm({ ...form, hair_type: e.target.value })}
                      placeholder="Ej: fino, grueso, medio..."
                    />
                  </div>
                  <div>
                    <Label>Tipo de cera utilizada</Label>
                    <Input
                      value={form.wax_type}
                      onChange={(e) => setForm({ ...form, wax_type: e.target.value })}
                      placeholder="Ej: cera tibia, cera fría..."
                    />
                  </div>
                  <div>
                    <Label>Lote del producto</Label>
                    <Input
                      value={form.product_batch}
                      onChange={(e) => setForm({ ...form, product_batch: e.target.value })}
                      placeholder="Número de lote..."
                    />
                  </div>
                  <div>
                    <Label>Reacciones observadas</Label>
                    <Textarea
                      value={form.reactions}
                      onChange={(e) => setForm({ ...form, reactions: e.target.value })}
                      placeholder="Reacciones durante o después del tratamiento..."
                    />
                  </div>
                </>
              )}

              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={form.observations}
                  onChange={(e) => setForm({ ...form, observations: e.target.value })}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <Button type="submit" className="w-full">
                Guardar Ficha
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">
          No hay fichas registradas para este cliente
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <Card key={card.id} className="overflow-hidden">
              <CardHeader
                className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleExpand(card.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCardIcon(card.card_type)}
                    <div>
                      <CardTitle className="text-sm font-medium">
                        {getCardLabel(card.card_type)}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(card.created_at), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  {expandedCard === card.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              
              {expandedCard === card.id && (
                <CardContent className="py-3 px-4 border-t bg-muted/30">
                  <div className="grid gap-3 text-sm">
                    {card.card_type === "health" && (
                      <>
                        {card.diseases && (
                          <div>
                            <span className="font-medium text-muted-foreground">Enfermedades:</span>
                            <p className="mt-0.5">{card.diseases}</p>
                          </div>
                        )}
                        {card.allergies && (
                          <div>
                            <span className="font-medium text-muted-foreground">Alergias:</span>
                            <p className="mt-0.5">{card.allergies}</p>
                          </div>
                        )}
                        {card.medication && (
                          <div>
                            <span className="font-medium text-muted-foreground">Medicación:</span>
                            <p className="mt-0.5">{card.medication}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {card.card_type === "waxing" && (
                      <>
                        {card.treated_zone && (
                          <div>
                            <span className="font-medium text-muted-foreground">Zona tratada:</span>
                            <p className="mt-0.5">{card.treated_zone}</p>
                          </div>
                        )}
                        {card.hair_type && (
                          <div>
                            <span className="font-medium text-muted-foreground">Tipo de pelo:</span>
                            <p className="mt-0.5">{card.hair_type}</p>
                          </div>
                        )}
                        {card.wax_type && (
                          <div>
                            <span className="font-medium text-muted-foreground">Tipo de cera:</span>
                            <p className="mt-0.5">{card.wax_type}</p>
                          </div>
                        )}
                        {card.product_batch && (
                          <div>
                            <span className="font-medium text-muted-foreground">Lote del producto:</span>
                            <p className="mt-0.5">{card.product_batch}</p>
                          </div>
                        )}
                        {card.reactions && (
                          <div>
                            <span className="font-medium text-muted-foreground">Reacciones:</span>
                            <p className="mt-0.5">{card.reactions}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    {card.observations && (
                      <div>
                        <span className="font-medium text-muted-foreground">Observaciones:</span>
                        <p className="mt-0.5">{card.observations}</p>
                      </div>
                    )}
                    
                    {!card.diseases && !card.allergies && !card.medication && 
                     !card.treated_zone && !card.hair_type && !card.wax_type && 
                     !card.product_batch && !card.reactions && !card.observations && (
                      <p className="text-muted-foreground italic">Sin información adicional</p>
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

export default ClientCards;
