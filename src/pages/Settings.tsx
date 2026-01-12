import Sidebar from "@/components/layout/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, CreditCard } from "lucide-react";
import BusinessInfoForm from "@/components/settings/BusinessInfoForm";
import AppearanceSettings from "@/components/settings/AppearanceSettings";
import PlanSettings from "@/components/settings/PlanSettings";

const Settings = () => {
  return (
    <Sidebar>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Configuración
          </h1>
          <p className="text-muted-foreground mt-1">
            Personaliza tu negocio y gestiona tu suscripción
          </p>
        </div>

        <Tabs defaultValue="business" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="business" className="flex items-center gap-2 py-3">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Negocio</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2 py-3">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Apariencia</span>
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2 py-3">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="mt-6">
            <BusinessInfoForm />
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <AppearanceSettings />
          </TabsContent>

          <TabsContent value="plan" className="mt-6">
            <PlanSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Sidebar>
  );
};

export default Settings;
