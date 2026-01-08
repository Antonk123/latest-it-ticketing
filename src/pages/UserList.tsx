import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Plus, Pencil, Trash2, Users as UsersIcon, Ticket } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useTickets } from '@/hooks/useTickets';
import { Layout } from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { UserTicketHistory } from '@/components/UserTicketHistory';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types/ticket';

const UserList = () => {
  const { users, addUser, updateUser, deleteUser } = useUsers();
  const { tickets } = useTickets();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', department: '' });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openTicketsByUser = useMemo(() => {
    const counts: Record<string, number> = {};
    tickets.forEach(ticket => {
      if (ticket.requesterId && ticket.status !== 'closed') {
        counts[ticket.requesterId] = (counts[ticket.requesterId] || 0) + 1;
      }
    });
    return counts;
  }, [tickets]);

  const filteredUsers = users.filter(user => {
    if (search === '') return true;
    return user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.department?.toLowerCase().includes(search.toLowerCase());
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      addUser(formData);
    }
    setFormData({ name: '', email: '', department: '' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, department: user.department || '' });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setFormData({ name: '', email: '', department: '' });
    setEditingUser(null);
    setIsDialogOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Användare</h1>
            <p className="text-muted-foreground mt-1">
              {users.length} användare i systemet
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleDialogClose()}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Lägg till användare
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Redigera användare' : 'Lägg till ny användare'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Namn *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Johan Andersson"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-post *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="johan@foretag.se"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Avdelning</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Försäljning, Teknik, etc."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Avbryt
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Spara ändringar' : 'Lägg till användare'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Sök användare..."
          />
        </div>

        {filteredUsers.length === 0 && search === '' ? (
          <div className="text-center py-16 border rounded-lg bg-card">
            <UsersIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Inga användare ännu</p>
            <p className="text-sm text-muted-foreground mt-1">
              Lägg till användare för att tilldela dem ärenden
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-foreground truncate">{user.name}</h3>
                        {openTicketsByUser[user.id] > 0 && (
                          <Badge variant="secondary" className="shrink-0">
                            {openTicketsByUser[user.id]} öppna
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      {user.department && (
                        <p className="text-sm text-muted-foreground mt-1">{user.department}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Tillagd {format(user.createdAt, 'd MMM yyyy', { locale: sv })}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ta bort användare</AlertDialogTitle>
                            <AlertDialogDescription>
                              Är du säker på att du vill ta bort {user.name}? Denna åtgärd kan inte ångras.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Avbryt</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteUser(user.id)}>
                              Ta bort
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => setSelectedUser(user)}
                  >
                    <Ticket className="w-4 h-4" />
                    Visa ärenden
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Ticket History Sheet */}
        <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{selectedUser?.name}s ärenden</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              {selectedUser && <UserTicketHistory userId={selectedUser.id} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
};

export default UserList;
