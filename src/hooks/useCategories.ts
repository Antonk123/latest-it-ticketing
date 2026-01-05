import { useState, useEffect, useCallback } from 'react';
import { Category, DEFAULT_CATEGORIES } from '@/types/ticket';
import { generateId } from '@/lib/storage';

const CATEGORIES_KEY = 'it_categories';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) {
      setCategories(JSON.parse(data));
    } else {
      // Initialize with defaults
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      setCategories(DEFAULT_CATEGORIES);
    }
  }, []);

  const saveCategories = (updated: Category[]) => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updated));
    setCategories(updated);
  };

  const addCategory = useCallback((label: string) => {
    const id = generateId();
    const newCategory: Category = { id, label, icon: 'tag' };
    const updated = [...categories, newCategory];
    saveCategories(updated);
    return newCategory;
  }, [categories]);

  const updateCategory = useCallback((id: string, label: string) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, label } : c
    );
    saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback((id: string) => {
    const updated = categories.filter(c => c.id !== id);
    saveCategories(updated);
  }, [categories]);

  const getCategoryLabel = useCallback((id: string) => {
    return categories.find(c => c.id === id)?.label || id;
  }, [categories]);

  return {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryLabel,
  };
};
