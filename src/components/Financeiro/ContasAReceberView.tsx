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
  Filter,
  QrCode,
  Banknote,
  CreditCard
} from 'lucide-react';
import { Student, Instructor, PaymentMethod } from '../../types/studio';
import { toLocalIsoDate } from '../../utils/agendaProjection';
import { getEffectiveBillingStatus } from '../../utils/billingStatus';
import {
  formatEnrollmentInstructorsSummary,
  formatEnrollmentScheduleSummary,
  getEnrollmentInstructorShares,
} from '../../utils/enrollmentSchedule';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'Pix', label: 'Pix', icon: <QrCode className="w-3.5 h-3.5" /> },
  { value: 'Dinheiro', label: 'Dinheiro', icon: <Banknote className="w-3.5 h-3.5" /> },
  { value: 'Débito', label: 'Débito', icon: <CreditCard className="w-3.5 h-3.5" /> },
  { value: 'Crédito', label: 'Crédito', icon: <CreditCard className="w-3.5 h-3.5" /> },
];

interface ContasAReceberViewProps {
  students: Student[];
  instructors: Instructor[];
  onTogglePaid: (
    studentId: string,
    paidAmount?: number,
    paymentDate?: string,
    paymentMethod?: PaymentMethod
  ) => void;
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
  const [filterStatus, setFilterStatus] = useState<'todos' | 'em_dia' | 'a_vencer' | 'atrasado'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal para Baixa com Desconto e Data Efetiva
  const [baixaModalStudent, setBaixaModalStudent] = useState<Student | null>(null);
  const [effectivePaidAmount, setEffectivePaidAmount] = useState<string>('');
  const [discountAmountInput, setDiscountAmountInput] = useState<string>('0.00');
  const [effectivePaymentDate, setEffectivePaymentDate] = useState<string>(
    () => toLocalIsoDate(new Date())
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('Pix');

  // Modal para Edição da Mensalidade
  const [editModalStudent, setEditModalStudent] = useState<Student | null>(null);
  const [editFee, setEditFee] = useState<string>('');
  const [editDueDay, setEditDueDay] = useState<string>('10');

  const activeStudentsWithEnrollment = students.filter(
    (s) => s.status === 'ativo' && s.enrollment
  );

  const filteredStudents = activeStudentsWithEnrollment.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm) ||
      (student.enrollment?.modalityName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    const billing = getEffectiveBillingStatus(student.enrollment!, student.createdAt);

    if (filterStatus === 'em_dia') {
      return billing.status === 'pago';
    }
    if (filterStatus === 'a_vencer') {
      return billing.status === 'a_vencer';
    }
    if (filterStatus === 'atrasado') {
      return billing.status === 'vencido';
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
    .filter(s => getEffectiveBillingStatus(s.enrollment!, s.createdAt).status === 'pago')
    .reduce((acc, s) => {
      const paid = s.enrollment?.effectivePaidAmount !== undefined 
        ? s.enrollment.effectivePaidAmount 
        : (s.enrollment?.monthlyFee || 0);
      return acc + paid;
    }, 0);

  // 3. Descontos Comerciais Totais Concedidos
  const totalDescontosConcedidos = activeStudentsWithEnrollment
    .filter(s => getEffectiveBillingStatus(s.enrollment!, s.createdAt).status === 'pago')
    .reduce((acc, s) => {
      const fee = s.enrollment?.monthlyFee || 0;
      const paid = s.enrollment?.effectivePaidAmount !== undefined 
        ? s.enrollment.effectivePaidAmount 
        : fee;
      return acc + Math.max(0, fee - paid);
    }, 0);

  // 4. A Vencer (No Prazo: vencimento >= Hoje e ainda não pago)
  const totalAVencer = activeStudentsWithEnrollment
    .filter(s => getEffectiveBillingStatus(s.enrollment!, s.createdAt).status === 'a_vencer')
    .reduce((acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0);

  // 5. Vencidos / Em Atraso: somente mensalidades não pagas cujo vencimento já passou de Hoje
  const totalEmAtraso = activeStudentsWithEnrollment
    .filter(s => getEffectiveBillingStatus(s.enrollment!, s.createdAt).status === 'vencido')
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
      student.enrollment?.paymentDate || toLocalIsoDate(new Date())
    );
    setSelectedPaymentMethod(student.enrollment?.paymentMethod || 'Pix');
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
      onTogglePaid(baixaModalStudent.id, finalPaid, effectivePaymentDate, selectedPaymentMethod);
      setBaixaModalStudent(null);
    }
  };

  const handleEstornarBaixa = () => {
    if (baixaModalStudent) {
      if (confirm(`Deseja estornar a baixa de ${baixaModalStudent.name}? O status voltará para A Vencer ou Vencido conforme a data de vencimento.`)) {
        onTogglePaid(baixaModalStudent.id);
        setBaixaModalStudent(null);
      }
    }
  };

  const handleOpenEdit = (student: Student) => {
    setEditModalStudent(student);
    setEditFee((student.enrollment?.monthlyFee || 0).toString());
    setEditDueDay((student.enrollment?.dueDay || 10).toString());
  };

  const handleSaveEdit = () => {
    if (editModalStudent && onUpdateFee) {
      const fee = parseFloat(editFee) || editModalStudent.enrollment?.monthlyFee || 0;
      const parsedDay = parseInt(editDueDay, 10);
      const safeDay = !isNaN(parsedDay) ? Math.min(31, Math.max(1, parsedDay)) : (editModalStudent.enrollment?.dueDay || 10);
      onUpdateFee(editModalStudent.id, fee, safeDay);
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
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-emerald-700">Recebido Efetivo (Pagos)</span>
            <span className="text-sm font-extrabold font-mono text-emerald-800">R$ {totalQuitadoEmDia.toFixed(2)}</span>
          </div>
          {totalDescontosConcedidos > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
              <span className="text-[10px] font-semibold uppercase tracking-wider block text-amber-700">Descontos Aplicados</span>
              <span className="text-sm font-extrabold font-mono text-amber-800">- R$ {totalDescontosConcedidos.toFixed(2)}</span>
            </div>
          )}
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-amber-700">A Vencer (No Prazo)</span>
            <span className="text-sm font-extrabold font-mono text-amber-800">R$ {totalAVencer.toFixed(2)}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <span className="text-[10px] font-semibold uppercase tracking-wider block text-rose-700">Vencidos / Em Atraso</span>
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

          <div className="flex flex-wrap items-center gap-2 text-xs">
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
              <span>Pagos (Em Dia)</span>
            </button>
            <button
              onClick={() => setFilterStatus('a_vencer')}
              className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
                filterStatus === 'a_vencer'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'bg-white border border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>A Vencer</span>
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
                  const billing = getEffectiveBillingStatus(enr, student.createdAt);
                  const isPaid = billing.status === 'pago';
                  const isUpcoming = billing.status === 'a_vencer';
                  const isOverdue = billing.status === 'vencido';
                  const formattedDueDate = billing.dueDateIso.split('-').reverse().join('/');

                  return (
                    <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                      
                      {/* Farol Visual Solicitado (Verde = Pago / Âmbar = A Vencer / Vermelho = Vencido) */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-2 ${
                              isOverdue
                                ? 'bg-rose-500 ring-rose-200 animate-pulse'
                                : isUpcoming
                                ? 'bg-amber-400 ring-amber-200'
                                : 'bg-emerald-500 ring-emerald-200'
                            }`}
                            title={
                              isOverdue
                                ? 'Mensalidade Vencida / Em Atraso (Vermelho)'
                                : isUpcoming
                                ? 'Mensalidade A Vencer / No Prazo (Âmbar)'
                                : 'Mensalidade Paga / Em Dia (Verde)'
                            }
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
                        <span className="text-[10px] text-zinc-500 block">
                          {formatEnrollmentScheduleSummary(enr)}
                        </span>
                      </td>

                      {/* Professor */}
                      <td className="p-3.5 text-zinc-700 font-medium">
                        <div>{formatEnrollmentInstructorsSummary(enr)}</div>
                        {getEnrollmentInstructorShares(enr).length > 1 && (
                          <span className="text-[10px] text-teal-700 font-semibold block">
                            Comissão rateada
                          </span>
                        )}
                      </td>

                      {/* Dia do Vencimento */}
                      <td className="p-3.5 font-mono">
                        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-800 font-bold">
                          Todo dia {enr.dueDay}
                        </span>
                        <span className="block text-[10px] text-zinc-500 mt-1">
                          Venc.: {formattedDueDate}
                        </span>
                      </td>

                      {/* Valor da Mensalidade (Contratual vs Recebido Efetivo) */}
                      <td className="p-3.5 font-mono">
                        {isPaid && enr.effectivePaidAmount !== undefined && enr.effectivePaidAmount < enr.monthlyFee ? (
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
                        ) : isPaid ? (
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
                        ) : isUpcoming ? (
                          <div>
                            <div className="font-bold text-sm text-zinc-900">
                              R$ {enr.monthlyFee.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-amber-700 font-sans font-medium">
                              {billing.isDueToday
                                ? 'Vence hoje (no prazo)'
                                : `Vence em ${billing.daysUntilDue} dia(s)`}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-sm text-zinc-900">
                              R$ {enr.monthlyFee.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-rose-600 font-sans font-medium">
                              Vencido há {billing.daysOverdue} dia(s)
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <div className="flex flex-col items-start gap-1">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold inline-flex items-center gap-1 ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : isUpcoming
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOverdue ? (
                              <>
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Vencido / Em Atraso</span>
                              </>
                            ) : isUpcoming ? (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>{billing.isDueToday ? 'Vence Hoje' : 'A Vencer (No Prazo)'}</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Em Dia / Pago</span>
                              </>
                            )}
                          </span>

                          {isPaid && enr.paymentMethod && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
                              {enr.paymentMethod === 'Pix' && <QrCode className="w-3 h-3 text-teal-700" />}
                              {enr.paymentMethod === 'Dinheiro' && <Banknote className="w-3 h-3 text-teal-700" />}
                              {(enr.paymentMethod === 'Débito' || enr.paymentMethod === 'Crédito') && (
                                <CreditCard className="w-3 h-3 text-teal-700" />
                              )}
                              <span>{enr.paymentMethod}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ações: Baixa com Data/Desconto, Editar e Excluir */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenBaixa(student)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                              !isPaid
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xs'
                                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200/70'
                            }`}
                            title={!isPaid ? 'Registrar Baixa / Pagamento' : 'Ver / Ajustar Baixa e Desconto'}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{!isPaid ? 'Dar Baixa' : 'Ajustar Baixa'}</span>
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
        const instructorShares = getEnrollmentInstructorShares(baixaModalStudent.enrollment).map((sh) => {
          const matchedInst = instructors.find(i => i.id === sh.instructorId);
          const pct = matchedInst?.commissionPercentage ?? 30;
          const baseFee = Math.round(fee * sh.share * 100) / 100;
          const amount = Math.round(((baseFee * pct) / 100) * 100) / 100;
          return { ...sh, pct, baseFee, amount };
        });
        const assignedInst = instructors.find(i => i.id === baixaModalStudent.enrollment?.instructorId);
        const commPct = assignedInst?.commissionPercentage || 30;
        const commVal = (fee * commPct) / 100;
        const isCurrentlyPaid = baixaModalStudent.enrollment
          ? getEffectiveBillingStatus(baixaModalStudent.enrollment, baixaModalStudent.createdAt).status === 'pago'
          : false;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
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
                  <div className="flex justify-between text-zinc-500 gap-2">
                    <span>Professor(es):</span>
                    <span className="font-medium text-zinc-800 text-right">
                      {formatEnrollmentInstructorsSummary(baixaModalStudent.enrollment)}
                    </span>
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

                {/* Flag de Forma de Pagamento */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-zinc-700 block">
                    Forma de Pagamento *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Forma de Pagamento">
                    {PAYMENT_METHODS.map((method) => {
                      const isSelected = selectedPaymentMethod === method.value;
                      return (
                        <button
                          key={method.value}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedPaymentMethod(method.value)}
                          className={`min-h-[44px] px-2.5 py-2 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                              : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {method.icon}
                          <span>{method.label}</span>
                        </button>
                      );
                    })}
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
                  <div className="flex justify-between items-center text-[11px] text-teal-900">
                    <span>Forma de Pagamento:</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-white border border-teal-200 text-teal-900">
                      {selectedPaymentMethod}
                    </span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-amber-800">
                      <span>Desconto Concedido:</span>
                      <span className="font-mono font-bold">- R$ {discountVal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-teal-200/70 text-[11px] text-teal-900 leading-relaxed">
                    {instructorShares.length > 1 ? (
                      <div className="space-y-1">
                        <div>
                          <strong>Regra da Comissão (Rateada):</strong> Apurada sobre o <strong>valor integral de R$ {fee.toFixed(2)}</strong> entre os professores vinculados:
                        </div>
                        {instructorShares.map((sh) => (
                          <div key={sh.instructorId || sh.instructorName} className="flex justify-between text-[11px] font-medium">
                            <span>
                              • {sh.instructorName} ({sh.slotCount}/{sh.totalSlots} aulas · {sh.pct}% sobre R$ {sh.baseFee.toFixed(2)})
                            </span>
                            <strong className="font-mono">R$ {sh.amount.toFixed(2)}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <strong>Regra da Comissão:</strong> A remuneração do professor ({commPct}%) é apurada sobre o <strong>valor integral contratado de R$ {fee.toFixed(2)}</strong> (= <strong>R$ {commVal.toFixed(2)}</strong>), garantindo a integridade dos repasses.
                      </>
                    )}
                  </div>
                </div>

              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                {isCurrentlyPaid ? (
                  <button
                    type="button"
                    onClick={handleEstornarBaixa}
                    className="px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors"
                    title="Estornar baixa e retornar para A Vencer ou Vencido conforme data de vencimento"
                  >
                    Estornar Baixa
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
                <label className="font-semibold text-zinc-700">Dia de Vencimento (1 a 31)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={editDueDay}
                    onChange={(e) => setEditDueDay(e.target.value)}
                    onBlur={() => {
                      const parsed = parseInt(editDueDay, 10);
                      if (isNaN(parsed) || parsed < 1) setEditDueDay('1');
                      else if (parsed > 31) setEditDueDay('31');
                    }}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Ex: 10"
                  />
                </div>
                <p className="text-[10px] text-zinc-400">
                  Informe manualmente qualquer dia do mês (1 a 31).
                </p>
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
