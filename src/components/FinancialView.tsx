import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  Printer, 
  Filter,
  Check
} from 'lucide-react';
import { FinancialTransaction, MembershipPlan } from '../types/pilates';

interface FinancialViewProps {
  transactions: FinancialTransaction[];
  plans: MembershipPlan[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
  onMarkPaid: (transactionId: string) => void;
}

export const FinancialView: React.FC<FinancialViewProps> = ({
  transactions,
  plans,
  onAddTransaction,
  onMarkPaid,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'pending'>('all');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  // New Transaction Form State
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FinancialTransaction['category']>('mensalidade');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-10');
  const [paymentMethod, setPaymentMethod] = useState<FinancialTransaction['paymentMethod']>('pix');

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'pending')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense' && t.status === 'paid')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'income') return t.type === 'income';
    if (filterType === 'expense') return t.type === 'expense';
    if (filterType === 'pending') return t.status === 'pending';
    return true;
  });

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      description,
      category,
      type,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'paid',
      paymentMethod,
    };

    onAddTransaction(newTx);
    setIsNewTxModalOpen(false);
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      
      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Recebido */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">Recebido no Mês</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-800 tabular-nums">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Entradas de mensalidades e avulsas
          </div>
        </div>

        {/* Pendente / A Receber */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">A Receber (Pendente)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
            R$ {pendingIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Previsão para os próximos 5 dias
          </div>
        </div>

        {/* Despesas */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-medium">Despesas Operacionais</span>
            <ArrowDownLeft className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-800 tabular-nums">
            R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Manutenção de molas, higienização
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="bg-stone-900 text-white p-5 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-300 mb-1">
            <span className="font-medium">Saldo Líquido</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 mt-2">
            Margem operacional positiva
          </div>
        </div>

      </div>

      {/* Plans and Pricing Overview */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Planos & Modalidades do Studio
            </h3>
            <p className="text-xs text-stone-500">
              Precificação por frequência semanal e capacidade por turma
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
              <span className="text-xs font-bold text-stone-900 block mb-1">
                {plan.name}
              </span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="text-xl font-bold font-mono text-stone-900">
                  R$ {plan.monthlyPrice.toFixed(2)}
                </span>
                <span className="text-xs text-stone-500">/mês</span>
              </div>
              <p className="text-[11px] text-stone-600 mb-3 min-h-[32px]">
                {plan.description}
              </p>
              <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
                <span>Alunos matriculados:</span>
                <strong className="text-stone-800 font-mono font-bold tabular-nums">
                  {plan.activeStudentsCount}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Table & Filters */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Lançamentos & Fluxo de Caixa
            </h3>
            <p className="text-xs text-stone-500">
              Histórico de pagamentos recebidos, mensalidades e notas fiscais
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'income' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Receitas
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'expense' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Despesas
              </button>
              <button
                onClick={() => setFilterType('pending')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterType === 'pending' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Pendentes
              </button>
            </div>

            <button
              onClick={() => setIsNewTxModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Lançamento</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="px-4 py-3">Descrição / Aluno</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Forma</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isPaid = tx.status === 'paid';

                return (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-stone-900 block">
                        {tx.description}
                      </span>
                      {tx.studentName && (
                        <span className="text-[11px] text-stone-500">
                          Aluno: {tx.studentName}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className="capitalize text-stone-600">
                        {tx.category.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono text-stone-600 tabular-nums">
                      {tx.dueDate}
                    </td>

                    <td className="px-4 py-3 uppercase text-stone-600 font-mono text-[11px]">
                      {tx.paymentMethod}
                    </td>

                    <td className="px-4 py-3 text-right font-mono font-bold tabular-nums">
                      <span className={isIncome ? 'text-emerald-700' : 'text-rose-700'}>
                        {isIncome ? '+ ' : '- '}
                        R$ {tx.amount.toFixed(2)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isPaid && (
                          <button
                            onClick={() => onMarkPaid(tx.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                          >
                            <Check className="w-3 h-3" />
                            <span>Dar Baixa</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedReceipt(tx)}
                          className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                          title="Visualizar Recibo"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Novo Lançamento Financeiro */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-stone-900 mb-1">
              Novo Lançamento Financeiro
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Registre uma nova receita de mensalidade ou despesa do studio
            </p>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-600 font-medium block mb-1">Tipo de Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 text-center rounded-lg border font-medium ${
                      type === 'income' ? 'border-emerald-700 bg-emerald-50 text-emerald-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 text-center rounded-lg border font-medium ${
                      type === 'expense' ? 'border-rose-700 bg-rose-50 text-rose-900' : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    Despesa (Saída)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mensalidade Novembro - Juliana Lima"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 font-medium block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="390.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>

                <div>
                  <label className="text-stone-600 font-medium block mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-600 font-medium block mb-1">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="mensalidade">Mensalidade</option>
                    <option value="plano_trimestral">Plano Trimestral</option>
                    <option value="aula_avulsa">Aula Avulsa</option>
                    <option value="manutencao_aparelhos">Manutenção Aparelhos</option>
                    <option value="aluguel_despesas">Despesas do Studio</option>
                    <option value="produtos">Venda de Produtos</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-600 font-medium block mb-1">Forma de Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    <option value="pix">PIX</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="cash">Dinheiro</option>
                    <option value="transfer">Transferência Bancária</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-semibold"
                >
                  Registrar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Recibo Simples para Envio */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-sm w-full p-6 text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center pb-4 border-b border-stone-200">
              <h4 className="text-base font-bold text-stone-900">PilatesCore Studio</h4>
              <p className="text-[11px] text-stone-500">Comprovante de Pagamento</p>
            </div>

            <div className="py-4 space-y-2 text-stone-700">
              <div className="flex justify-between">
                <span>Data do Recibo:</span>
                <strong className="font-mono">{selectedReceipt.date}</strong>
              </div>
              <div className="flex justify-between">
                <span>Descrição:</span>
                <strong>{selectedReceipt.description}</strong>
              </div>
              <div className="flex justify-between">
                <span>Forma de Pagamento:</span>
                <span className="uppercase font-mono">{selectedReceipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-stone-900 pt-2 border-t border-stone-100">
                <span>Valor Total:</span>
                <span className="font-mono">R$ {selectedReceipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2 bg-stone-900 text-white font-medium rounded-lg hover:bg-stone-800"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
