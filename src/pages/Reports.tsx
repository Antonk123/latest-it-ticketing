import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layout } from '@/components/Layout';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TicketTable } from '@/components/TicketTable';
import { BarChart3, PieChart as PieChartIcon, Filter, Calendar } from 'lucide-react';

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

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Reports = () => {
  const { tickets } = useTickets();
  const { users } = useUsers();
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Get available years from tickets
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    tickets.forEach((ticket) => {
      const createdYear = new Date(ticket.createdAt).getFullYear();
      years.add(createdYear);
      if (ticket.closedAt) {
        years.add(new Date(ticket.closedAt).getFullYear());
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [tickets]);

  // Filter tickets by year and month
  const yearMonthFilteredTickets = useMemo(() => {
    let filtered = tickets;
    
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      filtered = filtered.filter((ticket) => {
        const createdYear = new Date(ticket.createdAt).getFullYear();
        return createdYear === year;
      });
    }
    
    if (selectedMonth !== 'all') {
      const month = parseInt(selectedMonth);
      filtered = filtered.filter((ticket) => {
        const createdMonth = new Date(ticket.createdAt).getMonth();
        return createdMonth === month;
      });
    }
    
    return filtered;
  }, [tickets, selectedYear, selectedMonth]);

  // Tickets closed by year (for overview chart)
  const ticketsClosedByYear = useMemo(() => {
    const yearMap = new Map<number, number>();
    tickets.forEach((ticket) => {
      if (ticket.closedAt) {
        const year = new Date(ticket.closedAt).getFullYear();
        const count = yearMap.get(year) || 0;
        yearMap.set(year, count + 1);
      }
    });
    return Array.from(yearMap.entries())
      .map(([year, count]) => ({ year: year.toString(), count }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));
  }, [tickets]);

  // Tickets by month (for selected year)
  const ticketsByMonth = useMemo(() => {
    if (selectedYear === 'all') return [];
    
    const year = parseInt(selectedYear);
    const monthCounts = new Array(12).fill(0);
    
    tickets.forEach((ticket) => {
      const date = new Date(ticket.createdAt);
      if (date.getFullYear() === year) {
        monthCounts[date.getMonth()]++;
      }
    });
    
    return monthCounts.map((count, index) => ({
      month: MONTH_NAMES[index].substring(0, 3),
      fullMonth: MONTH_NAMES[index],
      monthIndex: index,
      count,
    }));
  }, [tickets, selectedYear]);

  // Tickets by requester (user) - filtered by year and month
  const ticketsByUser = useMemo(() => {
    const counts: Record<string, { name: string; count: number; userId: string }> = {};
    
    yearMonthFilteredTickets.forEach(ticket => {
      const user = users.find(u => u.id === ticket.requesterId);
      const userName = user?.name || 'Unassigned';
      const userId = ticket.requesterId || 'unassigned';
      
      if (!counts[userId]) {
        counts[userId] = { name: userName, count: 0, userId };
      }
      counts[userId].count++;
    });
    
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [yearMonthFilteredTickets, users]);

  // Tickets by status - filtered by year and month
  const ticketsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      open: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0,
    };
    
    yearMonthFilteredTickets.forEach(ticket => {
      counts[ticket.status] = (counts[ticket.status] || 0) + 1;
    });
    
    return Object.entries(counts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
      status,
    }));
  }, [yearMonthFilteredTickets]);

  // Tickets by priority - filtered by year and month
  const ticketsByPriority = useMemo(() => {
    const counts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };
    
    yearMonthFilteredTickets.forEach(ticket => {
      counts[ticket.priority] = (counts[ticket.priority] || 0) + 1;
    });
    
    return Object.entries(counts).map(([priority, count]) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      value: count,
    }));
  }, [yearMonthFilteredTickets]);

  // Filtered tickets by selected user
  const filteredTickets = useMemo(() => {
    if (selectedUserId === 'all') {
      return yearMonthFilteredTickets;
    }
    if (selectedUserId === 'unassigned') {
      return yearMonthFilteredTickets.filter(t => !t.requesterId);
    }
    return yearMonthFilteredTickets.filter(t => t.requesterId === selectedUserId);
  }, [yearMonthFilteredTickets, selectedUserId]);

  const selectedUserName = useMemo(() => {
    if (selectedUserId === 'all') return 'All Users';
    if (selectedUserId === 'unassigned') return 'Unassigned';
    return users.find(u => u.id === selectedUserId)?.name || 'Unknown';
  }, [selectedUserId, users]);

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">Ticket analytics and insights</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedYear} onValueChange={(value) => {
              setSelectedYear(value);
              if (value === 'all') setSelectedMonth('all');
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedYear !== 'all' && (
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTH_NAMES.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Tickets Closed by Year */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Tickets Closed by Year</CardTitle>
          </CardHeader>
          <CardContent>
            {ticketsClosedByYear.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No closed tickets
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ticketsClosedByYear} margin={{ left: 20, right: 20 }}>
                  <XAxis dataKey="year" />
                  <YAxis allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    cursor={{ fill: 'hsl(var(--muted))' }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tickets by Month (when year is selected) */}
        {selectedYear !== 'all' && (
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tickets Created by Month ({selectedYear})</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsByMonth.every(m => m.count === 0) ? (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  No tickets in {selectedYear}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ticketsByMonth} margin={{ left: 20, right: 20 }}>
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      formatter={(value, name, props) => [value, props.payload.fullMonth]}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                      onClick={(data) => setSelectedMonth(data.monthIndex.toString())}
                      className="cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

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
              {yearMonthFilteredTickets.length === 0 ? (
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
            {yearMonthFilteredTickets.length === 0 ? (
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
