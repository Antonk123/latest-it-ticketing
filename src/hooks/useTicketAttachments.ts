import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  fileType: string | null;
  createdAt: Date;
  url: string;
}

export const useTicketAttachments = (ticketId?: string) => {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fetchAttachments = useCallback(async (id: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching attachments:', error);
      setIsLoading(false);
      return;
    }

    const mapped: TicketAttachment[] = (data || []).map((a) => {
      const { data: urlData } = supabase.storage
        .from('ticket-attachments')
        .getPublicUrl(a.file_path);

      return {
        id: a.id,
        ticketId: a.ticket_id,
        fileName: a.file_name,
        filePath: a.file_path,
        fileSize: a.file_size,
        fileType: a.file_type,
        createdAt: new Date(a.created_at),
        url: urlData.publicUrl,
      };
    });

    setAttachments(mapped);
    setIsLoading(false);
  }, []);

  const uploadAttachment = useCallback(async (ticketId: string, file: File) => {
    setIsUploading(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      setIsUploading(false);
      return null;
    }

    const { data: insertData, error: insertError } = await supabase
      .from('ticket_attachments')
      .insert({
        ticket_id: ticketId,
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        file_type: file.type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error saving attachment record:', insertError);
      setIsUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('ticket-attachments')
      .getPublicUrl(fileName);

    const newAttachment: TicketAttachment = {
      id: insertData.id,
      ticketId: insertData.ticket_id,
      fileName: insertData.file_name,
      filePath: insertData.file_path,
      fileSize: insertData.file_size,
      fileType: insertData.file_type,
      createdAt: new Date(insertData.created_at),
      url: urlData.publicUrl,
    };

    setAttachments((prev) => [...prev, newAttachment]);
    setIsUploading(false);
    return newAttachment;
  }, []);

  const deleteAttachment = useCallback(async (attachment: TicketAttachment) => {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('ticket-attachments')
      .remove([attachment.filePath]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('ticket_attachments')
      .delete()
      .eq('id', attachment.id);

    if (dbError) {
      console.error('Error deleting attachment record:', dbError);
      return false;
    }

    setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    return true;
  }, []);

  return {
    attachments,
    isLoading,
    isUploading,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
  };
};
