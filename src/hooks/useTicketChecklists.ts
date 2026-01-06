import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  id: string;
  ticket_id: string;
  label: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export const useTicketChecklists = (ticketId?: string) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchChecklists = useCallback(async (id?: string) => {
    const targetId = id || ticketId;
    if (!targetId) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('ticket_checklists')
      .select('*')
      .eq('ticket_id', targetId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching checklists:', error);
      setIsLoading(false);
      return;
    }

    setItems(data || []);
    setIsLoading(false);
  }, [ticketId]);

  const addChecklistItem = useCallback(async (targetTicketId: string, label: string) => {
    const maxPosition = items.length > 0 
      ? Math.max(...items.map(i => i.position)) + 1 
      : 0;

    const { data, error } = await supabase
      .from('ticket_checklists')
      .insert({
        ticket_id: targetTicketId,
        label,
        position: maxPosition,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding checklist item:', error);
      return null;
    }

    setItems(prev => [...prev, data]);
    return data;
  }, [items]);

  const updateChecklistItem = useCallback(async (id: string, updates: Partial<Pick<ChecklistItem, 'label' | 'completed'>>) => {
    const { error } = await supabase
      .from('ticket_checklists')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating checklist item:', error);
      return;
    }

    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, []);

  const deleteChecklistItem = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('ticket_checklists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting checklist item:', error);
      return;
    }

    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const bulkAddChecklistItems = useCallback(async (targetTicketId: string, labels: string[]) => {
    if (labels.length === 0) return [];

    const insertData = labels.map((label, index) => ({
      ticket_id: targetTicketId,
      label,
      position: index,
    }));

    const { data, error } = await supabase
      .from('ticket_checklists')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Error bulk adding checklist items:', error);
      return [];
    }

    return data || [];
  }, []);

  return {
    items,
    isLoading,
    fetchChecklists,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    bulkAddChecklistItems,
    setItems,
  };
};
