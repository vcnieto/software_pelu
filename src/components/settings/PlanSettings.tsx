import { useBusinessSettings } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "Gestión completa de clientes",
  "Calendario y citas ilimitadas",
  "Gestión de servicios",
  "Gestión de profesionales",
  "Fichas técnicas completas",
  "Subir logo personalizado",
  "6 paletas de colores",
];

const PREMIUM_FEATURES = [
  "Todo lo del plan gratuito",
  "Colores 100% personalizables",
  "Tipografías premium",
  "Favicon personalizado",
  "Soporte prioritario",
  "Recordatorios WhatsApp (próximamente)",
  "Estadísticas avanzadas (próximamente)",
];

const PlanSettings = () => {
  const { settings, isPremium, loading } = useBusinessSettings();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPremium ? (
                  <Crown className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                Tu Plan Actual
              </CardTitle>
              <CardDescription className="mt-1">
                {isPremium
                  ? "Tienes acceso a todas las funcionalidades premium"
                  : "Estás usando el plan gratuito"}
              </CardDescription>
            </div>
            <Badge
              variant={isPremium ? "default" : "secondary"}
              className={cn("text-sm px-3 py-1", isPremium && "bg-gradient-to-r from-yellow-500 to-orange-500")}
            >
              {isPremium ? "Premium" : "Gratuito"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Funcionalidades incluidas:</h4>
            <ul className="space-y-2">
              {(isPremium ? PREMIUM_FEATURES : FREE_FEATURES).map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Card (only show for free users) */}
      {!isPremium && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Plan Premium</CardTitle>
                <CardDescription>
                  Lleva tu negocio al siguiente nivel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">9,99€</span>
              <span className="text-muted-foreground">/mes</span>
            </div>

            <ul className="space-y-3">
              {PREMIUM_FEATURES.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="w-full gap-2">
              <Sparkles className="w-4 h-4" />
              Actualizar a Premium
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Cancela cuando quieras. Sin permanencia.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Facturación</CardTitle>
          <CardDescription>
            Tus facturas y pagos anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay facturas disponibles</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanSettings;
