import React, { useState } from 'react';
import { Plus, Trash2, Tag, DollarSign } from 'lucide-react';
import { ExpenseCategory } from '../../types/studio';

interface DespesasViewProps {
  categories: ExpenseCategory[];
  onAddCategory: (category: ExpenseCategory) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const DespesasView: React.FC<DespesasViewProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory({ id: `cat-${Date.now()}`, name: newCategoryName });
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
        <h2 className="text-xl font-bold text-zinc-900">2.6 Categorias de Despesas (Centros de Custo)</h2>
        <p className="text-xs text-zinc-500">Gerencie as categorias para organizar seu fluxo de contas a pagar.</p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs">
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nome da nova categoria (ex: Aluguel, Prolabore)..."
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
          <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </form>

        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-100">
              <span className="text-xs font-medium text-zinc-800 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-teal-600" /> {cat.name}
              </span>
              <button onClick={() => onDeleteCategory(cat.id)} className="text-rose-500 hover:text-rose-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
