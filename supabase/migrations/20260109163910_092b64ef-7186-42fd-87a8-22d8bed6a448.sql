-- Create storage bucket for client files
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-files', 'client-files', false);

-- Create table for tracking client files metadata
CREATE TABLE public.client_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_files ENABLE ROW LEVEL SECURITY;

-- RLS policies for client_files
CREATE POLICY "Users can view their own client files"
ON public.client_files
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own client files"
ON public.client_files
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client files"
ON public.client_files
FOR DELETE
USING (auth.uid() = user_id);

-- Storage policies for client-files bucket
CREATE POLICY "Users can upload their own client files"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own client files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own client files"
ON storage.objects
FOR DELETE
USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);