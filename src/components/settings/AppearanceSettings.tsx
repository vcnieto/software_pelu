import { useState } from "react";
import { useBusinessSettings, COLOR_PALETTES, ColorPaletteKey } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Lock, Sparkles, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import PremiumFeature from "./PremiumFeature";

const AppearanceSettings = () => {
  const { settings, updateSettings, isPremium, loading } = useBusinessSettings();
  const [selectedPalette, setSelectedPalette] = useState<ColorPaletteKey>(
    (settings?.color_palette as ColorPaletteKey) || "rose"
  );
  const [saving, setSaving] = useState(false);

  const handleSelectPalette = async (paletteKey: ColorPaletteKey) => {
    setSelectedPalette(paletteKey);
    setSaving(true);
    
    const palette = COLOR_PALETTES[paletteKey];
    try {
      await updateSettings({
        color_palette: paletteKey,
        primary_color: palette.primary,
        secondary_color: palette.secondary,
        accent_color: palette.accent,
      });
      toast.success(`Paleta "${palette.name}" aplicada`);
    } catch {
      toast.error("Error al cambiar la paleta de colores");
    } finally {
      setSaving(false);
    }
  };

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
      {/* Free Palettes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Paletas de Colores
          </CardTitle>
          <CardDescription>
            Elige una paleta que represente tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
              <button
                key={key}
                onClick={() => handleSelectPalette(key as ColorPaletteKey)}
                disabled={saving}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md",
                  selectedPalette === key
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
              >
                {/* Color Preview */}
                <div className="flex gap-1 mb-3">
                  {palette.preview.map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                {/* Label */}
                <p className="text-sm font-medium text-left">{palette.name}</p>
                
                {/* Selected Indicator */}
                {selectedPalette === key && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Features */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            Premium
          </Badge>
        </div>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            Personalización Avanzada
          </CardTitle>
          <CardDescription>
            Desbloquea colores y tipografías personalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PremiumFeature
            isPremium={isPremium}
            title="Colores Personalizados"
            description="Elige cualquier color para tu marca con el selector de colores avanzado"
          >
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary" />
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-accent" />
              </div>
              <div>
                <p className="font-medium">Selector de Color HEX/HSL</p>
                <p className="text-sm text-muted-foreground">
                  Personaliza cada color de tu interfaz
                </p>
              </div>
            </div>
          </PremiumFeature>

          <div className="border-t border-border my-6" />

          <PremiumFeature
            isPremium={isPremium}
            title="Tipografías Personalizadas"
            description="Elige entre +20 familias tipográficas premium"
          >
            <div className="grid grid-cols-2 gap-3">
              {["Playfair Display", "Montserrat", "Raleway", "Poppins"].map((font) => (
                <div
                  key={font}
                  className="p-3 border border-border rounded-lg text-center"
                >
                  <span className="text-lg font-medium">{font}</span>
                </div>
              ))}
            </div>
          </PremiumFeature>

          {!isPremium && (
            <div className="mt-6 flex justify-center">
              <Button size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Desbloquear con Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppearanceSettings;
