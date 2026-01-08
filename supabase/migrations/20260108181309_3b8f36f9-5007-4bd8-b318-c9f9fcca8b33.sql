-- Add working_hours column to professionals table
ALTER TABLE public.professionals 
ADD COLUMN working_hours JSONB DEFAULT '{}'::jsonb;

-- Update Pili's working hours (assuming she exists)
-- Format: { "day_number": { "start": "HH:MM", "end": "HH:MM" } } where day 0 = Sunday, 1 = Monday, etc.
-- Pili: lunes 10-15, martes cerrado, miércoles 10-15, jueves y viernes 10-18, sábado 10-14
COMMENT ON COLUMN public.professionals.working_hours IS 'JSON object with working hours per day. Format: { "1": { "start": "10:00", "end": "15:00" }, ... } where 0=Sunday, 1=Monday, etc. Empty or missing day means closed.';