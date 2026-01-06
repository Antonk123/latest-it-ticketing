import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/ticket';
import { contactSchema, contactUpdateSchema, getValidationError } from '@/lib/validations';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      setIsLoading(false);
      return;
    }

    const mapped: User[] = (data || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      department: u.company || undefined,
      createdAt: new Date(u.created_at),
    }));

    setUsers(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = useCallback(async (user: Omit<User, 'id' | 'createdAt'>) => {
    // Validate input
    const validation = contactSchema.safeParse(user);
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid contact data');
      return null;
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: validation.data.name,
        email: validation.data.email,
        company: validation.data.department || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to create contact');
      return null;
    }

    const newUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      department: data.company || undefined,
      createdAt: new Date(data.created_at),
    };

    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  }, []);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    // Validate input
    const validation = contactUpdateSchema.safeParse(updates);
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid contact data');
      return;
    }

    const validated = validation.data;
    const updateData: Record<string, unknown> = {};
    
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.email !== undefined) updateData.email = validated.email;
    if (validated.department !== undefined) updateData.company = validated.department || null;

    const { error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update contact');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    const { error } = await supabase.from('contacts').delete().eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const getUserById = useCallback(
    (id: string) => {
      return users.find((u) => u.id === id);
    },
    [users]
  );

  return {
    users,
    isLoading,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
    refetch: fetchUsers,
  };
};
