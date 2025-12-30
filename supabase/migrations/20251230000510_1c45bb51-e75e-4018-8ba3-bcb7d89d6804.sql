
-- Create aesthetic_history_cards table for "Ficha Técnica – Historial Integral Estético"
CREATE TABLE public.aesthetic_history_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Datos generales del cliente
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  birth_date DATE,
  age INTEGER,
  profession TEXT,
  phone TEXT,
  email TEXT,
  
  -- Datos generales de salud
  current_past_diseases TEXT,
  chronic_diseases TEXT,
  allergies TEXT,
  regular_medication TEXT,
  previous_surgeries TEXT,
  previous_aesthetic_treatments TEXT,
  family_history TEXT,
  sensitivities_contraindications TEXT,
  has_prosthesis BOOLEAN DEFAULT false,
  prosthesis_type TEXT,
  is_pregnant BOOLEAN DEFAULT false,
  is_breastfeeding BOOLEAN DEFAULT false,
  
  -- Historial dermatológico y estético
  skin_type TEXT, -- Normal, Seca, Mixta, Grasa, Sensible
  phototype TEXT, -- I, II, III, IV, V, VI
  skin_alterations TEXT[], -- Multiple selection
  skin_alterations_other TEXT,
  previous_treatment_reactions TEXT,
  
  -- Hábitos y estilo de vida
  daily_water_consumption TEXT, -- < 1L, 1–2L, > 2L
  diet TEXT[], -- Multiple selection
  physical_activity TEXT, -- Ninguna, Ocasional, Regular, Intensa
  sleep_hours TEXT, -- < 6, 6–7, 7–8, > 8
  stress_level TEXT, -- Bajo, Medio, Alto
  emotional_state TEXT, -- Bajo, Medio, Alto
  emotional_observations TEXT,
  
  -- Otros hábitos
  smokes BOOLEAN DEFAULT false,
  smoking_quantity TEXT,
  alcohol_consumption TEXT, -- No, Ocasional, Frecuente
  diuresis TEXT, -- Normal, Disminuida, Aumentada
  intestinal_habit TEXT, -- Regular, Estreñimiento, Diarrea
  
  -- Salud hormonal y fisiológica
  regular_menstrual_cycle BOOLEAN,
  previous_pregnancies BOOLEAN DEFAULT false,
  pregnancies_count INTEGER,
  menopause BOOLEAN DEFAULT false,
  menopause_age INTEGER,
  hormonal_treatments TEXT,
  
  -- Objetivos del cliente
  main_interest_area TEXT, -- Facial, Corporal, Capilar, Otro
  main_interest_area_other TEXT,
  specific_objectives TEXT,
  
  -- Observaciones y consentimiento
  professional_observations TEXT,
  client_signature TEXT,
  signature_date DATE,
  professional_signature TEXT
);

-- Enable Row Level Security
ALTER TABLE public.aesthetic_history_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own aesthetic history cards"
ON public.aesthetic_history_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own aesthetic history cards"
ON public.aesthetic_history_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aesthetic history cards"
ON public.aesthetic_history_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aesthetic history cards"
ON public.aesthetic_history_cards
FOR DELETE
USING (auth.uid() = user_id);
