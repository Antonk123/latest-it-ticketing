import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Check, X, Tag } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('Ange ett kategorinamn');
      return;
    }
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
    toast.success('Kategori tillagd');
  };

  const handleStartEdit = (id: string, label: string) => {
    setEditingId(id);
    setEditingName(label);
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast.error('Kategorinamnet kan inte vara tomt');
      return;
    }
    if (editingId) {
      updateCategory(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
      toast.success('Kategori uppdaterad');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
    toast.success('Kategori borttagen');
  };

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Inställningar</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Kategorier
            </CardTitle>
            <CardDescription>
              Hantera ärendekategorier. Ändringar gäller för nya ärenden.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new category */}
            <div className="flex gap-2">
              <Input
                placeholder="Nytt kategorinamn..."
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <Button onClick={handleAddCategory} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Lägg till
              </Button>
            </div>

            {/* Category list */}
            <div className="border rounded-lg divide-y">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center gap-3 p-3">
                  {editingId === category.id ? (
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" onClick={handleSaveEdit}>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                        <X className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 font-medium">{category.label}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(category.id, category.label)}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <div className="p-4 text-center text-muted-foreground">
                  Inga kategorier ännu. Lägg till en ovan.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
