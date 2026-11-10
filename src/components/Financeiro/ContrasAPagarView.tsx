import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Repeat, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Filter,
  ArrowDownCircle,
  Check
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types/studio';

interface ContasAPagarViewProps {
  expenses: Expense[];
  categories: ExpenseCategory[];
  onAddExpense: (expense: Expense) => void;
  onTogglePaid: (expenseId: string, effectiveDate?: string) => void;
  onDeleteExpense: (expenseId: string) => void;
}

export const ContrasAPagarView: React.FC<ContasAPagarViewProps> = ({
  expenses,
  categories,
  onAddExpense,
  onTogglePaid,
  onDeleteExpense,
}) => {
  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'fixa' | 'eventual'>('fixa');
  const [isRecurring, setIsRecurring] = useState(true);
  const [filterType, setFilterType] = useState<'todos' | 'pagos' | 'pendentes' | 'fixas' | 'eventuais'>('todos');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Modal de Baixa com Data Efetiva
  const [baixaModalExpense, setBaixaModalExpense] = useState<Expense | null>(null);
  const [effectivePaymentDate, setEffectivePaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const cat = categories.find(c => c.id === categoryId);

    onAddExpense({
      id: `exp-${Date.now()}`,
      description: description.trim(),
      amount: parseFloat(amount),
      categoryId,
      categoryName: cat?.name || 'Geral',
      dueDate,
      type,
      isRecurring: type === 'fixa' ? isRecurring : false,
      isPaid: false
    });

    setDescription('');
    setAmount('');
  };

  const handleConfirmBaixa = () => {
    if (baixaModalExpense) {
      onTogglePaid(baixaModalExpense.id, effectivePaymentDate);
      setBaixaModalExpense(null);
    }
  };

  const filteredExpenses = expenses.filter(exp => {
    if (filterType === 'pagos') return exp.isPaid;
    if (filterType === 'pendentes') return !exp.isPaid;
    if (filterType === 'fixas') return exp.type === 'fixa';
    if (filterType === 'eventuais') return exp.type === 'eventual';
    return true;
  });

  const totalPendente = expenses.filter(e => !e.isPaid).reduce((acc, e) => acc + e.amount, 0);
  const totalPago = expenses.filter(e => e.isPaid).reduce((acc, e) => acc + e.amount, 0);
  const totalGeral = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Módulo Financeiro 4.1</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Contas a Pagar do Studio
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Gerenciamento de despesas fixas recorrentes (aluguel, condomínio, internet) e lançamentos eventuais (manutenção, compras pontuais).
          </p>
        </div>

        {/* Resumo Rápido */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-rose-700">A Pagar</span>
            <span className="text-sm font-extrabold font-mono">R$ {totalPendente.toFixed(2)}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-700">Efetivamente Pago</span>
            <span className="text-sm font-extrabold font-mono">R$ {totalPago.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formulário de Novo Lançamento de Despesa */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <h3 className="text-sm font-bold text-zinc-900 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-rose-600" />
          <span>Novo Lançamento de Despesa</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Descrição */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Descrição da Despesa *</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Aluguel sala, Conta de Luz, Manutenção..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

            {/* Valor */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Valor (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono font-medium"
                  required
                />
              </div>
            </div>

            {/* Categoria / Centro de Custo */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Centro de Custo / Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Data de Vencimento */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Data de Vencimento</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>

          </div>

          {/* Tipo e Recorrência */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-100">
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-zinc-700">Tipo de Despesa:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === 'fixa'}
                    onChange={() => {
                      setType('fixa');
                      setIsRecurring(true);
                    }}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Despesa Fixa</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={type === 'eventual'}
                    onChange={() => {
                      setType('eventual');
                      setIsRecurring(false);
                    }}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>Eventual / Pontual</span>
                </label>
              </div>

              {type === 'fixa' && (
                <label className="flex items-center gap-1.5 cursor-pointer bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 text-amber-900 font-medium">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="text-amber-600 focus:ring-amber-500 rounded"
                  />
                  <Repeat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Recorrente automática nos meses seguintes</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors self-end"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Despesa</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Contas a Pagar com Filtros */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        
        {/* Filtros da Barra Superior */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Lançamentos Financeiros de Saídas
            </h3>
            <p className="text-xs text-zinc-500">
              {filteredExpenses.length} lançamentos encontrados
            </p>
          </div>

          {/* Abas de Filtros */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['todos', 'pendentes', 'pagos', 'fixas', 'eventuais'] as const).map((ft) => (
              <button
                key={ft}
                onClick={() => setFilterType(ft)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors capitalize ${
                  filterType === ft
                    ? 'bg-zinc-900 text-white font-semibold'
                    : 'bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200'
                }`}
              >
                {ft === 'todos' && 'Todos'}
                {ft === 'pendentes' && 'Pendentes (A Pagar)'}
                {ft === 'pagos' && 'Pagos'}
                {ft === 'fixas' && 'Despesas Fixas'}
                {ft === 'eventuais' && 'Eventuais'}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-700 font-semibold">
                <th className="p-3.5">Descrição</th>
                <th className="p-3.5">Categoria / Centro de Custo</th>
                <th className="p-3.5">Tipo</th>
                <th className="p-3.5">Vencimento</th>
                <th className="p-3.5">Valor (R$)</th>
                <th className="p-3.5">Status & Data Efetiva</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-400 italic">
                    Nenhuma despesa encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const isOverdue = !exp.isPaid && new Date(exp.dueDate) < new Date();

                  return (
                    <tr key={exp.id} className="hover:bg-zinc-50/70 transition-colors">
                      
                      {/* Descrição */}
                      <td className="p-3.5 font-medium text-zinc-900">
                        <div className="flex items-center gap-2">
                          {exp.isPaid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : isOverdue ? (
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span>{exp.description}</span>
                        </div>
                      </td>

                      {/* Categoria */}
                      <td className="p-3.5 text-zinc-600">
                        <span className="bg-zinc-100 px-2 py-0.5 rounded text-[11px] border border-zinc-200/80">
                          {exp.categoryName || 'Despesa Geral'}
                        </span>
                      </td>

                      {/* Tipo */}
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max ${
                          exp.type === 'fixa'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {exp.type === 'fixa' && <Repeat className="w-3 h-3" />}
                          {exp.type === 'fixa' ? 'Fixa / Recorrente' : 'Eventual'}
                        </span>
                      </td>

                      {/* Vencimento */}
                      <td className="p-3.5 font-mono text-[11px]">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-zinc-700'}>
                          {exp.dueDate.split('-').reverse().join('/')}
                        </span>
                        {isOverdue && (
                          <span className="block text-[10px] text-rose-500 font-sans font-semibold">
                            Em atraso
                          </span>
                        )}
                      </td>

                      {/* Valor */}
                      <td className="p-3.5 font-mono font-bold text-zinc-900 text-sm">
                        R$ {exp.amount.toFixed(2)}
                      </td>

                      {/* Status & Data Efetiva de Pagamento */}
                      <td className="p-3.5">
                        {exp.isPaid ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> Pago
                            </span>
                            {exp.paymentDate && (
                              <span className="block text-[10px] text-zinc-400 font-mono">
                                Efetivado: {exp.paymentDate.split('-').reverse().join('/')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 inline-block">
                            Pendente
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              if (exp.isPaid) {
                                onTogglePaid(exp.id); // Estorna
                              } else {
                                setBaixaModalExpense(exp); // Abre modal para data efetiva
                              }
                            }}
                            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors flex items-center gap-1 ${
                              exp.isPaid
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                            }`}
                          >
                            {exp.isPaid ? 'Desfazer Baixa' : 'Dar Baixa / Pago'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deseja realmente excluir a despesa "${exp.description}"?`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir Despesa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé com Totalizadores */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-3">
          <span>
            Mostrando <strong>{filteredExpenses.length}</strong> de <strong>{expenses.length}</strong> despesas
          </span>
          <div className="flex items-center gap-4">
            <span>Total Filtrado: <strong className="text-zinc-900 font-mono text-sm">R$ {filteredExpenses.reduce((acc, e) => acc + e.amount, 0).toFixed(2)}</strong></span>
          </div>
        </div>

      </div>

      {/* Modal de Confirmação de Baixa com Data Efetiva */}
      {baixaModalExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Confirmar Baixa de Despesa
                </h3>
                <p className="text-xs text-zinc-500">
                  {baixaModalExpense.description}
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs flex justify-between items-center">
                <span className="text-zinc-500">Valor a liquidar:</span>
                <span className="text-base font-extrabold font-mono text-zinc-900">
                  R$ {baixaModalExpense.amount.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-700">
                  Data Efetiva do Pagamento *
                </label>
                <input
                  type="date"
                  value={effectivePaymentDate}
                  onChange={(e) => setEffectivePaymentDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-zinc-400">
                  Essa data constará no fluxo de caixa e relatórios do DRE.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setBaixaModalExpense(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBaixa}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
