import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/ticket';
import { getUsers, saveUsers, generateId } from '@/lib/storage';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  const addUser = useCallback((user: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...user,
      id: generateId(),
      createdAt: new Date(),
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    return newUser;
  }, [users]);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    const updated = users.map(u => 
      u.id === id ? { ...u, ...updates } : u
    );
    setUsers(updated);
    saveUsers(updated);
  }, [users]);

  const deleteUser = useCallback((id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
  }, [users]);

  const getUserById = useCallback((id: string) => {
    return users.find(u => u.id === id);
  }, [users]);

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUserById,
  };
};
