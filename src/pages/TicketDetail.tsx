import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ArrowLeft, Pencil, Trash2, Clock, User as UserIcon, Calendar, FileText, Lightbulb, Paperclip, Download } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { useTicketAttachments } from '@/hooks/useTicketAttachments';
import { useTicketChecklists } from '@/hooks/useTicketChecklists';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { TicketChecklist } from '@/components/TicketChecklist';
import { Layout } from '@/components/Layout';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { CategoryBadge } from '@/components/CategoryBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { TicketStatus } from '@/types/ticket';
import { toast } from 'sonner';

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const statusLabels: Record<TicketStatus, string> = {
  'open': 'Öppen',
  'in-progress': 'Pågående',
  'resolved': 'Löst',
  'closed': 'Stängd',
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTicketById, updateTicket, deleteTicket } = useTickets();
  const { getUserById } = useUsers();
  const { attachments, fetchAttachments } = useTicketAttachments();
  const { items: checklistItems, fetchChecklists, updateChecklistItem } = useTicketChecklists();

  const ticket = id ? getTicketById(id) : null;
  const user = ticket ? getUserById(ticket.requesterId) : null;

  useEffect(() => {
    if (id) {
      fetchAttachments(id);
      fetchChecklists(id);
    }
  }, [id, fetchAttachments, fetchChecklists]);

  if (!ticket) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Ärendet hittades inte</p>
          <Link to="/tickets">
            <Button className="mt-4">Tillbaka till ärenden</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleStatusChange = (status: TicketStatus) => {
    updateTicket(ticket.id, { status });
    toast.success(`Status uppdaterad till ${statusLabels[status]}`);
  };

  const handleDelete = () => {
    deleteTicket(ticket.id);
    toast.success('Ärendet borttaget');
    navigate('/tickets');
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka
          </Button>
          <div className="flex gap-2">
            <Link to={`/tickets/${ticket.id}/edit`}>
              <Button variant="outline" className="gap-2">
                <Pencil className="w-4 h-4" />
                Redigera
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive">
                  <Trash2 className="w-4 h-4" />
                  Ta bort
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ta bort ärende</AlertDialogTitle>
                  <AlertDialogDescription>
                    Är du säker på att du vill ta bort detta ärende? Denna åtgärd kan inte ångras.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Ta bort</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">{ticket.title}</CardTitle>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <CategoryBadge category={ticket.category} />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Status Change */}
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">Snabbåtgärder:</span>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Öppen</SelectItem>
                  <SelectItem value="in-progress">Pågående</SelectItem>
                  <SelectItem value="resolved">Löst</SelectItem>
                  <SelectItem value="closed">Stäng ärende</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-medium text-foreground mb-2">Beskrivning</h3>
              <div className="bg-muted/30 p-4 rounded-lg">
                <MarkdownRenderer content={ticket.description} />
              </div>
            </div>

            {/* Checklist */}
            {checklistItems.length > 0 && (
              <div className="pt-4 border-t">
                <div className="border rounded-lg p-4">
                  <TicketChecklist
                    items={checklistItems}
                    onToggle={(id, completed) => updateChecklistItem(id, { completed })}
                    readOnly={false}
                  />
                </div>
              </div>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">
                    Bilagor ({attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((attachment) => {
                    const isImage = attachment.fileType?.startsWith('image/');
                    return (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors group"
                      >
                        {isImage ? (
                          <img
                            src={attachment.url}
                            alt={attachment.fileName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-muted rounded">
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate group-hover:underline">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Beställare</p>
                  <p className="font-medium">{user?.name || 'Okänd'}</p>
                  {user?.email && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Skapad</p>
                  <p className="font-medium">{format(ticket.createdAt, 'PPP', { locale: sv })}</p>
                  <p className="text-sm text-muted-foreground">{format(ticket.createdAt, 'p', { locale: sv })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Senast uppdaterad</p>
                  <p className="font-medium">{format(ticket.updatedAt, 'PPP', { locale: sv })}</p>
                </div>
              </div>
              {ticket.resolvedAt && (
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Löst</p>
                    <p className="font-medium">{format(ticket.resolvedAt, 'PPP', { locale: sv })}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Solution */}
            {ticket.solution && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  <h3 className="font-medium text-foreground">Lösning</h3>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <MarkdownRenderer content={ticket.solution} />
                </div>
              </div>
            )}

            {/* Notes */}
            {ticket.notes && (
              <div className="pt-4 border-t">
                <h3 className="font-medium text-foreground mb-2">Interna anteckningar</h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                  {ticket.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TicketDetail;
