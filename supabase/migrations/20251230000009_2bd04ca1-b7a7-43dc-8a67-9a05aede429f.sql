
-- Create facial_skin_cards table for "Ficha Técnica / Estudio de Piel Facial"
CREATE TABLE public.facial_skin_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Datos generales
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  age INTEGER,
  session_number INTEGER,
  professional_id UUID REFERENCES public.professionals(id),
  professional_registration TEXT,
  
  -- Evaluación de la piel
  skin_type TEXT, -- Normal, Seca, Mixta, Sensible, Grasa
  skin_condition TEXT, -- Perfecta, Con imperfecciones, Irritada, Con acné, Con manchas, Otro
  skin_condition_other TEXT,
  texture TEXT, -- Suave, Rugosa, Deshidratada, Grasa, Otro
  texture_other TEXT,
  sensitivity TEXT, -- Baja, Media, Alta
  visible_pores TEXT, -- No, Sí, Moderado
  wrinkles TEXT, -- Ninguna, Finas, Marcadas, Profundas
  bags_dark_circles TEXT, -- Ninguna, Leves, Moderadas, Marcadas
  lips TEXT, -- Hidratados, Secos, Exfoliados, Otro
  lips_other TEXT,
  skin_conditions TEXT[], -- Multiple selection: Rosácea, Psoriasis, Eczema, Dermatitis, Otro
  skin_conditions_other TEXT,
  has_milia BOOLEAN DEFAULT false,
  general_observations TEXT,
  
  -- Tratamiento realizado
  treatment_performed TEXT,
  equipment_used TEXT,
  
  -- Productos utilizados
  cleanser TEXT,
  toner TEXT,
  serum TEXT,
  moisturizer TEXT,
  sunscreen TEXT,
  other_products TEXT,
  
  -- Rutina facial en casa
  daily_cleansing TEXT,
  hydration TEXT,
  special_treatments TEXT,
  home_sunscreen TEXT,
  home_other_products TEXT,
  routine_observations TEXT,
  
  -- Reacciones durante el tratamiento
  treatment_reactions TEXT[], -- Multiple selection
  treatment_reactions_other TEXT,
  
  -- Cierre
  final_observations TEXT,
  professional_recommendations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.facial_skin_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own facial skin cards"
ON public.facial_skin_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own facial skin cards"
ON public.facial_skin_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own facial skin cards"
ON public.facial_skin_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own facial skin cards"
ON public.facial_skin_cards
FOR DELETE
USING (auth.uid() = user_id);
