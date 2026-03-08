
-- Add max_patients_per_day column
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS max_patients_per_day integer NOT NULL DEFAULT 30;

-- Fix RLS policies: drop restrictive ones and recreate as permissive

-- doctors table
DROP POLICY IF EXISTS "Doctors are viewable by everyone" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be updated by authenticated users" ON public.doctors;
DROP POLICY IF EXISTS "Doctors can be inserted by authenticated users" ON public.doctors;

CREATE POLICY "Doctors are viewable by everyone" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Doctors can be updated" ON public.doctors FOR UPDATE USING (true);
CREATE POLICY "Doctors can be inserted" ON public.doctors FOR INSERT WITH CHECK (true);

-- appointments table
DROP POLICY IF EXISTS "Appointments viewable by authenticated" ON public.appointments;
DROP POLICY IF EXISTS "Appointments can be inserted by anyone" ON public.appointments;
DROP POLICY IF EXISTS "Appointments can be updated" ON public.appointments;

CREATE POLICY "Appointments viewable" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Appointments insertable" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments updatable" ON public.appointments FOR UPDATE USING (true);

-- billing table
DROP POLICY IF EXISTS "Billing viewable by authenticated" ON public.billing;
DROP POLICY IF EXISTS "Billing can be inserted" ON public.billing;
DROP POLICY IF EXISTS "Billing can be updated" ON public.billing;

CREATE POLICY "Billing viewable" ON public.billing FOR SELECT USING (true);
CREATE POLICY "Billing insertable" ON public.billing FOR INSERT WITH CHECK (true);
CREATE POLICY "Billing updatable" ON public.billing FOR UPDATE USING (true);

-- patients table
DROP POLICY IF EXISTS "Patients viewable by authenticated" ON public.patients;
DROP POLICY IF EXISTS "Patients can insert themselves" ON public.patients;
DROP POLICY IF EXISTS "Patients can update" ON public.patients;

CREATE POLICY "Patients viewable" ON public.patients FOR SELECT USING (true);
CREATE POLICY "Patients insertable" ON public.patients FOR INSERT WITH CHECK (true);
CREATE POLICY "Patients updatable" ON public.patients FOR UPDATE USING (true);

-- sms_log table
DROP POLICY IF EXISTS "SMS log viewable by authenticated" ON public.sms_log;
DROP POLICY IF EXISTS "SMS log can be inserted" ON public.sms_log;

CREATE POLICY "SMS log viewable" ON public.sms_log FOR SELECT USING (true);
CREATE POLICY "SMS log insertable" ON public.sms_log FOR INSERT WITH CHECK (true);

-- contact_messages table
DROP POLICY IF EXISTS "Contact messages can be inserted by anyone" ON public.contact_messages;
DROP POLICY IF EXISTS "Contact messages viewable by authenticated" ON public.contact_messages;

CREATE POLICY "Contact messages viewable" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "Contact messages insertable" ON public.contact_messages FOR INSERT WITH CHECK (true);

-- staff_users table
DROP POLICY IF EXISTS "Staff users viewable for login" ON public.staff_users;

CREATE POLICY "Staff users viewable" ON public.staff_users FOR SELECT USING (true);
CREATE POLICY "Staff users insertable" ON public.staff_users FOR INSERT WITH CHECK (true);
