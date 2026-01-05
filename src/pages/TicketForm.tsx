import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketPriority, TicketStatus, TicketCategory, TICKET_CATEGORIES } from '@/types/ticket';
import { toast } from 'sonner';

const TicketForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tickets, addTicket, updateTicket, getTicketById } = useTickets();
  const { users } = useUsers();
  
  const isEditing = !!id;
  const existingTicket = isEditing ? getTicketById(id) : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TicketPriority,
    status: 'open' as TicketStatus,
    category: undefined as TicketCategory | undefined,
    requesterId: '',
    notes: '',
    solution: '',
  });

  useEffect(() => {
    if (existingTicket) {
      setFormData({
        title: existingTicket.title,
        description: existingTicket.description,
        priority: existingTicket.priority,
        status: existingTicket.status,
        category: existingTicket.category,
        requesterId: existingTicket.requesterId,
        notes: existingTicket.notes || '',
        solution: existingTicket.solution || '',
      });
    }
  }, [existingTicket]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requesterId) {
      toast.error('Please select a requester');
      return;
    }

    if (isEditing && id) {
      updateTicket(id, formData);
      toast.success('Ticket updated successfully');
    } else {
      addTicket(formData);
      toast.success('Ticket created successfully');
    }
    navigate('/tickets');
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Ticket' : 'Create New Ticket'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description * <span className="text-xs text-muted-foreground">(Markdown supported)</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the problem... (supports **bold**, *italic*, `code`, lists, etc.)"
                  rows={6}
                  required
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requester *</Label>
                  <Select 
                    value={formData.requesterId} 
                    onValueChange={(v) => setFormData({ ...formData, requesterId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.length === 0 ? (
                        <SelectItem value="" disabled>No users available</SelectItem>
                      ) : (
                        users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {users.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      <a href="/users" className="text-primary hover:underline">Add users</a> to assign tickets
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category || ''} 
                    onValueChange={(v) => setFormData({ ...formData, category: v as TicketCategory })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TICKET_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(v) => setFormData({ ...formData, status: v as TicketStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="solution">
                  Solution <span className="text-xs text-muted-foreground">(Markdown supported)</span>
                </Label>
                <Textarea
                  id="solution"
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="Document how the issue was fixed..."
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditing ? 'Save Changes' : 'Create Ticket'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TicketForm;
