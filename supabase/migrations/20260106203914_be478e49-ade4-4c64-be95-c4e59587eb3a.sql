-- Make the ticket-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'ticket-attachments';