import { TicketCategory, TICKET_CATEGORIES } from '@/types/ticket';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  Apple, 
  Wifi, 
  HardDrive, 
  AppWindow, 
  Mail, 
  Shield, 
  HelpCircle 
} from 'lucide-react';

interface CategoryBadgeProps {
  category?: TicketCategory;
}

const categoryIcons: Record<TicketCategory, React.ElementType> = {
  windows: Monitor,
  mac: Apple,
  network: Wifi,
  hardware: HardDrive,
  software: AppWindow,
  email: Mail,
  security: Shield,
  other: HelpCircle,
};

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  if (!category) return null;
  
  const Icon = categoryIcons[category];
  const label = TICKET_CATEGORIES.find(c => c.value === category)?.label || category;

  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  );
};
