
-- Create waxing_treatment_cards table
CREATE TABLE public.waxing_treatment_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  age INTEGER,
  session_number INTEGER,
  
  -- Professional data
  professional_id UUID REFERENCES public.professionals(id),
  professional_registration TEXT,
  
  -- Skin information
  skin_type TEXT, -- normal, seca, mixta, sensible, grasa
  skin_condition TEXT, -- perfecta, irritada, con_lesiones, con_manchas, otro
  skin_condition_other TEXT,
  special_observations TEXT,
  
  -- Hair information
  hair_type TEXT, -- fino, medio, grueso, rizado, liso
  hair_color TEXT, -- rubio, castaño, negro, pelirrojo, canoso
  hair_density TEXT, -- baja, media, alta
  hair_length TEXT, -- corto, medio, largo
  previous_external_treatments TEXT,
  
  -- Wax and products
  wax_type TEXT, -- tibia, caliente, fria, otro
  wax_type_other TEXT,
  wax_batch TEXT,
  
  -- Pre-waxing products
  pre_cleanser TEXT,
  pre_talc TEXT,
  pre_oil TEXT,
  pre_other_products TEXT,
  
  -- Post-waxing products
  post_calming_cream TEXT,
  post_aloe_gel TEXT,
  post_oil TEXT,
  post_other_products TEXT,
  
  -- Area to wax (multiple selection stored as array)
  waxing_areas TEXT[],
  waxing_areas_other TEXT,
  
  -- Technique
  waxing_method TEXT, -- tira, sin_tira, otro
  waxing_method_other TEXT,
  hair_removal_direction TEXT, -- a_favor, en_contra, ambos
  
  -- Final observations
  treatment_reactions TEXT[],
  treatment_reactions_other TEXT,
  client_recommendations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.waxing_treatment_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own waxing treatment cards" 
ON public.waxing_treatment_cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own waxing treatment cards" 
ON public.waxing_treatment_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own waxing treatment cards" 
ON public.waxing_treatment_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own waxing treatment cards" 
ON public.waxing_treatment_cards 
FOR DELETE 
USING (auth.uid() = user_id);
