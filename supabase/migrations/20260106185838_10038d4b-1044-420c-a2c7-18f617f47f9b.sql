-- Create storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ticket-attachments', 'ticket-attachments', true);

-- RLS policies for ticket attachments bucket
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can update attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'ticket-attachments');

CREATE POLICY "Authenticated users can delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'ticket-attachments');

-- Create attachments table to track files per ticket
CREATE TABLE public.ticket_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on attachments table
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for attachments table
CREATE POLICY "Authenticated users can view attachments"
ON public.ticket_attachments FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert attachments"
ON public.ticket_attachments FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete attachments"
ON public.ticket_attachments FOR DELETE
TO authenticated USING (true);