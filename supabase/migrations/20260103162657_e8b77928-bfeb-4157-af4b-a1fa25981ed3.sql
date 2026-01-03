
-- Create hair_scalp_cards table
CREATE TABLE public.hair_scalp_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  phone TEXT,
  email TEXT,
  
  -- Hair characteristics
  hair_type TEXT, -- liso, ondulado, rizado, muy_rizado, otro
  hair_type_other TEXT,
  hair_texture TEXT, -- fina, media, gruesa
  hair_density TEXT, -- baja, media, alta
  hair_porosity TEXT, -- baja, media, alta
  hair_elasticity TEXT, -- baja, media, alta
  natural_color TEXT,
  current_color TEXT,
  previous_treatments TEXT[], -- tintes, mechas, decoloracion, alisado, permanente, otro
  previous_treatments_other TEXT,
  
  -- Scalp condition
  scalp_type TEXT, -- normal, graso, seco, sensible, otro
  scalp_type_other TEXT,
  scalp_problems TEXT[], -- caspa, descamacion, picor, irritacion, eccema, psoriasis, otro
  scalp_problems_other TEXT,
  product_sensitivity TEXT, -- baja, media, alta
  scalp_observations TEXT,
  
  -- Client habits
  wash_frequency TEXT, -- diario, cada_2_dias, semanal, otro
  wash_frequency_other TEXT,
  usual_products TEXT,
  heat_tools TEXT[], -- planchas, secador, tenacillas, otro
  heat_tools_other TEXT,
  supplements_treatments TEXT,
  
  -- Treatment performed
  treatment_service TEXT,
  treated_zones TEXT,
  session_time TEXT,
  
  -- Products used
  shampoo_conditioner TEXT,
  mask_treatment TEXT,
  oils_serums TEXT,
  other_products TEXT,
  exposure_time TEXT,
  
  -- Treatment objectives
  improve_hair_health BOOLEAN DEFAULT false,
  control_hair_loss BOOLEAN DEFAULT false,
  hydration_nutrition BOOLEAN DEFAULT false,
  restoration_repair BOOLEAN DEFAULT false,
  other_objective TEXT,
  
  -- Professional observations
  professional_observations TEXT
);

-- Enable Row Level Security
ALTER TABLE public.hair_scalp_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own hair scalp cards" 
ON public.hair_scalp_cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hair scalp cards" 
ON public.hair_scalp_cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hair scalp cards" 
ON public.hair_scalp_cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hair scalp cards" 
ON public.hair_scalp_cards 
FOR DELETE 
USING (auth.uid() = user_id);
