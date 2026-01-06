export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Category {
  id: string;
  label: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  notes?: string;
  solution?: string;
}
