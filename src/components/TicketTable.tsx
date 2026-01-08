import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { Ticket, User } from '@/types/ticket';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ChecklistProgress {
  ticketId: string;
  total: number;
  completed: number;
}

interface TicketTableProps {
  tickets: Ticket[];
  users: User[];
}

export const TicketTable = ({ tickets, users }: TicketTableProps) => {
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress[]>([]);

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Okänd';
  };

  const getProgress = (ticketId: string) => {
    return checklistProgress.find(p => p.ticketId === ticketId);
  };

  useEffect(() => {
    const fetchChecklistProgress = async () => {
      const ticketIds = tickets.map(t => t.id);
      if (ticketIds.length === 0) return;

      const { data } = await supabase
        .from('ticket_checklists')
        .select('ticket_id, completed')
        .in('ticket_id', ticketIds);

      if (data) {
        const progressMap = new Map<string, { total: number; completed: number }>();
        
        data.forEach(item => {
          const current = progressMap.get(item.ticket_id) || { total: 0, completed: 0 };
          current.total++;
          if (item.completed) current.completed++;
          progressMap.set(item.ticket_id, current);
        });

        setChecklistProgress(
          Array.from(progressMap.entries()).map(([ticketId, stats]) => ({
            ticketId,
            ...stats,
          }))
        );
      }
    };

    fetchChecklistProgress();
  }, [tickets]);

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Inga ärenden hittades
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioritet</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Förlopp</TableHead>
            <TableHead>Beställare</TableHead>
            <TableHead>Skapad</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell>
                <Link 
                  to={`/tickets/${ticket.id}`}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell>
                <CategoryBadge category={ticket.category} />
              </TableCell>
              <TableCell>
                {(() => {
                  const progress = getProgress(ticket.id);
                  if (!progress || progress.total === 0) {
                    return <span className="text-muted-foreground text-sm">—</span>;
                  }
                  const percentage = Math.round((progress.completed / progress.total) * 100);
                  return (
                    <div className="flex items-center gap-2 min-w-[100px]">
                      <Progress value={percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  );
                })()}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {getUserName(ticket.requesterId)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(ticket.createdAt, 'd MMM yyyy', { locale: sv })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
