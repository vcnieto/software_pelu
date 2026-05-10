CREATE POLICY "Users can delete their own business settings"
ON public.business_settings
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'client-files' AND auth.uid()::text = (storage.foldername(name))[1]);