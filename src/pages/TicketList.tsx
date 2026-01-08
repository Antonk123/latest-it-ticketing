import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { useCategories } from '@/hooks/useCategories';
import { Layout } from '@/components/Layout';
import { TicketTable } from '@/components/TicketTable';
import { SearchBar } from '@/components/SearchBar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TicketStatus, TicketPriority } from '@/types/ticket';

const TicketList = () => {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');

  const activeTickets = useMemo(() => {
    return tickets.filter(t => t.status !== 'closed');
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return activeTickets.filter(ticket => {
      const matchesSearch = search === '' || 
        ticket.title.toLowerCase().includes(search.toLowerCase()) ||
        ticket.description.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [activeTickets, search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Alla ärenden</h1>
            <p className="text-muted-foreground mt-1">
              {filteredTickets.length} aktiv{filteredTickets.length !== 1 ? 'a' : 't'} ärende{filteredTickets.length !== 1 ? 'n' : ''}
            </p>
          </div>
          <Link to="/tickets/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Nytt ärende
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Sök ärenden..."
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla statusar</SelectItem>
                <SelectItem value="open">Öppen</SelectItem>
                <SelectItem value="in-progress">Pågående</SelectItem>
                <SelectItem value="resolved">Löst</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Prioritet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla prioriteter</SelectItem>
                <SelectItem value="low">Låg</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">Hög</SelectItem>
                <SelectItem value="critical">Kritisk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alla kategorier</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tickets Table */}
        <TicketTable tickets={filteredTickets} users={users} />
      </div>
    </Layout>
  );
};

export default TicketList;
