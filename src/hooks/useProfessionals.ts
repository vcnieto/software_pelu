import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface Professional {
  id: string;
  name: string;
  specialty: string;
  color: string | null;
  working_hours: Json | null;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
}

export const useProfessionals = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("professionals").select("*").order("name");
      if (error) throw error;
      return (data || []) as Professional[];
    },
    enabled: !!user,
  });
};

export const useProfessionalMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["professionals"] });

  const createProfessional = useMutation({
    mutationFn: async (data: { name: string; specialty: string; color: string }) => {
      const { error } = await supabase.from("professionals").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profesional creado"); invalidate(); },
    onError: () => toast.error("Error al crear profesional"),
  });

  const updateProfessional = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; specialty: string; color: string }) => {
      const { error } = await supabase.from("professionals").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profesional actualizado"); invalidate(); },
    onError: () => toast.error("Error al actualizar profesional"),
  });

  const deleteProfessional = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("professionals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profesional eliminado"); invalidate(); },
    onError: () => toast.error("Error al eliminar profesional"),
  });

  return { createProfessional, updateProfessional, deleteProfessional };
};
