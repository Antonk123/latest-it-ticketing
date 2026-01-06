import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';

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
      console.error('Error fetching tickets:', error);
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
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category_id: ticket.category || null,
        requester_id: ticket.requesterId || null,
        notes: ticket.notes || null,
        solution: ticket.solution || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding ticket:', error);
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
    const updateData: Record<string, unknown> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.category !== undefined) updateData.category_id = updates.category || null;
    if (updates.requesterId !== undefined) updateData.requester_id = updates.requesterId || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;
    if (updates.solution !== undefined) updateData.solution = updates.solution || null;
    
    if (updates.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }
    if (updates.status === 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('tickets')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating ticket:', error);
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
      console.error('Error deleting ticket:', error);
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
