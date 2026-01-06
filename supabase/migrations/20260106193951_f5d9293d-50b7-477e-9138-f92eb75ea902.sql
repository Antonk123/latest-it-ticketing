-- Add notes and solution columns to tickets table
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS solution text;

-- Create ticket_checklists table
CREATE TABLE public.ticket_checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  label text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_checklists ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Authenticated users can view checklists"
ON public.ticket_checklists
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert checklists"
ON public.ticket_checklists
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklists"
ON public.ticket_checklists
FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete checklists"
ON public.ticket_checklists
FOR DELETE
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_ticket_checklists_updated_at
BEFORE UPDATE ON public.ticket_checklists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_ticket_checklists_ticket_id ON public.ticket_checklists(ticket_id);