export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Category {
  id: string;
  label: string;
  icon?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'windows', label: 'Windows', icon: 'monitor' },
  { id: 'mac', label: 'Mac', icon: 'apple' },
  { id: 'network', label: 'Network', icon: 'wifi' },
  { id: 'hardware', label: 'Hardware', icon: 'hard-drive' },
  { id: 'software', label: 'Software', icon: 'app-window' },
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'security', label: 'Security', icon: 'shield' },
  { id: 'other', label: 'Other', icon: 'help-circle' },
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
  category?: string;
  requesterId: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  notes?: string;
  solution?: string;
}
