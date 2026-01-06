import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types/ticket';
import { categorySchema, getValidationError } from '@/lib/validations';
import { toast } from 'sonner';

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
      if (import.meta.env.DEV) console.error('Error fetching categories:', error);
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
    // Validate input
    const validation = categorySchema.safeParse({ label });
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid category data');
      return null;
    }

    const validatedLabel = validation.data.label;
    const name = validatedLabel.toLowerCase().replace(/\s+/g, '-');
    
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, label: validatedLabel })
      .select()
      .single();

    if (error) {
      if (import.meta.env.DEV) console.error('Error adding category:', error);
      toast.error('Failed to create category');
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
    // Validate input
    const validation = categorySchema.safeParse({ label });
    if (!validation.success) {
      const errorMsg = getValidationError(validation.error);
      toast.error(errorMsg || 'Invalid category data');
      return;
    }

    const validatedLabel = validation.data.label;
    const name = validatedLabel.toLowerCase().replace(/\s+/g, '-');
    
    const { error } = await supabase
      .from('categories')
      .update({ name, label: validatedLabel })
      .eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error updating category:', error);
      toast.error('Failed to update category');
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, label: validatedLabel } : c))
    );
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);

    if (error) {
      if (import.meta.env.DEV) console.error('Error deleting category:', error);
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
