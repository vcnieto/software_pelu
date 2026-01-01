-- Create massage_dlm_cards table
CREATE TABLE public.massage_dlm_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  age INTEGER,
  session_number INTEGER,
  professional_id UUID,
  professional_registration TEXT,
  
  -- Características del cliente
  skin_type TEXT,
  skin_type_other TEXT,
  skin_sensitivity TEXT,
  skin_alterations TEXT[],
  skin_alterations_other TEXT,
  general_observations TEXT,
  
  -- Tipo de masaje / técnica
  uses_massage BOOLEAN DEFAULT false,
  uses_dlm BOOLEAN DEFAULT false,
  massage_time TEXT,
  dlm_time TEXT,
  
  -- Zonas tratadas
  treated_zones TEXT,
  
  -- Productos usados
  oils_creams TEXT,
  gel_lotion TEXT,
  other_products TEXT,
  
  -- Reacciones
  treatment_reactions TEXT[],
  treatment_reactions_other TEXT,
  
  -- Observaciones finales
  final_observations TEXT
);

-- Enable RLS
ALTER TABLE public.massage_dlm_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own massage dlm cards"
ON public.massage_dlm_cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own massage dlm cards"
ON public.massage_dlm_cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own massage dlm cards"
ON public.massage_dlm_cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own massage dlm cards"
ON public.massage_dlm_cards FOR DELETE
USING (auth.uid() = user_id);