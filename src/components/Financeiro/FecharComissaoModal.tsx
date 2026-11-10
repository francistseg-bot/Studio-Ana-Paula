import React, { useState, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  Printer, 
  FileSpreadsheet, 
  Lock, 
  Unlock, 
  Users, 
  Sparkles,
  AlertCircle,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { 
  Instructor, 
  Student, 
  AgendaClassSession, 
  Modality, 
  MonthlyCommissionClosing,
  AttendedStudentCommissionItem 
} from '../../types/studio';

interface FecharComissaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructors: Instructor[];
  students: Student[];
  agendaSessions: AgendaClassSession[];
  modalities: Modality[];
  commissionClosings: MonthlyCommissionClosing[];
  onSaveClosing: (closing: MonthlyCommissionClosing) => void;
  onReopenClosing: (closingId: string) => void;
  preselectedInstructorId?: string;
  initialMonth?: number;
  initialYear?: number;
}

export const FecharComissaoModal: React.FC<FecharComissaoModalProps> = ({
  isOpen,
  onClose,
  instructors,
  students,
  agendaSessions,
  modalities,
  commissionClosings,
  onSaveClosing,
  onReopenClosing,
  preselectedInstructorId,
  initialMonth,
  initialYear,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || currentDate.getFullYear());
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>(
    preselectedInstructorId || instructors[0]?.id || ''
  );
  const [activeView, setActiveView] = useState<'painel' | 'relatorio'>('painel');

  const monthsList = [
    { num: 1, name: 'Janeiro' },
    { num: 2, name: 'Fevereiro' },
    { num: 3, name: 'Março' },
    { num: 4, name: 'Abril' },
    { num: 5, name: 'Maio' },
    { num: 6, name: 'Junho' },
    { num: 7, name: 'Julho' },
    { num: 8, name: 'Agosto' },
    { num: 9, name: 'Setembro' },
    { num: 10, name: 'Outubro' },
    { num: 11, name: 'Novembro' },
    { num: 12, name: 'Dezembro' },
  ];

  const currentInstructor = instructors.find(i => i.id === selectedInstructorId) || instructors[0];

  // Verifica se já existe fechamento gravado para este professor nesta competência
  const existingClosing = useMemo(() => {
    return commissionClosings.find(
      c => c.instructorId === selectedInstructorId && c.month === selectedMonth && c.year === selectedYear
    );
  }, [commissionClosings, selectedInstructorId, selectedMonth, selectedYear]);

  // Se já fechado, usa o snapshot histórico; se aberto, calcula em tempo real
  const calculationData = useMemo(() => {
    if (existingClosing) {
      return {
        isClosed: true,
        closingId: existingClosing.id,
        closedAt: existingClosing.closedAt,
        commissionPercentage: existingClosing.commissionPercentage,
        attendedStudents: existingClosing.attendedStudents,
        totalMonthlyCommission: existingClosing.totalMonthlyCommission,
        totalSingleClassesCommission: existingClosing.totalSingleClassesCommission,
        totalReplacementCommission: existingClosing.totalReplacementCommission,
        totalFinalCommission: existingClosing.totalFinalCommission,
      };
    }

    if (!currentInstructor) {
      return {
        isClosed: false,
        closingId: '',
        closedAt: '',
        commissionPercentage: 40,
        attendedStudents: [],
        totalMonthlyCommission: 0,
        totalSingleClassesCommission: 0,
        totalReplacementCommission: 0,
        totalFinalCommission: 0,
      };
    }

    const commPct = currentInstructor.commissionPercentage || 40;
    const items: AttendedStudentCommissionItem[] = [];

    // 1. Matrículas Ativas Vinculadas a este Professor
    const assignedStudents = students.filter(
      s => s.status === 'ativo' && s.enrollment && s.enrollment.instructorId === currentInstructor.id
    );

    let sumMonthly = 0;
    assignedStudents.forEach(st => {
      const fee = st.enrollment?.monthlyFee || 0;
      // Regra: comissão calculada sobre o valor integral contratual da mensalidade
      const commAmount = (fee * commPct) / 100;
      sumMonthly += commAmount;

      items.push({
        studentId: st.id,
        studentName: st.name,
        type: 'mensalidade',
        modalityName: st.enrollment?.modalityName || 'Pilates Regular',
        commissionAmount: commAmount,
        details: `Comissão Contratual (${commPct}%)`,
      });
    });

    // 2. Aulas de Reposição Atendidas (Alunos vindos de outro professor)
    let sumReplacement = 0;
    const replacementSlots = agendaSessions.flatMap(sess => {
      // Filtrar pelo mês/ano da sessão se compatível
      const sessDate = new Date(sess.date);
      const isSamePeriod = (sessDate.getMonth() + 1 === selectedMonth && sessDate.getFullYear() === selectedYear) || !sess.date;

      if (sess.instructorId === currentInstructor.id && isSamePeriod) {
        return sess.students
          .filter(slot => slot.isReplacement && slot.originalInstructorId && slot.originalInstructorId !== currentInstructor.id)
          .map(slot => ({ slot, date: sess.date, time: sess.time }));
      }
      return [];
    });

    replacementSlots.forEach(({ slot, date, time }) => {
      const repFee = slot.additionalCommissionPaid || 35.00;
      sumReplacement += repFee;

      items.push({
        studentId: slot.studentId,
        studentName: slot.studentName,
        type: 'reposicao',
        modalityName: 'Aula de Reposição',
        commissionAmount: repFee,
        details: `Reposição realizada (Substituto: ${slot.originalInstructorName ? `de ${slot.originalInstructorName}` : 'outro professor'})`,
        date: date ? `${date.split('-').reverse().join('/')} às ${time}` : undefined,
      });
    });

    // 3. Aulas Avulsas / Sessões Avulsas atendidas
    let sumSingle = 0;
    const singleClassSlots = agendaSessions.flatMap(sess => {
      const sessDate = new Date(sess.date);
      const isSamePeriod = (sessDate.getMonth() + 1 === selectedMonth && sessDate.getFullYear() === selectedYear) || !sess.date;

      if (sess.instructorId === currentInstructor.id && isSamePeriod) {
        return sess.students
          .filter(slot => slot.notes?.toLowerCase().includes('avulsa') || slot.notes?.toLowerCase().includes('sessão'))
          .map(slot => ({ slot, date: sess.date, time: sess.time }));
      }
      return [];
    });

    singleClassSlots.forEach(({ slot, date, time }) => {
      // Valor padrão de aula avulsa ou percentual
      const avulsaMod = modalities.find(m => m.billingType === 'aula_avulsa');
      const basePrice = avulsaMod?.price || 130.00;
      const commAmount = (basePrice * commPct) / 100;
      sumSingle += commAmount;

      items.push({
        studentId: slot.studentId,
        studentName: slot.studentName,
        type: 'aula_avulsa',
        modalityName: 'Sessão Avulsa',
        commissionAmount: commAmount,
        details: `Atendimento avulso (${commPct}%)`,
        date: date ? `${date.split('-').reverse().join('/')} às ${time}` : undefined,
      });
    });

    const finalTotal = sumMonthly + sumReplacement + sumSingle;

    return {
      isClosed: false,
      closingId: '',
      closedAt: '',
      commissionPercentage: commPct,
      attendedStudents: items,
      totalMonthlyCommission: sumMonthly,
      totalSingleClassesCommission: sumSingle,
      totalReplacementCommission: sumReplacement,
      totalFinalCommission: finalTotal,
    };
  }, [existingClosing, currentInstructor, students, agendaSessions, modalities, selectedMonth, selectedYear]);

  if (!isOpen || !currentInstructor) return null;

  const handleExecuteClosing = () => {
    if (!currentInstructor) return;

    const newClosing: MonthlyCommissionClosing = {
      id: `comm-${currentInstructor.id}-${selectedMonth}-${selectedYear}-${Date.now()}`,
      instructorId: currentInstructor.id,
      instructorName: currentInstructor.name,
      instructorCouncil: currentInstructor.councilNumber,
      month: selectedMonth,
      year: selectedYear,
      closedAt: new Date().toISOString(),
      status: 'fechado',
      commissionPercentage: calculationData.commissionPercentage,
      totalMonthlyCommission: calculationData.totalMonthlyCommission,
      totalSingleClassesCommission: calculationData.totalSingleClassesCommission,
      totalReplacementCommission: calculationData.totalReplacementCommission,
      totalFinalCommission: calculationData.totalFinalCommission,
      attendedStudents: calculationData.attendedStudents,
      notes: `Fechamento de comissões de ${monthsList.find(m => m.num === selectedMonth)?.name}/${selectedYear}.`,
    };

    onSaveClosing(newClosing);
    setActiveView('relatorio');
  };

  const handleExecuteReopen = () => {
    if (existingClosing) {
      if (confirm(`Deseja realmente reabrir a comissão de ${currentInstructor.name} para a competência ${selectedMonth}/${selectedYear}? Os valores serão recalculados.`)) {
        onReopenClosing(existingClosing.id);
      }
    }
  };

  const handleExportCSV = () => {
    const monthName = monthsList.find(m => m.num === selectedMonth)?.name;
    const rows = [
      ['STUDIO ANA PAULA RODRIGUES - DEMONSTRATIVO DE COMISSÃO DO PROFESSOR'],
      [`Professor(a): ${currentInstructor.name} (${currentInstructor.councilNumber})`],
      [`Competência: ${monthName} / ${selectedYear}`],
      [`Percentual Contratual: ${calculationData.commissionPercentage}%`],
      [`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`],
      ['Status:', calculationData.isClosed ? 'COMISSÃO FECHADA E HOMOLOGADA' : 'PRÉVIA / PENDENTE DE FECHAMENTO'],
      [''],
      ['ALUNO ATENDIDO', 'TIPO DE ATENDIMENTO', 'DETALHES / REGRA', 'VALOR DA COMISSÃO (R$)'],
      ...calculationData.attendedStudents.map(item => [
        item.studentName,
        item.type === 'mensalidade' ? 'Matrícula Regular' : item.type === 'reposicao' ? 'Aula de Reposição' : 'Aula Avulsa',
        item.details + (item.date ? ` (${item.date})` : ''),
        item.commissionAmount.toFixed(2)
      ]),
      [''],
      ['RESUMO FINANCEIRO DA COMISSÃO'],
      ['Total de Comissões de Mensalidades (R$):', calculationData.totalMonthlyCommission.toFixed(2)],
      ['Total de Aulas Avulsas (R$):', calculationData.totalSingleClassesCommission.toFixed(2)],
      ['Total de Adicionais de Reposição (R$):', calculationData.totalReplacementCommission.toFixed(2)],
      ['VALOR TOTAL LÍQUIDO A PAGAR AO PROFESSOR (R$):', calculationData.totalFinalCommission.toFixed(2)],
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.map(item => `"${item}"`).join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Comissao_${currentInstructor.name.replace(/\s+/g, '_')}_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-4xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col">
        
        {/* Header do Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-teal-400 flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                  Fechamento de Comissão Mensal do Professor
                </h3>
                {calculationData.isClosed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Fechada</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    <span>Pendente</span>
                  </span>
                )}
              </div>
              <p className="text-zinc-500 text-xs">
                Apure os alunos atendidos, comissões, reposições e emita o demonstrativo individual do profissional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtro de Competência e Professor */}
        <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 my-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 flex-wrap">
            
            {/* Seleção de Professor */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Professor / Instrutor
              </label>
              <select
                value={selectedInstructorId}
                onChange={(e) => setSelectedInstructorId(e.target.value)}
                className="bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.councilNumber}) - {inst.commissionPercentage}%
                  </option>
                ))}
              </select>
            </div>

            {/* Seleção de Competência (Mês / Ano) */}
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-500 block mb-1">
                Competência (Mês / Ano)
              </label>
              <div className="flex items-center gap-1.5 bg-white border border-zinc-300 rounded-xl px-2 py-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 ml-1" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="bg-transparent font-semibold text-zinc-800 text-xs focus:outline-none"
                >
                  {monthsList.map(m => (
                    <option key={m.num} value={m.num}>{m.name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="bg-transparent font-semibold text-zinc-800 text-xs focus:outline-none border-l border-zinc-200 pl-1.5"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            </div>

          </div>

          {/* Abas: Painel de Apuração vs Relatório Formatado */}
          <div className="flex items-center gap-1.5 bg-zinc-200/70 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveView('painel')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeView === 'painel'
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Painel de Fechamento
            </button>
            <button
              type="button"
              onClick={() => setActiveView('relatorio')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                activeView === 'relatorio'
                  ? 'bg-white text-teal-900 shadow-2xs font-bold'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Relatório Individual</span>
            </button>
          </div>
        </div>

        {/* CONTEÚDO PRINCIPAL (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {activeView === 'painel' ? (
            <>
              {/* Cards de Resumo da Comissão do Mês */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Alunos Atendidos
                  </span>
                  <div className="text-xl font-extrabold text-zinc-900 font-mono mt-0.5">
                    {calculationData.attendedStudents.length}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    Na competência selecionada
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200">
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">
                    Comissão Matrículas ({calculationData.commissionPercentage}%)
                  </span>
                  <div className="text-xl font-extrabold text-teal-950 font-mono mt-0.5">
                    R$ {calculationData.totalMonthlyCommission.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-teal-700">
                    Apurado sobre os contratos ativos
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                  <span className="text-[10px] uppercase font-bold text-purple-800 block">
                    Reposições & Avulsas
                  </span>
                  <div className="text-xl font-extrabold text-purple-950 font-mono mt-0.5">
                    R$ {(calculationData.totalReplacementCommission + calculationData.totalSingleClassesCommission).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-purple-700">
                    +R$ 35/reposição e avulsas
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-zinc-950 text-white border border-zinc-900 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-teal-400 block">
                    Total Líquido a Pagar
                  </span>
                  <div className="text-xl font-extrabold text-teal-400 font-mono mt-0.5">
                    R$ {calculationData.totalFinalCommission.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    {calculationData.isClosed ? 'Fechado para o DRE' : 'Prévia a fechar'}
                  </span>
                </div>
              </div>

              {/* Informação sobre a Regra de Ocultação do Valor Integral */}
              <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-center justify-between text-teal-900">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span className="text-[11px] leading-tight">
                    <strong>Regra de Confidencialidade Ativada:</strong> O demonstrativo do professor apresenta <strong>exclusivamente os valores de comissão devidos</strong>, aulas avulsas e reposições, sem exibir os valores integrais das mensalidades pagas pelos alunos ao Studio.
                  </span>
                </div>
              </div>

              {/* Tabela de Alunos Atendidos com apenas valores de comissão */}
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
                <div className="p-3.5 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between">
                  <span className="font-bold text-zinc-800">
                    Relação de Alunos Atendidos ({calculationData.attendedStudents.length})
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Apenas comissões a repassar ao profissional
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                        <th className="p-3">Aluno</th>
                        <th className="p-3">Modalidade / Tipo</th>
                        <th className="p-3">Detalhamento da Regra</th>
                        <th className="p-3 text-right font-bold text-zinc-900">Comissão Devida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {calculationData.attendedStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-zinc-400 italic">
                            Nenhum atendimento ou aluno vinculado a este professor no período selecionado.
                          </td>
                        </tr>
                      ) : (
                        calculationData.attendedStudents.map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/60">
                            <td className="p-3 font-bold text-zinc-900">
                              {item.studentName}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.type === 'mensalidade'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                                  : item.type === 'reposicao'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200/60'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                              }`}>
                                {item.modalityName}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-600">
                              <span>{item.details}</span>
                              {item.date && (
                                <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">
                                  {item.date}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-zinc-900">
                              R$ {item.commissionAmount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="bg-zinc-50 border-t border-zinc-200 font-bold">
                      <tr>
                        <td colSpan={3} className="p-3 text-right text-zinc-700">
                          Total Geral de Comissão:
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-teal-900 font-extrabold">
                          R$ {calculationData.totalFinalCommission.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* RELATÓRIO INDIVIDUAL DO PROFESSOR (FORMATO IMPRESSÃO / AUDITORIA) */
            <div className="bg-white border border-zinc-300 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm print:border-none print:shadow-none print:p-0">
              
              {/* Header do Relatório com Branding */}
              <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-950 text-teal-400 flex items-center justify-center font-bold text-lg font-mono">
                    AP
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-zinc-950 uppercase tracking-tight">
                      Studio Ana Paula Rodrigues
                    </h2>
                    <p className="text-[11px] text-zinc-600">
                      Pilates & Fisioterapia Integrada · Gestão Financeira Profissional
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono text-[11px] text-zinc-600">
                  <span className="font-bold block text-zinc-900 text-xs uppercase">
                    Demonstrativo de Comissão
                  </span>
                  <span>Competência: {monthsList.find(m => m.num === selectedMonth)?.name} / {selectedYear}</span>
                </div>
              </div>

              {/* Dados do Professor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Profissional</span>
                  <span className="font-bold text-zinc-900 text-sm">{currentInstructor.name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Registro Conselho</span>
                  <span className="font-mono text-zinc-800 font-semibold">{currentInstructor.councilNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Percentual Contratado</span>
                  <span className="font-mono text-teal-800 font-extrabold">{calculationData.commissionPercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 block">Status do Fechamento</span>
                  <span className={`font-bold inline-block px-2 py-0.5 rounded text-[10px] ${
                    calculationData.isClosed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {calculationData.isClosed ? 'Comissão Homologada / Fechada' : 'Prévia / Aberta'}
                  </span>
                </div>
              </div>

              {/* Tabela do Relatório - SEM VALORES INTEGRAIS */}
              <div>
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">
                  Detalhamento de Alunos Atendidos e Valores de Comissão
                </h4>
                
                <table className="w-full text-left text-xs border border-zinc-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-700 font-semibold border-b border-zinc-200">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Nome do Aluno</th>
                      <th className="p-2.5">Tipo de Atendimento</th>
                      <th className="p-2.5">Descrição</th>
                      <th className="p-2.5 text-right font-bold text-zinc-900">Comissão (R$)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {calculationData.attendedStudents.map((st, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="p-2.5 text-zinc-400 font-mono text-[10px]">{i + 1}</td>
                        <td className="p-2.5 font-bold text-zinc-900">{st.studentName}</td>
                        <td className="p-2.5 text-zinc-700">{st.modalityName}</td>
                        <td className="p-2.5 text-zinc-600">
                          {st.details}
                          {st.date && <span className="block text-[10px] text-zinc-400 font-mono">{st.date}</span>}
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold text-zinc-900">
                          R$ {st.commissionAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-100/80 border-t border-zinc-200 font-bold text-zinc-900">
                    <tr>
                      <td colSpan={4} className="p-3 text-right">
                        VALOR LÍQUIDO A RECEBER PELO PROFISSIONAL:
                      </td>
                      <td className="p-3 text-right font-mono text-sm text-teal-900 font-extrabold">
                        R$ {calculationData.totalFinalCommission.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Assinaturas para Formalização */}
              <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs text-zinc-600">
                <div className="border-t border-zinc-300 pt-2">
                  <p className="font-bold text-zinc-900">{currentInstructor.name}</p>
                  <p className="text-[10px] text-zinc-500">Profissional / Fisioterapeuta ({currentInstructor.councilNumber})</p>
                </div>
                <div className="border-t border-zinc-300 pt-2">
                  <p className="font-bold text-zinc-900">Studio Ana Paula Rodrigues</p>
                  <p className="text-[10px] text-zinc-500">Direção Geral / Financeiro</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer com Botões de Ação */}
        <div className="pt-4 border-t border-zinc-100 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              title="Imprimir relatório em folha ou salvar PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Relatório (PDF)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
              title="Exportar planilha Excel (CSV)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {calculationData.isClosed ? (
              <button
                type="button"
                onClick={handleExecuteReopen}
                className="px-3.5 py-2 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl font-semibold flex items-center gap-1.5 transition-colors"
                title="Reabrir a comissão para permitir recálculo"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Reabrir Comissão</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExecuteClosing}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Fechar e homologar a comissão mensal deste professor para compor o DRE"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Fechar Comissão Mensal</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium"
            >
              Concluir / Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
