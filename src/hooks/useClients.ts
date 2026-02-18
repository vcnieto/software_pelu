import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  birth_date?: string | null;
}

export const useClients = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      return (data || []) as Client[];
    },
    enabled: !!user,
  });
};

export const useClientMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["clients"] });

  const createClient = useMutation({
    mutationFn: async (data: { name: string; phone?: string | null; email?: string | null; notes?: string | null; birth_date?: string | null }) => {
      const { error } = await supabase.from("clients").insert({ ...data, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Cliente añadido"); invalidate(); },
    onError: () => toast.error("Error al crear el cliente"),
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; phone?: string | null; email?: string | null; notes?: string | null; birth_date?: string | null }) => {
      const { error } = await supabase.from("clients").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Cliente actualizado"); invalidate(); },
    onError: () => toast.error("Error al actualizar el cliente"),
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Cliente eliminado"); invalidate(); },
    onError: () => toast.error("Error al eliminar el cliente"),
  });

  return { createClient, updateClient, deleteClient };
};
