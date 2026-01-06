import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/ticket';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      setIsLoading(false);
      return;
    }

    const mapped: Category[] = (data || []).map((c) => ({
      id: c.id,
      label: c.label,
    }));

    setCategories(mapped);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = useCallback(async (label: string) => {
    const name = label.toLowerCase().replace(/\s+/g, '-');
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, label })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return null;
    }

    const newCategory: Category = {
      id: data.id,
      label: data.label,
    };

    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  }, []);

  const updateCategory = useCallback(async (id: string, label: string) => {
    const name = label.toLowerCase().replace(/\s+/g, '-');
    
    const { error } = await supabase
      .from('categories')
      .update({ name, label })
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label } : c))
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const getCategoryLabel = useCallback(
    (id: string) => {
      return categories.find((c) => c.id === id)?.label || id;
    },
    [categories]
  );

  return {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryLabel,
    refetch: fetchCategories,
  };
};
