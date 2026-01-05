export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory = 'windows' | 'mac' | 'network' | 'hardware' | 'software' | 'email' | 'security' | 'other';

export const TICKET_CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'mac', label: 'Mac' },
  { value: 'network', label: 'Network' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'email', label: 'Email' },
  { value: 'security', label: 'Security' },
  { value: 'other', label: 'Other' },
];

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
  category?: TicketCategory;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  notes?: string;
  solution?: string;
}
