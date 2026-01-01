
-- Create eyelash_eyebrow_cards table for "Ficha Técnica – Tratamientos de Pestañas y Cejas"
CREATE TABLE public.eyelash_eyebrow_cards (
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
  
  -- Características
  skin_type TEXT, -- Normal, Seca, Mixta, Sensible, Otro
  skin_type_other TEXT,
  eye_eyelid_state TEXT, -- Perfectos, Irritados, Sensibles, Otro
  eye_eyelid_state_other TEXT,
  has_eye_diseases BOOLEAN DEFAULT false,
  eye_disease_details TEXT,
  eyebrow_shape TEXT, -- Natural, Arqueadas, Rectas, Otro
  eyebrow_shape_other TEXT,
  lash_brow_length TEXT, -- Cortas, Medias, Largas
  lash_brow_thickness TEXT, -- Fino, Medio, Grueso
  eyebrow_hair_color TEXT,
  eyelash_hair_color TEXT,
  general_observations TEXT,
  
  -- Tratamiento realizado
  treatment_performed TEXT,
  
  -- Tratamientos externos previos
  external_treatments TEXT,
  
  -- Productos usados
  eyebrow_tint TEXT,
  eyelash_tint TEXT,
  perm_type TEXT,
  mold_type TEXT,
  mold_size TEXT,
  other_products TEXT,
  exposure_time TEXT,
  
  -- Reacciones durante el tratamiento
  treatment_reactions TEXT[], -- Ninguna, Enrojecimiento, Sensibilidad, Irritación, Lagrimeo, Picazón, Otro
  treatment_reactions_other TEXT,
  
  -- Cuidado posterior / Recomendaciones
  avoid_wet_rub TEXT, -- 24 h, 48 h, Otro
  avoid_wet_rub_other TEXT,
  specific_products TEXT,
  additional_observations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.eyelash_eyebrow_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own eyelash eyebrow cards" 
ON public.eyelash_eyebrow_cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own eyelash eyebrow cards" 
ON public.eyelash_eyebrow_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own eyelash eyebrow cards" 
ON public.eyelash_eyebrow_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own eyelash eyebrow cards" 
ON public.eyelash_eyebrow_cards 
FOR DELETE 
USING (auth.uid() = user_id);
