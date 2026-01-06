import { z } from 'zod';

// Ticket validation schemas
export const ticketInsertSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().min(1, 'Description is required').max(5000, 'Description must be less than 5000 characters'),
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  notes: z.string().max(5000, 'Notes must be less than 5000 characters').optional().nullable(),
  solution: z.string().max(5000, 'Solution must be less than 5000 characters').optional().nullable(),
  category: z.string().uuid().optional(),
  requesterId: z.string().optional(),
});

export const ticketUpdateSchema = ticketInsertSchema.partial();

// Contact validation schemas
export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email format').max(255, 'Email must be less than 255 characters'),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
});

export const contactUpdateSchema = contactSchema.partial();

// Category validation schemas
export const categorySchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(50, 'Label must be less than 50 characters'),
});

// Checklist validation schemas
export const checklistItemSchema = z.object({
  label: z.string().trim().min(1, 'Label is required').max(200, 'Label must be less than 200 characters'),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File)
    .refine(f => f.size <= 10 * 1024 * 1024, 'File must be 10MB or less')
    .refine(
      f => [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ].includes(f.type),
      'Invalid file type. Allowed: images, PDF, text, Word documents'
    ),
});

// Helper to get validation error message
export const getValidationError = (error: unknown): string | null => {
  if (error instanceof z.ZodError) {
    return error.errors.map(e => e.message).join(', ');
  }
  return null;
};
