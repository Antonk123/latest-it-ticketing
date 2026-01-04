import { useState, useEffect, useCallback } from 'react';
import { Ticket, TicketStatus, TicketPriority } from '@/types/ticket';
import { getTickets, saveTickets, generateId } from '@/lib/storage';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    setTickets(getTickets());
  }, []);

  const addTicket = useCallback((ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = [...tickets, newTicket];
    setTickets(updated);
    saveTickets(updated);
    return newTicket;
  }, [tickets]);

  const updateTicket = useCallback((id: string, updates: Partial<Ticket>) => {
    const updated = tickets.map(t => {
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
    });
    setTickets(updated);
    saveTickets(updated);
  }, [tickets]);

  const deleteTicket = useCallback((id: string) => {
    const updated = tickets.filter(t => t.id !== id);
    setTickets(updated);
    saveTickets(updated);
  }, [tickets]);

  const getTicketById = useCallback((id: string) => {
    return tickets.find(t => t.id === id);
  }, [tickets]);

  return {
    tickets,
    addTicket,
    updateTicket,
    deleteTicket,
    getTicketById,
  };
};
