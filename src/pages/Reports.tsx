import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layout } from '@/components/Layout';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketTable } from '@/components/TicketTable';
import { BarChart3, PieChart as PieChartIcon, Filter } from 'lucide-react';

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

const STATUS_COLORS: Record<string, string> = {
  open: 'hsl(var(--chart-1))',
  'in-progress': 'hsl(var(--chart-2))',
  resolved: 'hsl(var(--chart-3))',
  closed: 'hsl(var(--chart-4))',
};

const Reports = () => {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');

  // Tickets by requester (user)
  const ticketsByUser = useMemo(() => {
    const counts: Record<string, { name: string; count: number; userId: string }> = {};
    
    tickets.forEach(ticket => {
      const user = users.find(u => u.id === ticket.requesterId);
      const userName = user?.name || 'Unassigned';
      const userId = ticket.requesterId || 'unassigned';
      
      if (!counts[userId]) {
        counts[userId] = { name: userName, count: 0, userId };
      }
      counts[userId].count++;
    });
    
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [tickets, users]);

  // Tickets by status
  const ticketsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0,
    };
    
    tickets.forEach(ticket => {
      counts[ticket.status] = (counts[ticket.status] || 0) + 1;
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
      status,
    }));
  }, [tickets]);

  // Tickets by priority
  const ticketsByPriority = useMemo(() => {
    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    tickets.forEach(ticket => {
      counts[ticket.priority] = (counts[ticket.priority] || 0) + 1;
    });
    
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
    }));
  }, [tickets]);

  // Filtered tickets by selected user
  const filteredTickets = useMemo(() => {
    if (selectedUserId === 'all') {
      return tickets;
    }
    if (selectedUserId === 'unassigned') {
      return tickets.filter(t => !t.requesterId);
    }
    return tickets.filter(t => t.requesterId === selectedUserId);
  }, [tickets, selectedUserId]);

  const selectedUserName = useMemo(() => {
    if (selectedUserId === 'all') return 'All Users';
    if (selectedUserId === 'unassigned') return 'Unassigned';
    return users.find(u => u.id === selectedUserId)?.name || 'Unknown';
  }, [selectedUserId, users]);

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-1">Ticket analytics and insights</p>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tickets by User Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tickets by Requester</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsByUser.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No ticket data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ticketsByUser} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]}
                      onClick={(data) => setSelectedUserId(data.userId)}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Tickets by Status Pie Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tickets by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No ticket data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={ticketsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      labelLine={false}
                    >
                      {ticketsByStatus.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Priority Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No ticket data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ticketsByPriority} margin={{ left: 20, right: 20 }}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ticketsByPriority.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Filter and Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                Tickets for {selectedUserName}
              </CardTitle>
            </div>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {ticketsByUser.map((item) => (
                  <SelectItem key={item.userId} value={item.userId}>
                    {item.name} ({item.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <TicketTable tickets={filteredTickets} users={users} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
