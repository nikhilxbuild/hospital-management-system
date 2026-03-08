
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "OTP codes insertable" ON public.otp_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "OTP codes selectable" ON public.otp_codes FOR SELECT USING (true);
CREATE POLICY "OTP codes updatable" ON public.otp_codes FOR UPDATE USING (true);
CREATE POLICY "OTP codes deletable" ON public.otp_codes FOR DELETE USING (true);
