import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

// Color palettes available for free users
export const COLOR_PALETTES = {
  rose: {
    name: "Rosa Elegante",
    primary: "346 77% 49%",
    secondary: "43 74% 66%",
    accent: "43 74% 49%",
    preview: ["#d94f70", "#e5c07b", "#c9a227"],
  },
  blue: {
    name: "Azul Profesional",
    primary: "221 83% 53%",
    secondary: "199 89% 48%",
    accent: "199 89% 38%",
    preview: ["#3b82f6", "#0ea5e9", "#0284c7"],
  },
  green: {
    name: "Verde Natural",
    primary: "142 71% 45%",
    secondary: "158 64% 52%",
    accent: "158 64% 42%",
    preview: ["#22c55e", "#34d399", "#10b981"],
  },
  purple: {
    name: "Morado Luxury",
    primary: "263 70% 50%",
    secondary: "280 65% 60%",
    accent: "280 65% 50%",
    preview: ["#8b5cf6", "#a855f7", "#9333ea"],
  },
  gold: {
    name: "Dorado Classic",
    primary: "43 74% 49%",
    secondary: "38 92% 50%",
    accent: "32 95% 44%",
    preview: ["#c9a227", "#f59e0b", "#d97706"],
  },
  gray: {
    name: "Gris Moderno",
    primary: "220 9% 46%",
    secondary: "215 14% 34%",
    accent: "215 14% 24%",
    preview: ["#6b7280", "#4b5563", "#374151"],
  },
} as const;

export type ColorPaletteKey = keyof typeof COLOR_PALETTES;

export interface BusinessSettings {
  id: string;
  user_id: string;
  business_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  color_palette: ColorPaletteKey;
  phone: string | null;
  email: string | null;
  address: string | null;
  opening_time: string | null;
  closing_time: string | null;
  working_days: string[] | null;
  subscription_tier: "free" | "premium" | "enterprise";
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

interface BusinessContextType {
  settings: BusinessSettings | null;
  loading: boolean;
  isPremium: boolean;
  updateSettings: (updates: Partial<BusinessSettings>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string | null>;
  refetch: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const useBusinessSettings = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusinessSettings must be used within BusinessProvider");
  }
  return context;
};

// Apply theme colors to CSS variables
const applyThemeColors = (settings: BusinessSettings | null) => {
  const root = document.documentElement;
  
  if (settings) {
    root.style.setProperty("--primary", settings.primary_color);
    root.style.setProperty("--secondary", settings.secondary_color);
    root.style.setProperty("--accent", settings.accent_color);
    
    // Update document title
    document.title = settings.business_name || "Salón";
  } else {
    // Reset to defaults
    root.style.removeProperty("--primary");
    root.style.removeProperty("--secondary");
    root.style.removeProperty("--accent");
    document.title = "Salón";
  }
};

export const BusinessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      applyThemeColors(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data as BusinessSettings);
        applyThemeColors(data as BusinessSettings);
      } else {
        // Create default settings for new user
        const defaultSettings = {
          user_id: user.id,
          business_name: "Mi Salón",
          color_palette: "rose" as ColorPaletteKey,
          primary_color: COLOR_PALETTES.rose.primary,
          secondary_color: COLOR_PALETTES.rose.secondary,
          accent_color: COLOR_PALETTES.rose.accent,
        };

        const { data: newData, error: insertError } = await supabase
          .from("business_settings")
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        
        setSettings(newData as BusinessSettings);
        applyThemeColors(newData as BusinessSettings);
      }
    } catch (error) {
      console.error("Error fetching business settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const updateSettings = async (updates: Partial<BusinessSettings>) => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from("business_settings")
        .update(updates)
        .eq("id", settings.id);

      if (error) throw error;

      const updatedSettings = { ...settings, ...updates };
      setSettings(updatedSettings);
      applyThemeColors(updatedSettings);
    } catch (error) {
      console.error("Error updating business settings:", error);
      throw error;
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("business-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("business-assets")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading logo:", error);
      return null;
    }
  };

  const isPremium = settings?.subscription_tier === "premium" || settings?.subscription_tier === "enterprise";

  return (
    <BusinessContext.Provider
      value={{
        settings,
        loading,
        isPremium,
        updateSettings,
        uploadLogo,
        refetch: fetchSettings,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};
