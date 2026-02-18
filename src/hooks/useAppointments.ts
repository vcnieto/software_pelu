import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface AppointmentWithRelations {
  id: string;
  date: string;
  start_time: string;
  duration: number;
  notes: string | null;
  status: string | null;
  clients: { name: string } | null;
  services: { name: string; duration: number; price: number } | null;
  professionals: { name: string; specialty: string; color?: string | null } | null;
}

interface UseAppointmentsOptions {
  dateFrom?: string;
  dateTo?: string;
}

export const useAppointments = (options?: UseAppointmentsOptions) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["appointments", options?.dateFrom, options?.dateTo],
    queryFn: async () => {
      let query = supabase
        .from("appointments")
        .select("*, clients(name), services(name, duration, price), professionals(name, specialty, color)")
        .order("date", { ascending: false })
        .order("start_time");

      if (options?.dateFrom) query = query.gte("date", options.dateFrom);
      if (options?.dateTo) query = query.lte("date", options.dateTo);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AppointmentWithRelations[];
    },
    enabled: !!user,
  });
};

export const useInvalidateAppointments = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["appointments"] });
};
