
CREATE OR REPLACE FUNCTION public.auto_create_patient_from_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If patient_id is not set, try to find or create patient
  IF NEW.patient_id IS NULL THEN
    -- Try to find existing patient by name and phone match via appointments
    SELECT id INTO NEW.patient_id FROM public.patients WHERE name = NEW.patient_name LIMIT 1;
    
    -- If no patient found, create one
    IF NEW.patient_id IS NULL THEN
      INSERT INTO public.patients (name)
      VALUES (NEW.patient_name)
      RETURNING id INTO NEW.patient_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_patient
BEFORE INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_patient_from_appointment();
