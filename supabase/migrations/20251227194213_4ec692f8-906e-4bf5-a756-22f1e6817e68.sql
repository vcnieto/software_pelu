-- Create enum for card types
CREATE TYPE public.card_type AS ENUM ('health', 'waxing');

-- Create cards table
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  card_type card_type NOT NULL,
  
  -- Health card fields
  diseases TEXT,
  allergies TEXT,
  medication TEXT,
  
  -- Waxing card fields
  treated_zone TEXT,
  hair_type TEXT,
  wax_type TEXT,
  product_batch TEXT,
  reactions TEXT,
  
  -- Common fields
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own cards"
ON public.cards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards"
ON public.cards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards"
ON public.cards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards"
ON public.cards FOR DELETE
USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_cards_client_id ON public.cards(client_id);
CREATE INDEX idx_cards_created_at ON public.cards(created_at DESC);