-- Create business_settings table for white-label customization
CREATE TABLE public.business_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  business_name TEXT NOT NULL DEFAULT 'Mi Salón',
  logo_url TEXT,
  primary_color TEXT DEFAULT '346 77% 49%',
  secondary_color TEXT DEFAULT '43 74% 66%',
  accent_color TEXT DEFAULT '43 74% 49%',
  color_palette TEXT DEFAULT 'rose',
  phone TEXT,
  email TEXT,
  address TEXT,
  opening_time TIME DEFAULT '09:00',
  closing_time TIME DEFAULT '20:00',
  working_days TEXT[] DEFAULT ARRAY['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'enterprise')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own business settings"
ON public.business_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business settings"
ON public.business_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business settings"
ON public.business_settings
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_business_settings_updated_at
BEFORE UPDATE ON public.business_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for business assets (logos)
INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', true);

-- Storage policies for business assets
CREATE POLICY "Anyone can view business assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'business-assets');

CREATE POLICY "Users can upload their own business assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own business assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own business assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);