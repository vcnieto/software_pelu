-- Create professionals table
CREATE TABLE public.professionals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for professionals
CREATE POLICY "Users can view their own professionals" ON public.professionals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own professionals" ON public.professionals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own professionals" ON public.professionals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own professionals" ON public.professionals FOR DELETE USING (auth.uid() = user_id);

-- Add professional_id to appointments (required)
ALTER TABLE public.appointments ADD COLUMN professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL;

-- Create trigger for updated_at
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON public.professionals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check for overlapping appointments
CREATE OR REPLACE FUNCTION public.check_appointment_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  end_time TIME;
  conflict_count INTEGER;
BEGIN
  -- Calculate end time
  end_time := NEW.start_time + (NEW.duration || ' minutes')::INTERVAL;
  
  -- Check for overlapping appointments for the same professional
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE professional_id = NEW.professional_id
    AND date = NEW.date
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    AND (
      (NEW.start_time >= start_time AND NEW.start_time < start_time + (duration || ' minutes')::INTERVAL)
      OR (end_time > start_time AND end_time <= start_time + (duration || ' minutes')::INTERVAL)
      OR (NEW.start_time <= start_time AND end_time >= start_time + (duration || ' minutes')::INTERVAL)
    );
  
  IF conflict_count > 0 THEN
    RAISE EXCEPTION 'El profesional ya tiene una cita en ese horario';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for overlap check
CREATE TRIGGER check_appointment_overlap_trigger
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.check_appointment_overlap();