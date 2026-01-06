import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { ticketInsertSchema, ticketUpdateSchema, getValidationError } from '@/lib/validations';
import { toast } from 'sonner';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) console.error('Error fetching tickets:', error);
      setIsLoading(false);
      return;
    }

    const mapped: Ticket[] = (data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TicketStatus,
      priority: t.priority as TicketPriority,
      category: t.category_id || undefined,
      requesterId: t.requester_id || '',
      createdAt: new Date(t.created_at),
      updatedAt: new Date(t.updated_at),
      resolvedAt: t.resolved_at ? new Date(t.resolved_at) : undefined,
      closedAt: t.closed_at ? new Date(t.closed_at) : undefined,
      notes: t.notes || undefined,
      solution: t.solution || undefined,
    }));

    setTickets(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = useCallback(async (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate input
    const validation = ticketInsertSchema.safeParse(ticket);
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid ticket data');
      return null;
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: validation.data.title,
        description: validation.data.description,
        status: validation.data.status,
        priority: validation.data.priority,
        category_id: validation.data.category || null,
        requester_id: validation.data.requesterId || null,
        notes: validation.data.notes || null,
        solution: validation.data.solution || null,
      })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding ticket:', error);
      toast.error('Failed to create ticket');
      return null;
    }

    const newTicket: Ticket = {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as TicketStatus,
      priority: data.priority as TicketPriority,
      category: data.category_id || undefined,
      requesterId: data.requester_id || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes || undefined,
      solution: data.solution || undefined,
    };

    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  }, []);

  const updateTicket = useCallback(async (id: string, updates: Partial<Ticket>) => {
    // Validate input
    const validation = ticketUpdateSchema.safeParse(updates);
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid ticket data');
      return;
    }

    const validated = validation.data;
    const updateData: Record<string, unknown> = {};
    
    if (validated.title !== undefined) updateData.title = validated.title;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.priority !== undefined) updateData.priority = validated.priority;
    if (validated.category !== undefined) updateData.category_id = validated.category || null;
    if (validated.requesterId !== undefined) updateData.requester_id = validated.requesterId || null;
    if (validated.notes !== undefined) updateData.notes = validated.notes || null;
    if (validated.solution !== undefined) updateData.solution = validated.solution || null;
    
    if (validated.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    if (validated.status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket');
      return;
    }

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedTicket = { ...t, ...updates, updatedAt: new Date() };
          if (updates.status === 'resolved' && !t.resolvedAt) {
            updatedTicket.resolvedAt = new Date();
          }
          if (updates.status === 'closed' && !t.closedAt) {
            updatedTicket.closedAt = new Date();
          }
          return updatedTicket;
        }
        return t;
      })
    );
  }, []);

  const deleteTicket = useCallback(async (id: string) => {
    const { error } = await supabase.from('tickets').delete().eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error deleting ticket:', error);
      return;
    }

    setTickets((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getTicketById = useCallback(
    (id: string) => {
      return tickets.find((t) => t.id === id);
    },
    [tickets]
  );

  return {
    tickets,
    isLoading,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
    refetch: fetchTickets,
  };
};
