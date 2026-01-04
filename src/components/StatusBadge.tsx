import { TicketStatus } from '@/types/ticket';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusLabels: Record<TicketStatus, string> = {
  'open': 'Open',
  'in-progress': 'In Progress',
  'resolved': 'Resolved',
  'closed': 'Closed',
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      `status-badge-${status}`,
      className
    )}>
      {statusLabels[status]}
    </span>
  );
};
