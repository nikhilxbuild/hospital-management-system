
CREATE TABLE public.billing_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  billing_id uuid NOT NULL REFERENCES public.billing(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Billing items viewable" ON public.billing_items FOR SELECT USING (true);
CREATE POLICY "Billing items insertable" ON public.billing_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Billing items updatable" ON public.billing_items FOR UPDATE USING (true);
CREATE POLICY "Billing items deletable" ON public.billing_items FOR DELETE USING (true);
