
-- Create body_treatment_cards table for "Ficha Técnica – Tratamientos Corporales"
CREATE TABLE public.body_treatment_cards (
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
  
  -- Características del cliente
  skin_type TEXT, -- Normal, Seca, Mixta, Sensible, Grasa, Otro
  skin_type_other TEXT,
  skin_sensitivity TEXT, -- Baja, Media, Alta
  skin_alterations TEXT[], -- Multiple selection array
  skin_alterations_other TEXT,
  cellulite_type TEXT, -- Blanda, Dura, Edematosa, Mixta
  fluid_retention TEXT, -- Leve, Moderada, Alta
  flaccidity TEXT, -- Leve, Moderada, Alta
  localized_fat BOOLEAN DEFAULT false,
  muscle_tonicity TEXT, -- Buena, Regular, Baja
  general_observations TEXT,
  
  -- Tratamiento realizado / Zonas tratadas
  treatment_performed TEXT,
  equipment_used TEXT,
  treated_zones TEXT,
  treatment_time TEXT,
  
  -- Productos usados
  oils_creams TEXT,
  gel_lotion TEXT,
  other_products TEXT,
  
  -- Reacciones durante el tratamiento
  treatment_reactions TEXT[], -- Multiple selection array
  treatment_reactions_other TEXT,
  
  -- Observaciones finales
  final_observations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.body_treatment_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own body treatment cards"
ON public.body_treatment_cards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own body treatment cards"
ON public.body_treatment_cards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body treatment cards"
ON public.body_treatment_cards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body treatment cards"
ON public.body_treatment_cards
FOR DELETE
USING (auth.uid() = user_id);
