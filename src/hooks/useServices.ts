import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export const useServices = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").order("name");
      if (error) throw error;
      return (data || []) as Service[];
    },
    enabled: !!user,
  });
};

export const useServiceMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["services"] });

  const createService = useMutation({
    mutationFn: async (data: { name: string; duration: number; price: number }) => {
      const { error } = await supabase.from("services").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Servicio añadido"); invalidate(); },
    onError: () => toast.error("Error al crear el servicio"),
  });

  const updateService = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; duration: number; price: number }) => {
      const { error } = await supabase.from("services").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Servicio actualizado"); invalidate(); },
    onError: () => toast.error("Error al actualizar el servicio"),
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Servicio eliminado"); invalidate(); },
    onError: () => toast.error("Error al eliminar el servicio"),
  });

  return { createService, updateService, deleteService };
};
