export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aesthetic_history_cards: {
        Row: {
          age: number | null
          alcohol_consumption: string | null
          allergies: string | null
          birth_date: string | null
          chronic_diseases: string | null
          client_id: string
          client_signature: string | null
          created_at: string
          current_past_diseases: string | null
          daily_water_consumption: string | null
          date: string
          diet: string[] | null
          diuresis: string | null
          email: string | null
          emotional_observations: string | null
          emotional_state: string | null
          family_history: string | null
          has_prosthesis: boolean | null
          hormonal_treatments: string | null
          id: string
          intestinal_habit: string | null
          is_breastfeeding: boolean | null
          is_pregnant: boolean | null
          main_interest_area: string | null
          main_interest_area_other: string | null
          menopause: boolean | null
          menopause_age: number | null
          phone: string | null
          phototype: string | null
          physical_activity: string | null
          pregnancies_count: number | null
          previous_aesthetic_treatments: string | null
          previous_pregnancies: boolean | null
          previous_surgeries: string | null
          previous_treatment_reactions: string | null
          profession: string | null
          professional_observations: string | null
          professional_signature: string | null
          prosthesis_type: string | null
          regular_medication: string | null
          regular_menstrual_cycle: boolean | null
          sensitivities_contraindications: string | null
          signature_date: string | null
          skin_alterations: string[] | null
          skin_alterations_other: string | null
          skin_type: string | null
          sleep_hours: string | null
          smokes: boolean | null
          smoking_quantity: string | null
          specific_objectives: string | null
          stress_level: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          birth_date?: string | null
          chronic_diseases?: string | null
          client_id: string
          client_signature?: string | null
          created_at?: string
          current_past_diseases?: string | null
          daily_water_consumption?: string | null
          date?: string
          diet?: string[] | null
          diuresis?: string | null
          email?: string | null
          emotional_observations?: string | null
          emotional_state?: string | null
          family_history?: string | null
          has_prosthesis?: boolean | null
          hormonal_treatments?: string | null
          id?: string
          intestinal_habit?: string | null
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          main_interest_area?: string | null
          main_interest_area_other?: string | null
          menopause?: boolean | null
          menopause_age?: number | null
          phone?: string | null
          phototype?: string | null
          physical_activity?: string | null
          pregnancies_count?: number | null
          previous_aesthetic_treatments?: string | null
          previous_pregnancies?: boolean | null
          previous_surgeries?: string | null
          previous_treatment_reactions?: string | null
          profession?: string | null
          professional_observations?: string | null
          professional_signature?: string | null
          prosthesis_type?: string | null
          regular_medication?: string | null
          regular_menstrual_cycle?: boolean | null
          sensitivities_contraindications?: string | null
          signature_date?: string | null
          skin_alterations?: string[] | null
          skin_alterations_other?: string | null
          skin_type?: string | null
          sleep_hours?: string | null
          smokes?: boolean | null
          smoking_quantity?: string | null
          specific_objectives?: string | null
          stress_level?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          alcohol_consumption?: string | null
          allergies?: string | null
          birth_date?: string | null
          chronic_diseases?: string | null
          client_id?: string
          client_signature?: string | null
          created_at?: string
          current_past_diseases?: string | null
          daily_water_consumption?: string | null
          date?: string
          diet?: string[] | null
          diuresis?: string | null
          email?: string | null
          emotional_observations?: string | null
          emotional_state?: string | null
          family_history?: string | null
          has_prosthesis?: boolean | null
          hormonal_treatments?: string | null
          id?: string
          intestinal_habit?: string | null
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          main_interest_area?: string | null
          main_interest_area_other?: string | null
          menopause?: boolean | null
          menopause_age?: number | null
          phone?: string | null
          phototype?: string | null
          physical_activity?: string | null
          pregnancies_count?: number | null
          previous_aesthetic_treatments?: string | null
          previous_pregnancies?: boolean | null
          previous_surgeries?: string | null
          previous_treatment_reactions?: string | null
          profession?: string | null
          professional_observations?: string | null
          professional_signature?: string | null
          prosthesis_type?: string | null
          regular_medication?: string | null
          regular_menstrual_cycle?: boolean | null
          sensitivities_contraindications?: string | null
          signature_date?: string | null
          skin_alterations?: string[] | null
          skin_alterations_other?: string | null
          skin_type?: string | null
          sleep_hours?: string | null
          smokes?: boolean | null
          smoking_quantity?: string | null
          specific_objectives?: string | null
          stress_level?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aesthetic_history_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          client_id: string
          created_at: string | null
          date: string
          duration: number
          id: string
          notes: string | null
          professional_id: string | null
          service_id: string | null
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          date: string
          duration?: number
          id?: string
          notes?: string | null
          professional_id?: string | null
          service_id?: string | null
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          professional_id?: string | null
          service_id?: string | null
          start_time?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      body_treatment_cards: {
        Row: {
          age: number | null
          cellulite_type: string | null
          client_id: string
          created_at: string
          date: string
          equipment_used: string | null
          final_observations: string | null
          flaccidity: string | null
          fluid_retention: string | null
          gel_lotion: string | null
          general_observations: string | null
          id: string
          localized_fat: boolean | null
          muscle_tonicity: string | null
          oils_creams: string | null
          other_products: string | null
          professional_id: string | null
          professional_registration: string | null
          session_number: number | null
          skin_alterations: string[] | null
          skin_alterations_other: string | null
          skin_sensitivity: string | null
          skin_type: string | null
          skin_type_other: string | null
          treated_zones: string | null
          treatment_performed: string | null
          treatment_reactions: string[] | null
          treatment_reactions_other: string | null
          treatment_time: string | null
          user_id: string
        }
        Insert: {
          age?: number | null
          cellulite_type?: string | null
          client_id: string
          created_at?: string
          date?: string
          equipment_used?: string | null
          final_observations?: string | null
          flaccidity?: string | null
          fluid_retention?: string | null
          gel_lotion?: string | null
          general_observations?: string | null
          id?: string
          localized_fat?: boolean | null
          muscle_tonicity?: string | null
          oils_creams?: string | null
          other_products?: string | null
          professional_id?: string | null
          professional_registration?: string | null
          session_number?: number | null
          skin_alterations?: string[] | null
          skin_alterations_other?: string | null
          skin_sensitivity?: string | null
          skin_type?: string | null
          skin_type_other?: string | null
          treated_zones?: string | null
          treatment_performed?: string | null
          treatment_reactions?: string[] | null
          treatment_reactions_other?: string | null
          treatment_time?: string | null
          user_id: string
        }
        Update: {
          age?: number | null
          cellulite_type?: string | null
          client_id?: string
          created_at?: string
          date?: string
          equipment_used?: string | null
          final_observations?: string | null
          flaccidity?: string | null
          fluid_retention?: string | null
          gel_lotion?: string | null
          general_observations?: string | null
          id?: string
          localized_fat?: boolean | null
          muscle_tonicity?: string | null
          oils_creams?: string | null
          other_products?: string | null
          professional_id?: string | null
          professional_registration?: string | null
          session_number?: number | null
          skin_alterations?: string[] | null
          skin_alterations_other?: string | null
          skin_sensitivity?: string | null
          skin_type?: string | null
          skin_type_other?: string | null
          treated_zones?: string | null
          treatment_performed?: string | null
          treatment_reactions?: string[] | null
          treatment_reactions_other?: string | null
          treatment_time?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "body_treatment_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "body_treatment_cards_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          allergies: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          client_id: string
          created_at: string
          diseases: string | null
          hair_type: string | null
          id: string
          medication: string | null
          observations: string | null
          product_batch: string | null
          reactions: string | null
          treated_zone: string | null
          user_id: string
          wax_type: string | null
        }
        Insert: {
          allergies?: string | null
          card_type: Database["public"]["Enums"]["card_type"]
          client_id: string
          created_at?: string
          diseases?: string | null
          hair_type?: string | null
          id?: string
          medication?: string | null
          observations?: string | null
          product_batch?: string | null
          reactions?: string | null
          treated_zone?: string | null
          user_id: string
          wax_type?: string | null
        }
        Update: {
          allergies?: string | null
          card_type?: Database["public"]["Enums"]["card_type"]
          client_id?: string
          created_at?: string
          diseases?: string | null
          hair_type?: string | null
          id?: string
          medication?: string | null
          observations?: string | null
          product_batch?: string | null
          reactions?: string | null
          treated_zone?: string | null
          user_id?: string
          wax_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      facial_skin_cards: {
        Row: {
          age: number | null
          bags_dark_circles: string | null
          cleanser: string | null
          client_id: string
          created_at: string
          daily_cleansing: string | null
          date: string
          equipment_used: string | null
          final_observations: string | null
          general_observations: string | null
          has_milia: boolean | null
          home_other_products: string | null
          home_sunscreen: string | null
          hydration: string | null
          id: string
          lips: string | null
          lips_other: string | null
          moisturizer: string | null
          other_products: string | null
          professional_id: string | null
          professional_recommendations: string | null
          professional_registration: string | null
          routine_observations: string | null
          sensitivity: string | null
          serum: string | null
          session_number: number | null
          skin_condition: string | null
          skin_condition_other: string | null
          skin_conditions: string[] | null
          skin_conditions_other: string | null
          skin_type: string | null
          special_treatments: string | null
          sunscreen: string | null
          texture: string | null
          texture_other: string | null
          toner: string | null
          treatment_performed: string | null
          treatment_reactions: string[] | null
          treatment_reactions_other: string | null
          user_id: string
          visible_pores: string | null
          wrinkles: string | null
        }
        Insert: {
          age?: number | null
          bags_dark_circles?: string | null
          cleanser?: string | null
          client_id: string
          created_at?: string
          daily_cleansing?: string | null
          date?: string
          equipment_used?: string | null
          final_observations?: string | null
          general_observations?: string | null
          has_milia?: boolean | null
          home_other_products?: string | null
          home_sunscreen?: string | null
          hydration?: string | null
          id?: string
          lips?: string | null
          lips_other?: string | null
          moisturizer?: string | null
          other_products?: string | null
          professional_id?: string | null
          professional_recommendations?: string | null
          professional_registration?: string | null
          routine_observations?: string | null
          sensitivity?: string | null
          serum?: string | null
          session_number?: number | null
          skin_condition?: string | null
          skin_condition_other?: string | null
          skin_conditions?: string[] | null
          skin_conditions_other?: string | null
          skin_type?: string | null
          special_treatments?: string | null
          sunscreen?: string | null
          texture?: string | null
          texture_other?: string | null
          toner?: string | null
          treatment_performed?: string | null
          treatment_reactions?: string[] | null
          treatment_reactions_other?: string | null
          user_id: string
          visible_pores?: string | null
          wrinkles?: string | null
        }
        Update: {
          age?: number | null
          bags_dark_circles?: string | null
          cleanser?: string | null
          client_id?: string
          created_at?: string
          daily_cleansing?: string | null
          date?: string
          equipment_used?: string | null
          final_observations?: string | null
          general_observations?: string | null
          has_milia?: boolean | null
          home_other_products?: string | null
          home_sunscreen?: string | null
          hydration?: string | null
          id?: string
          lips?: string | null
          lips_other?: string | null
          moisturizer?: string | null
          other_products?: string | null
          professional_id?: string | null
          professional_recommendations?: string | null
          professional_registration?: string | null
          routine_observations?: string | null
          sensitivity?: string | null
          serum?: string | null
          session_number?: number | null
          skin_condition?: string | null
          skin_condition_other?: string | null
          skin_conditions?: string[] | null
          skin_conditions_other?: string | null
          skin_type?: string | null
          special_treatments?: string | null
          sunscreen?: string | null
          texture?: string | null
          texture_other?: string | null
          toner?: string | null
          treatment_performed?: string | null
          treatment_reactions?: string[] | null
          treatment_reactions_other?: string | null
          user_id?: string
          visible_pores?: string | null
          wrinkles?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facial_skin_cards_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facial_skin_cards_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          specialty: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          specialty: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          specialty?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          duration: number
          id: string
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number
          id?: string
          name: string
          price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          id?: string
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      card_type: "health" | "waxing"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      card_type: ["health", "waxing"],
    },
  },
} as const
