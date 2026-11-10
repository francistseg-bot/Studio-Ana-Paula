import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles,
  Phone,
  Search,
  Filter
} from 'lucide-react';
import { Student, Instructor } from '../../types/studio';

interface ContasAReceberViewProps {
  students: Student[];
  instructors: Instructor[];
  onTogglePaid: (studentId: string, paidAmount?: number, paymentDate?: string) => void;
  onUpdateFee?: (studentId: string, newFee: number, dueDay: number) => void;
  onDeleteEnrollment?: (studentId: string) => void;
}

export const ContasAReceberView: React.FC<ContasAReceberViewProps> = ({
  students,
  instructors,
  onTogglePaid,
  onUpdateFee,
  onDeleteEnrollment,
}) => {
  const [filterStatus, setFilterStatus] = useState<'todos' | 'em_dia' | 'atrasado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para Baixa com Desconto e Data Efetiva
  const [baixaModalStudent, setBaixaModalStudent] = useState<Student | null>(null);
  const [effectivePaidAmount, setEffectivePaidAmount] = useState<string>('');
  const [discountAmountInput, setDiscountAmountInput] = useState<string>('0.00');
  const [effectivePaymentDate, setEffectivePaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal para Edição da Mensalidade
  const [editModalStudent, setEditModalStudent] = useState<Student | null>(null);
  const [editFee, setEditFee] = useState<string>('');
  const [editDueDay, setEditDueDay] = useState<number>(5);

  const activeStudentsWithEnrollment = students.filter(
    (s) => s.status === 'ativo' && s.enrollment
  );

  const filteredStudents = activeStudentsWithEnrollment.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm) ||
      (student.enrollment?.modalityName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'em_dia') {
      return student.enrollment?.paymentStatus === 'em_dia';
    }
    if (filterStatus === 'atrasado') {
      return student.enrollment?.paymentStatus === 'atrasado';
    }
    return true;
  });

  // Cálculos Gerais de Recebimento
  // 1. Previsto Total: soma integral das mensalidades contratadas
  const totalPrevisto = activeStudentsWithEnrollment.reduce(
    (acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0
  );

  // 2. Recebido Efetivo: soma do valor efetivamente pago (com eventual desconto deduzido)
  const totalQuitadoEmDia = activeStudentsWithEnrollment
    .filter(s => s.enrollment?.paymentStatus === 'em_dia')
    .reduce((acc, s) => {
      const paid = s.enrollment?.effectivePaidAmount !== undefined 
        ? s.enrollment.effectivePaidAmount 
        : (s.enrollment?.monthlyFee || 0);
      return acc + paid;
    }, 0);

  // 3. Descontos Comerciais Totais Concedidos
  const totalDescontosConcedidos = activeStudentsWithEnrollment
    .filter(s => s.enrollment?.paymentStatus === 'em_dia')
    .reduce((acc, s) => {
      const fee = s.enrollment?.monthlyFee || 0;
      const paid = s.enrollment?.effectivePaidAmount !== undefined 
        ? s.enrollment.effectivePaidAmount 
        : fee;
      return acc + Math.max(0, fee - paid);
    }, 0);

  // 4. Pendente / Em Atraso: soma integral das mensalidades não quitadas
  const totalEmAtraso = activeStudentsWithEnrollment
    .filter(s => s.enrollment?.paymentStatus === 'atrasado')
    .reduce((acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0);

  const handleOpenBaixa = (student: Student) => {
    setBaixaModalStudent(student);
    const fee = student.enrollment?.monthlyFee || 0;
    const currentPaid = student.enrollment?.effectivePaidAmount !== undefined
      ? student.enrollment.effectivePaidAmount
      : fee;
    setEffectivePaidAmount(currentPaid.toFixed(2));
    const currentDiscount = Math.max(0, fee - currentPaid);
    setDiscountAmountInput(currentDiscount > 0 ? currentDiscount.toFixed(2) : '0.00');
    setEffectivePaymentDate(
      student.enrollment?.paymentDate || new Date().toISOString().split('T')[0]
    );
  };

  const handlePaidAmountChange = (val: string) => {
    setEffectivePaidAmount(val);
    if (!baixaModalStudent?.enrollment) return;
    const fee = baixaModalStudent.enrollment.monthlyFee;
    const parsedPaid = parseFloat(val);
    if (!isNaN(parsedPaid)) {
      const diff = Math.max(0, fee - parsedPaid);
      setDiscountAmountInput(diff.toFixed(2));
    }
  };

  const handleDiscountAmountChange = (val: string) => {
    setDiscountAmountInput(val);
    if (!baixaModalStudent?.enrollment) return;
    const fee = baixaModalStudent.enrollment.monthlyFee;
    const parsedDiscount = parseFloat(val);
    if (!isNaN(parsedDiscount)) {
      const newPaid = Math.max(0, fee - parsedDiscount);
      setEffectivePaidAmount(newPaid.toFixed(2));
    }
  };

  const handleApplyQuickDiscount = (discVal: number) => {
    if (!baixaModalStudent?.enrollment) return;
    const fee = baixaModalStudent.enrollment.monthlyFee;
    const newPaid = Math.max(0, fee - discVal);
    setEffectivePaidAmount(newPaid.toFixed(2));
    setDiscountAmountInput(discVal.toFixed(2));
  };

  const handleConfirmBaixa = () => {
    if (baixaModalStudent) {
      const parsed = parseFloat(effectivePaidAmount);
      const fee = baixaModalStudent.enrollment?.monthlyFee || 0;
      const finalPaid = !isNaN(parsed) && parsed >= 0 ? parsed : fee;
      onTogglePaid(baixaModalStudent.id, finalPaid, effectivePaymentDate);
      setBaixaModalStudent(null);
    }
  };

  const handleEstornarBaixa = () => {
    if (baixaModalStudent) {
      if (confirm(`Deseja estornar o pagamento de ${baixaModalStudent.name} e marcar a mensalidade como Em Atraso / Pendente?`)) {
        onTogglePaid(baixaModalStudent.id);
        setBaixaModalStudent(null);
      }
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditModalStudent(student);
    setEditFee((student.enrollment?.monthlyFee || 0).toString());
    setEditDueDay(student.enrollment?.dueDay || 5);
  };

  const handleSaveEdit = () => {
    if (editModalStudent && onUpdateFee) {
      const fee = parseFloat(editFee) || editModalStudent.enrollment?.monthlyFee || 0;
      onUpdateFee(editModalStudent.id, fee, editDueDay);
      setEditModalStudent(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Módulo Financeiro 4.2</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
            Contas a Receber (Mensalidades dos Alunos)
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Relação de todos os alunos com matrícula ativa no Studio, farol de status, vencimentos recorrentes e controle de baixa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-zinc-500">Previsto Integral</span>
            <span className="text-sm font-extrabold font-mono text-zinc-900">R$ {totalPrevisto.toFixed(2)}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-700">Recebido Efetivo (Em Dia)</span>
            <span className="text-sm font-extrabold font-mono text-emerald-800">R$ {totalQuitadoEmDia.toFixed(2)}</span>
          </div>
          {totalDescontosConcedidos > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-amber-700">Descontos Aplicados</span>
              <span className="text-sm font-extrabold font-mono text-amber-800">- R$ {totalDescontosConcedidos.toFixed(2)}</span>
            </div>
          )}
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-rose-700">Pendente / Em Atraso</span>
            <span className="text-sm font-extrabold font-mono text-rose-700">R$ {totalEmAtraso.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        
        {/* Barra de Busca e Filtros de Farol */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por aluno, CPF ou modalidade..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Farol de Status:</span>
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === 'todos'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Todos ({activeStudentsWithEnrollment.length})
            </button>
            <button
              onClick={() => setFilterStatus('em_dia')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                filterStatus === 'em_dia'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Em Dia</span>
            </button>
            <button
              onClick={() => setFilterStatus('atrasado')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                filterStatus === 'atrasado'
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-white border border-rose-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Vencidos / Em Atraso</span>
            </button>
          </div>

        </div>

        {/* Tabela de Mensalidades */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100/70 border-b border-zinc-200 text-zinc-700 font-semibold">
                <th className="p-3.5">Farol</th>
                <th className="p-3.5">Aluno</th>
                <th className="p-3.5">Modalidade & Frequência</th>
                <th className="p-3.5">Professor Responsável</th>
                <th className="p-3.5">Dia Vencimento</th>
                <th className="p-3.5">Valor Mensal</th>
                <th className="p-3.5">Status Atual</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-400 italic">
                    Nenhum aluno localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const enr = student.enrollment!;
                  const isOverdue = enr.paymentStatus === 'atrasado';

                  return (
                    <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                      
                      {/* Farol Visual Solicitado (Verde / Vermelho) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-2 ${
                              isOverdue
                                ? 'bg-rose-500 ring-rose-200 animate-pulse'
                                : 'bg-emerald-500 ring-emerald-200'
                            }`}
                            title={isOverdue ? 'Mensalidade em Atraso (Vermelho)' : 'Mensalidade em Dia (Verde)'}
                          />
                        </div>
                      </td>

                      {/* Aluno */}
                      <td className="p-3.5">
                        <div className="font-bold text-zinc-900 text-sm">
                          {student.name}
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>CPF: {student.cpf}</span>
                          <span>·</span>
                          <span>Tel: {student.phone}</span>
                        </div>
                      </td>

                      {/* Modalidade */}
                      <td className="p-3.5 text-zinc-700">
                        <div className="font-medium">{enr.modalityName}</div>
                        <span className="text-[10px] text-zinc-500">
                          {enr.daysPerWeek}x na semana ({enr.scheduleDays.join(', ')})
                        </span>
                      </td>

                      {/* Professor */}
                      <td className="p-3.5 text-zinc-700 font-medium">
                        {enr.instructorName}
                      </td>

                      {/* Dia do Vencimento */}
                      <td className="p-3.5 font-mono">
                        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-800 font-bold">
                          Todo dia {enr.dueDay}
                        </span>
                        <span className="block text-[10px] text-zinc-400 mt-0.5">
                          Recorrente mensal
                        </span>
                      </td>

                      {/* Valor da Mensalidade (Contratual vs Recebido Efetivo) */}
                      <td className="p-3.5 font-mono">
                        {enr.paymentStatus === 'em_dia' && enr.effectivePaidAmount !== undefined && enr.effectivePaidAmount < enr.monthlyFee ? (
                          <div>
                            <div className="font-extrabold text-sm text-emerald-800 flex items-center gap-1.5">
                              <span>R$ {enr.effectivePaidAmount.toFixed(2)}</span>
                              <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                Pago
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 font-sans">
                              <span className="line-through text-[11px] text-zinc-400 font-mono">
                                R$ {enr.monthlyFee.toFixed(2)}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                                -R$ {(enr.monthlyFee - enr.effectivePaidAmount).toFixed(2)} desc.
                              </span>
                            </div>
                            {enr.paymentDate && (
                              <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                                Baixa: {enr.paymentDate.split('-').reverse().join('/')}
                              </div>
                            )}
                          </div>
                        ) : enr.paymentStatus === 'em_dia' ? (
                          <div>
                            <div className="font-extrabold text-sm text-emerald-900 flex items-center gap-1.5">
                              <span>R$ {(enr.effectivePaidAmount ?? enr.monthlyFee).toFixed(2)}</span>
                              <span className="text-[10px] font-sans font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                                Pago
                              </span>
                            </div>
                            {enr.paymentDate ? (
                              <div className="text-[10px] text-zinc-400 font-sans mt-0.5">
                                Baixa: {enr.paymentDate.split('-').reverse().join('/')}
                              </div>
                            ) : (
                              <span className="text-[10px] text-zinc-400 font-sans">
                                Integral
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-sm text-zinc-900">
                              R$ {enr.monthlyFee.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-rose-600 font-sans">
                              Aguardando baixa
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                          isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOverdue ? (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Em Atraso</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Em Dia / Pago</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Ações: Baixa com Data/Desconto, Editar e Excluir */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenBaixa(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                              isOverdue
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/70'
                            }`}
                            title={isOverdue ? 'Registrar Baixa / Pagamento' : 'Ver / Ajustar Baixa e Desconto'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isOverdue ? 'Dar Baixa' : 'Ajustar Baixa'}</span>
                          </button>

                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                            title="Editar Valores e Vencimento"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {onDeleteEnrollment && (
                            <button
                              onClick={() => {
                                if (confirm(`Deseja cancelar/excluir a matrícula de ${student.name}?`)) {
                                  onDeleteEnrollment(student.id);
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Cancelar Matrícula"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé explicativo da regra de comissão solicitada */}
        <div className="p-4 bg-teal-50/50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-2">
          <p className="text-[11px] text-teal-900 leading-relaxed">
            <strong>Regra de Comissionamento:</strong> Em caso de mensalidade paga com desconto concedido, a comissão do professor é calculada com base no <strong>valor integral</strong> contratado da mensalidade (R$), preservando a remuneração combinada com o profissional.
          </p>
          <span className="font-mono text-zinc-700 shrink-0">
            {filteredStudents.length} mensalidades listadas
          </span>
        </div>

      </div>

      {/* Modal de Baixa com Desconto e Data Efetiva */}
      {baixaModalStudent && (() => {
        const fee = baixaModalStudent.enrollment?.monthlyFee || 0;
        const paidVal = parseFloat(effectivePaidAmount) || 0;
        const discountVal = parseFloat(discountAmountInput) || Math.max(0, fee - paidVal);
        const assignedInst = instructors.find(i => i.id === baixaModalStudent.enrollment?.instructorId);
        const commPct = assignedInst?.commissionPercentage || 30;
        const commVal = (fee * commPct) / 100;
        const isCurrentlyPaid = baixaModalStudent.enrollment?.paymentStatus === 'em_dia';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {isCurrentlyPaid ? 'Ajustar Baixa / Desconto de Mensalidade' : 'Registrar Baixa de Mensalidade'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Aluno: <span className="font-semibold text-zinc-800">{baixaModalStudent.name}</span>
                  </p>
                </div>
              </div>

              <div className="py-4 space-y-4 text-xs">
                
                {/* Resumo Contratual */}
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-1.5">
                  <div className="flex justify-between text-zinc-500">
                    <span>Modalidade:</span>
                    <span className="font-medium text-zinc-800">{baixaModalStudent.enrollment?.modalityName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Professor Responsável:</span>
                    <span className="font-medium text-zinc-800">{baixaModalStudent.enrollment?.instructorName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Valor Integral de Contrato:</span>
                    <span className="font-extrabold text-zinc-900 font-mono text-sm">
                      R$ {fee.toFixed(2)}
                    </span>
                  </div>
                  {isCurrentlyPaid && (
                    <div className="flex justify-between text-zinc-500 pt-1 border-t border-zinc-200/60">
                      <span>Status Atual:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                        Mensalidade Já Quitada (Em Dia)
                      </span>
                    </div>
                  )}
                </div>

                {/* Campos de Valor Recebido e Desconto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 block">
                      Valor Efetivo Recebido (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={effectivePaidAmount}
                      onChange={(e) => handlePaidAmountChange(e.target.value)}
                      className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-zinc-700 block">
                      Desconto Aplicado (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={discountAmountInput}
                      onChange={(e) => handleDiscountAmountChange(e.target.value)}
                      className="w-full bg-amber-50/50 border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-950 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Atalhos Rápidos de Desconto */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-medium block">
                    Atalhos de desconto:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDiscount(0)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                        discountVal === 0
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      Integral (Sem Desconto)
                    </button>
                    {[20, 30, 50].map(disc => (
                      <button
                        key={disc}
                        type="button"
                        onClick={() => handleApplyQuickDiscount(disc)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors ${
                          discountVal === disc
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        -R$ {disc},00
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleApplyQuickDiscount(Math.round(fee * 0.1 * 100) / 100)}
                      className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      -10% (-R$ {(fee * 0.1).toFixed(2)})
                    </button>
                  </div>
                </div>

                {/* Box de Confirmação da Regra de Negócio Solicitada */}
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 space-y-2">
                  <div className="flex justify-between items-center text-teal-950 font-semibold">
                    <span>Total a registrar em Recebidos:</span>
                    <span className="font-extrabold font-mono text-sm text-teal-900">
                      R$ {paidVal.toFixed(2)}
                    </span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-amber-800">
                      <span>Desconto Concedido:</span>
                      <span className="font-mono font-bold">- R$ {discountVal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-teal-200/70 text-[11px] text-teal-900 leading-relaxed">
                    <strong>Regra da Comissão:</strong> A remuneração do professor ({commPct}%) é apurada sobre o <strong>valor integral contratado de R$ {fee.toFixed(2)}</strong> (= <strong>R$ {commVal.toFixed(2)}</strong>), garantindo a integridade dos repasses.
                  </div>
                </div>

                {/* Data Efetiva */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-700 block">
                    Data Efetiva do Recebimento *
                  </label>
                  <input
                    type="date"
                    value={effectivePaymentDate}
                    onChange={(e) => setEffectivePaymentDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                {isCurrentlyPaid ? (
                  <button
                    type="button"
                    onClick={handleEstornarBaixa}
                    className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    title="Estornar baixa e marcar mensalidade como Em Atraso"
                  >
                    Estornar (Voltar para Atrasado)
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBaixaModalStudent(null)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmBaixa}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-xs"
                  >
                    {isCurrentlyPaid ? 'Salvar Alterações' : 'Confirmar Recebimento (Em Dia)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Modal de Edição de Matrícula/Mensalidade */}
      {editModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Editar Mensalidade
                </h3>
                <p className="text-xs text-zinc-500">
                  {editModalStudent.name}
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Novo Valor da Mensalidade (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editFee}
                  onChange={(e) => setEditFee(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-zinc-700">Dia de Vencimento</label>
                <select
                  value={editDueDay}
                  onChange={(e) => setEditDueDay(parseInt(e.target.value))}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs"
                >
                  <option value={5}>Dia 05</option>
                  <option value={10}>Dia 10</option>
                  <option value={15}>Dia 15</option>
                  <option value={20}>Dia 20</option>
                  <option value={25}>Dia 25</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditModalStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
