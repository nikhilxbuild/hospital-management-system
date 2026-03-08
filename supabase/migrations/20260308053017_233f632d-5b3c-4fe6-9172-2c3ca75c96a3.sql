
-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  fee INTEGER NOT NULL DEFAULT 500,
  experience INTEGER NOT NULL DEFAULT 5,
  rating NUMERIC(2,1) NOT NULL DEFAULT 4.5,
  available BOOLEAN NOT NULL DEFAULT true,
  username TEXT UNIQUE,
  password TEXT,
  available_days TEXT[] DEFAULT ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday'],
  available_slots TEXT[] DEFAULT ARRAY['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM'],
  img_emoji TEXT DEFAULT '👨‍⚕️',
  about TEXT,
  patients_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors are viewable by everyone" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can be updated by authenticated users" ON public.doctors FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Doctors can be inserted by authenticated users" ON public.doctors FOR INSERT TO authenticated WITH CHECK (true);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  phone TEXT,
  email TEXT,
  blood_group TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients viewable by authenticated" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Patients can insert themselves" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Patients can update" ON public.patients FOR UPDATE TO authenticated USING (true);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id),
  patient_name TEXT NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id),
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  slot TEXT NOT NULL,
  token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  disease TEXT,
  fee INTEGER,
  next_visit DATE,
  prescription TEXT,
  notes TEXT,
  lab_report TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Appointments viewable by authenticated" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Appointments can be inserted by anyone" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments can be updated" ON public.appointments FOR UPDATE TO authenticated USING (true);

-- Create billing table
CREATE TABLE public.billing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id),
  patient_name TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  date DATE NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.billing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Billing viewable by authenticated" ON public.billing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Billing can be inserted" ON public.billing FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Billing can be updated" ON public.billing FOR UPDATE TO authenticated USING (true);

-- Create sms_log table
CREATE TABLE public.sms_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sms_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "SMS log viewable by authenticated" ON public.sms_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "SMS log can be inserted" ON public.sms_log FOR INSERT WITH CHECK (true);

-- Create contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact messages can be inserted by anyone" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Contact messages viewable by authenticated" ON public.contact_messages FOR SELECT TO authenticated USING (true);

-- Create staff_users table for admin/receptionist roles
CREATE TYPE public.staff_role AS ENUM ('admin', 'doctor', 'receptionist');

CREATE TABLE public.staff_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role staff_role NOT NULL,
  doctor_id UUID REFERENCES public.doctors(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff users viewable for login" ON public.staff_users FOR SELECT USING (true);
