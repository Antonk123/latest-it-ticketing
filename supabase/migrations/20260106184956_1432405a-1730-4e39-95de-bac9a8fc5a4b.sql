-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contacts table (ticket requesters)
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category_id UUID REFERENCES public.categories(id),
  requester_id UUID REFERENCES public.contacts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- RLS policies for categories (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view categories" ON public.categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert categories" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON public.categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete categories" ON public.categories
  FOR DELETE TO authenticated USING (true);

-- RLS policies for contacts (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view contacts" ON public.contacts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert contacts" ON public.contacts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update contacts" ON public.contacts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete contacts" ON public.contacts
  FOR DELETE TO authenticated USING (true);

-- RLS policies for tickets (authenticated users can CRUD)
CREATE POLICY "Authenticated users can view tickets" ON public.tickets
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tickets" ON public.tickets
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tickets" ON public.tickets
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete tickets" ON public.tickets
  FOR DELETE TO authenticated USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates on tickets
CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.categories (name, label) VALUES
  ('hardware', 'Hardware'),
  ('software', 'Software'),
  ('network', 'Network'),
  ('access', 'Access'),
  ('other', 'Other');