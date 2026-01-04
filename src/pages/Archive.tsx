import { useState, useMemo } from 'react';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { Layout } from '@/components/Layout';
import { TicketTable } from '@/components/TicketTable';
import { SearchBar } from '@/components/SearchBar';
import { Archive as ArchiveIcon } from 'lucide-react';

const Archive = () => {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const [search, setSearch] = useState('');

  const closedTickets = useMemo(() => {
    return tickets
      .filter(t => t.status === 'closed')
      .filter(ticket => {
        if (search === '') return true;
        return ticket.title.toLowerCase().includes(search.toLowerCase()) ||
          ticket.description.toLowerCase().includes(search.toLowerCase());
      })
      .sort((a, b) => (b.closedAt?.getTime() || 0) - (a.closedAt?.getTime() || 0));
  }, [tickets, search]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Archive</h1>
          <p className="text-muted-foreground mt-1">
            {closedTickets.length} closed ticket{closedTickets.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search archived tickets..."
          />
        </div>

        {closedTickets.length === 0 && search === '' ? (
          <div className="text-center py-16 border rounded-lg bg-card">
            <ArchiveIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No archived tickets yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Closed tickets will appear here
            </p>
          </div>
        ) : (
          <TicketTable tickets={closedTickets} users={users} />
        )}
      </div>
    </Layout>
  );
};

export default Archive;
