import { useState } from "react";
import { useBusinessSettings } from "@/contexts/BusinessContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LogoUploader from "./LogoUploader";
import { Save, Building2, Phone, Mail, MapPin, Clock } from "lucide-react";

const BusinessInfoForm = () => {
  const { settings, updateSettings, loading } = useBusinessSettings();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    business_name: settings?.business_name || "",
    phone: settings?.phone || "",
    email: settings?.email || "",
    address: settings?.address || "",
    opening_time: settings?.opening_time || "09:00",
    closing_time: settings?.closing_time || "20:00",
  });

  // Update form when settings load
  useState(() => {
    if (settings) {
      setForm({
        business_name: settings.business_name || "",
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        opening_time: settings.opening_time || "09:00",
        closing_time: settings.closing_time || "20:00",
      });
    }
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      toast.success("Configuración guardada correctamente");
    } catch {
      toast.error("Error al guardar la configuración");
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
      {/* Logo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Identidad del Negocio
          </CardTitle>
          <CardDescription>
            Personaliza el logo y nombre de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LogoUploader />
          
          <div className="space-y-2">
            <Label htmlFor="business_name">Nombre del Negocio</Label>
            <Input
              id="business_name"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="Mi Salón de Belleza"
              className="max-w-md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </CardTitle>
          <CardDescription>
            Datos de contacto de tu negocio
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Teléfono
            </Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+34 600 000 000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="contacto@misalon.com"
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Dirección
            </Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Calle Principal 123, Ciudad"
            />
          </div>
        </CardContent>
      </Card>

      {/* Schedule Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horario de Atención
          </CardTitle>
          <CardDescription>
            Define los horarios de apertura y cierre
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="opening_time">Hora de Apertura</Label>
            <Input
              id="opening_time"
              type="time"
              value={form.opening_time}
              onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="closing_time">Hora de Cierre</Label>
            <Input
              id="closing_time"
              type="time"
              value={form.closing_time}
              onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
};

export default BusinessInfoForm;
