import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  GraduationCap, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileText,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  Student, 
  Expense, 
  Instructor, 
  MainNavigation, 
  AgendaClassSession, 
  Modality, 
  MonthlyCommissionClosing 
} from '../../types/studio';
import { FecharComissaoModal } from './FecharComissaoModal';

interface DREViewProps {
  students: Student[];
  expenses: Expense[];
  instructors: Instructor[];
  agendaSessions?: AgendaClassSession[];
  modalities?: Modality[];
  commissionClosings?: MonthlyCommissionClosing[];
  onSaveCommissionClosing?: (closing: MonthlyCommissionClosing) => void;
  onReopenCommissionClosing?: (closingId: string) => void;
  onNavigateTab?: (tab: MainNavigation) => void;
}

export const DREView: React.FC<DREViewProps> = ({ 
  students, 
  expenses, 
  instructors,
  agendaSessions = [],
  modalities = [],
  commissionClosings = [],
  onSaveCommissionClosing,
  onReopenCommissionClosing,
  onNavigateTab
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [activeDrillDown, setActiveDrillDown] = useState<
    'faturamento' | 'recebidos' | 'pendentes' | 'comissoes' | 'despesas' | null
  >(null);

  // Modal para fechar comissão e emitir relatório
  const [isFecharComissaoOpen, setIsFecharComissaoOpen] = useState(false);
  const [selectedInstructorForClosing, setSelectedInstructorForClosing] = useState<string>('');

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

  // Filtro de alunos ativos com matrícula no período
  const activeStudents = students.filter(s => s.status === 'ativo' && s.enrollment);

  // 1. Faturamento Total Previsto
  const totalFaturamentoPrevisto = activeStudents.reduce(
    (acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0
  );

  // 2. Faturamento Recebido (Em Dia / Pago) - CONSIDERANDO DESCONTOS EFETIVOS
  const alunosRecebidos = activeStudents.filter(s => s.enrollment?.paymentStatus === 'em_dia');
  const totalRecebidos = alunosRecebidos.reduce((acc, s) => {
    const paid = s.enrollment?.effectivePaidAmount !== undefined
      ? s.enrollment.effectivePaidAmount
      : (s.enrollment?.monthlyFee || 0);
    return acc + paid;
  }, 0);

  // Total de Descontos Comerciais Concedidos no Período
  const totalDescontosConcedidos = alunosRecebidos.reduce((acc, s) => {
    const fee = s.enrollment?.monthlyFee || 0;
    const paid = s.enrollment?.effectivePaidAmount !== undefined ? s.enrollment.effectivePaidAmount : fee;
    return acc + Math.max(0, fee - paid);
  }, 0);

  // 3. Ainda Pendentes (Em atraso)
  const alunosPendentes = activeStudents.filter(s => s.enrollment?.paymentStatus === 'atrasado');
  const totalPendentes = alunosPendentes.reduce(
    (acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0
  );

  // 4. Comissões dos Professores (Calculada sobre valor integral das mensalidades + fechamentos homologados)
  const instructorCommissions = instructors.map(inst => {
    // Verifica se a comissão mensal foi homologada/fechada para este mês
    const closed = commissionClosings?.find(
      c => c.instructorId === inst.id && c.month === selectedMonth && c.year === selectedYear
    );

    const assignedStudents = activeStudents.filter(s => s.enrollment?.instructorId === inst.id);
    const revenueGenerated = assignedStudents.reduce((acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0);
    const estimatedCommission = (revenueGenerated * inst.commissionPercentage) / 100;

    // Reposições atendidas no mês
    const replacementSlots = (agendaSessions || []).flatMap(sess => {
      const sessDate = new Date(sess.date);
      const isSamePeriod = (sessDate.getMonth() + 1 === selectedMonth && sessDate.getFullYear() === selectedYear) || !sess.date;
      if (sess.instructorId === inst.id && isSamePeriod) {
        return sess.students.filter(slot => slot.isReplacement && slot.originalInstructorId && slot.originalInstructorId !== inst.id);
      }
      return [];
    });
    const replacementTotal = replacementSlots.reduce((acc, slot) => acc + (slot.additionalCommissionPaid || 35.00), 0);

    // Se estiver fechada/homologada, utiliza o valor exato fechado que compõe o DRE!
    const finalCommissionValue = closed 
      ? closed.totalFinalCommission 
      : (estimatedCommission + replacementTotal);

    return {
      instructor: inst,
      studentCount: closed ? closed.attendedStudents.length : assignedStudents.length,
      revenueGenerated,
      commissionPercentage: inst.commissionPercentage,
      commissionValue: finalCommissionValue,
      isClosed: !!closed,
      closedAt: closed?.closedAt,
      closedRecord: closed,
    };
  });

  const totalComissoes = instructorCommissions.reduce((acc, item) => acc + item.commissionValue, 0);
  const totalComissoesFechadas = instructorCommissions.filter(c => c.isClosed).length;

  // 5. Despesas do Mês Selecionado (ou Recorrentes Fixas)
  const monthExpenses = expenses.filter(exp => {
    if (exp.isRecurring && exp.type === 'fixa') return true;
    const parts = exp.dueDate.split('-');
    if (parts.length >= 2) {
      return parseInt(parts[1]) === selectedMonth && parseInt(parts[0]) === selectedYear;
    }
    return false;
  });

  const totalDespesasPagas = monthExpenses
    .filter(e => e.isPaid)
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDespesasPendentes = monthExpenses
    .filter(e => !e.isPaid)
    .reduce((acc, e) => acc + e.amount, 0);

  const totalDespesasGeral = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  // 6. Saldo Geral do Período
  // Saldo Previsto = Faturamento Previsto - (Total Despesas Geral + Total Comissões)
  const saldoGeralPrevisto = totalFaturamentoPrevisto - (totalDespesasGeral + totalComissoes);
  // Saldo Realizado = Recebidos - (Total Despesas Pagas + Total Comissões)
  const saldoGeralRealizado = totalRecebidos - (totalDespesasPagas + totalComissoes);

  // Margem Operacional Líquida
  const margemOperacional = totalFaturamentoPrevisto > 0 
    ? ((saldoGeralPrevisto / totalFaturamentoPrevisto) * 100).toFixed(1)
    : '0';

  // Exportação Excel (CSV Formatado)
  const handleExportCSV = (tipo: string) => {
    let rows: string[][] = [];

    if (tipo === 'completo') {
      rows = [
        ['STUDIO ANA PAULA RODRIGUES - DEMONSTRAÇÃO DO RESULTADO (DRE)'],
        [`Competência: ${monthsList.find(m => m.num === selectedMonth)?.name} / ${selectedYear}`],
        ['Data de Emissão:', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['RUBRICA FINANCEIRA', 'VALOR (R$)', 'PERCENTUAL (%)'],
        ['(+) Faturamento Total Previsto (Contratos Integrais)', totalFaturamentoPrevisto.toFixed(2), '100%'],
        ['   - Recebidos Efetivos no Caixa (Em Dia)', totalRecebidos.toFixed(2), `${((totalRecebidos/totalFaturamentoPrevisto)*100 || 0).toFixed(1)}%`],
        ...(totalDescontosConcedidos > 0 ? [
          ['   - Descontos Comerciais Concedidos', `-${totalDescontosConcedidos.toFixed(2)}`, '']
        ] : []),
        ['   - Pendentes / Em Atraso', totalPendentes.toFixed(2), `${((totalPendentes/totalFaturamentoPrevisto)*100 || 0).toFixed(1)}%`],
        ['(-) Despesas Operacionais Totais', totalDespesasGeral.toFixed(2), `${((totalDespesasGeral/totalFaturamentoPrevisto)*100 || 0).toFixed(1)}%`],
        ['   - Despesas Efetivamente Pagas', totalDespesasPagas.toFixed(2), ''],
        ['   - Despesas a Liquidar', totalDespesasPendentes.toFixed(2), ''],
        ['(-) Comissões Totais dos Professores (Calculadas sobre Valor Integral)', totalComissoes.toFixed(2), `${((totalComissoes/totalFaturamentoPrevisto)*100 || 0).toFixed(1)}%`],
        ['(=) SALDO LÍQUIDO OPERACIONAL', saldoGeralPrevisto.toFixed(2), `${margemOperacional}%`],
        [''],
        ['DETALHAMENTO DE COMISSÕES POR PROFISSIONAL'],
        ['Professor', 'Nº Alunos', 'Base de Faturamento (R$)', 'Comissão (%)', 'Valor a Pagar (R$)'],
        ...instructorCommissions.map(c => [
          c.instructor.name,
          c.studentCount.toString(),
          c.revenueGenerated.toFixed(2),
          `${c.commissionPercentage}%`,
          c.commissionValue.toFixed(2)
        ]),
        [''],
        ['DETALHAMENTO DE DESPESAS DO PERÍODO'],
        ['Descrição', 'Categoria', 'Tipo', 'Vencimento', 'Status', 'Valor (R$)'],
        ...monthExpenses.map(e => [
          e.description,
          e.categoryName || 'Geral',
          e.type,
          e.dueDate,
          e.isPaid ? 'Pago' : 'Pendente',
          e.amount.toFixed(2)
        ])
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + rows.map(e => e.map(item => `"${item}"`).join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DRE_Studio_AnaPaula_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Período Filter */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Módulo Financeiro 4.3</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900">
            DRE - Demonstração do Resultado do Exercício
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Relatório gerencial de receitas, despesas, comissões médicas e margem operacional do Studio.
          </p>
        </div>

        {/* Filtro por Período & Botões de Exportar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-500 ml-2" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-transparent font-semibold text-zinc-800 p-1.5 focus:outline-none"
            >
              {monthsList.map(m => (
                <option key={m.num} value={m.num}>{m.name}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent font-semibold text-zinc-800 p-1.5 focus:outline-none border-l border-zinc-200"
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSelectedInstructorForClosing(instructors[0]?.id || '');
              setIsFecharComissaoOpen(true);
            }}
            className="px-3.5 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Fechar comissões de professores para este mês e emitir relatório de alunos atendidos"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Fechar Comissões ({totalComissoesFechadas}/{instructors.length})</span>
          </button>

          <button
            onClick={() => handleExportCSV('completo')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Exportar para Excel / Planilha CSV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Imprimir / Salvar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>PDF / Imprimir</span>
          </button>
        </div>
      </div>

      {/* 6 BALÕES DETALHADOS COM LINK DIRETO PARA A RELAÇÃO DOS DADOS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Resumo dos Indicadores Financeiros (Clique nos balões para abrir a relação detalhada)
          </h3>
          <span className="text-xs text-teal-700 font-semibold">
            Competência: {monthsList.find(m => m.num === selectedMonth)?.name} / {selectedYear}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          
          {/* Balão 1: Faturamento Total Previsto */}
          <button
            onClick={() => setActiveDrillDown(activeDrillDown === 'faturamento' ? null : 'faturamento')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-2xs flex flex-col justify-between ${
              activeDrillDown === 'faturamento'
                ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20'
                : 'bg-white border-zinc-200 hover:border-teal-400 hover:bg-teal-50/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-semibold text-zinc-700">Faturamento Previsto</span>
                <span className="p-1 rounded-md bg-teal-100 text-teal-800">
                  <DollarSign className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-zinc-900">
                R$ {totalFaturamentoPrevisto.toFixed(2)}
              </div>
              <p className="text-[10px] text-teal-700 font-medium mt-1">
                {activeStudents.length} mensalidades
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
              <span>Ver relação</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Balão 2: Recebidos (Em Dia) */}
          <button
            onClick={() => setActiveDrillDown(activeDrillDown === 'recebidos' ? null : 'recebidos')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-2xs flex flex-col justify-between ${
              activeDrillDown === 'recebidos'
                ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-white border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-semibold text-emerald-800">Recebidos</span>
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-800">
                R$ {totalRecebidos.toFixed(2)}
              </div>
              <p className="text-[10px] text-emerald-700 font-medium mt-1">
                {alunosRecebidos.length} quitados {totalDescontosConcedidos > 0 ? `· Desc: -R$ ${totalDescontosConcedidos.toFixed(2)}` : ''}
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
              <span>Ver quitados</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Balão 3: Ainda Pendentes */}
          <button
            onClick={() => setActiveDrillDown(activeDrillDown === 'pendentes' ? null : 'pendentes')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-2xs flex flex-col justify-between ${
              activeDrillDown === 'pendentes'
                ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                : 'bg-white border-zinc-200 hover:border-rose-400 hover:bg-rose-50/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-semibold text-rose-800">Ainda Pendentes</span>
                <span className="p-1 rounded-md bg-rose-100 text-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-rose-700">
                R$ {totalPendentes.toFixed(2)}
              </div>
              <p className="text-[10px] text-rose-600 font-medium mt-1">
                {alunosPendentes.length} em atraso
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-rose-700 font-semibold">
              <span>Ver devedores</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Balão 4: Comissões dos Professores */}
          <button
            onClick={() => setActiveDrillDown(activeDrillDown === 'comissoes' ? null : 'comissoes')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-2xs flex flex-col justify-between ${
              activeDrillDown === 'comissoes'
                ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20'
                : 'bg-white border-zinc-200 hover:border-purple-400 hover:bg-purple-50/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-semibold text-purple-800">Comissões Total</span>
                <span className="p-1 rounded-md bg-purple-100 text-purple-800">
                  <GraduationCap className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-purple-900">
                R$ {totalComissoes.toFixed(2)}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                  totalComissoesFechadas === instructors.length && instructors.length > 0
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-zinc-100 text-zinc-600'
                }`}>
                  {totalComissoesFechadas}/{instructors.length} Fechadas
                </span>
                <span className="text-[10px] text-purple-700 font-medium">
                  {instructors.length} profs
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-purple-700 font-semibold">
              <span>Gerenciar / Fechar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Balão 5: Contas a Pagar (Despesas) */}
          <button
            onClick={() => setActiveDrillDown(activeDrillDown === 'despesas' ? null : 'despesas')}
            className={`p-4 rounded-2xl border text-left transition-all shadow-2xs flex flex-col justify-between ${
              activeDrillDown === 'despesas'
                ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20'
                : 'bg-white border-zinc-200 hover:border-amber-400 hover:bg-amber-50/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                <span className="font-semibold text-amber-900">Contas a Pagar</span>
                <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-amber-950">
                R$ {totalDespesasGeral.toFixed(2)}
              </div>
              <p className="text-[10px] text-amber-800 font-medium mt-1">
                R$ {totalDespesasPagas.toFixed(2)} pagas
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-amber-800 font-semibold">
              <span>Ver despesas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Balão 6: Saldo Geral Líquido */}
          <div className="p-4 rounded-2xl border border-zinc-900 bg-zinc-950 text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span className="font-semibold text-teal-300">Saldo Geral</span>
                <span className="p-1 rounded-md bg-zinc-800 text-teal-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-teal-400">
                R$ {saldoGeralPrevisto.toFixed(2)}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">
                Margem: <span className="text-teal-300 font-bold">{margemOperacional}%</span>
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
              <span>Entradas - Saídas</span>
              <span className="text-emerald-400 font-bold">Positivo</span>
            </div>
          </div>

        </div>
      </div>

      {/* PAINEL DE RELAÇÃO DETALHADA DOS DADOS (AO CLICAR NOS BALÕES) */}
      {activeDrillDown && (
        <div className="bg-white rounded-2xl border border-teal-500/50 shadow-md p-5 animate-in fade-in duration-200">
          
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
            <div>
              <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-700" />
                <span>
                  {activeDrillDown === 'faturamento' && 'Relação Detalhada: Faturamento Total Previsto'}
                  {activeDrillDown === 'recebidos' && 'Relação Detalhada: Mensalidades Efetivamente Recebidas'}
                  {activeDrillDown === 'pendentes' && 'Relação Detalhada: Mensalidades Ainda Pendentes (Cobrança)'}
                  {activeDrillDown === 'comissoes' && 'Relação Detalhada: Comissões Devidas aos Professores'}
                  {activeDrillDown === 'despesas' && 'Relação Detalhada: Contas a Pagar do Mês'}
                </span>
              </h4>
              <p className="text-xs text-zinc-500">
                Dados consolidados para auditoria financeira imediata
              </p>
            </div>

            <div className="flex items-center gap-2">
              {onNavigateTab && (
                <button
                  onClick={() => {
                    if (activeDrillDown === 'despesas') onNavigateTab('financeiro-pagar');
                    else if (activeDrillDown === 'comissoes') onNavigateTab('cadastros-professores');
                    else onNavigateTab('financeiro-receber');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-lg border border-teal-200"
                >
                  Abrir Tela Completa do Menu
                </button>
              )}
              <button
                onClick={() => setActiveDrillDown(null)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 rounded-lg"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>

          {/* Drill-down: Comissões */}
          {activeDrillDown === 'comissoes' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="p-2.5">Professor / Fisioterapeuta</th>
                    <th className="p-2.5">Alunos Atendidos</th>
                    <th className="p-2.5">% Comissão</th>
                    <th className="p-2.5">Status do Mês</th>
                    <th className="p-2.5 font-bold text-zinc-900">Valor no DRE</th>
                    <th className="p-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {instructorCommissions.map(item => (
                    <tr key={item.instructor.id} className="hover:bg-zinc-50/50">
                      <td className="p-2.5">
                        <div className="font-bold text-zinc-900">{item.instructor.name}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {item.instructor.councilNumber}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <span className="font-medium text-zinc-800">{item.studentCount} alunos</span>
                      </td>
                      <td className="p-2.5 font-semibold text-purple-700">{item.commissionPercentage}%</td>
                      <td className="p-2.5">
                        {item.isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>Fechada {item.closedAt ? `(${new Date(item.closedAt).toLocaleDateString('pt-BR')})` : ''}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Unlock className="w-3 h-3 text-amber-600" />
                            <span>Em Aberto</span>
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-sm text-purple-900">
                        R$ {item.commissionValue.toFixed(2)}
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedInstructorForClosing(item.instructor.id);
                            setIsFecharComissaoOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-colors ${
                            item.isClosed
                              ? 'bg-zinc-900 hover:bg-zinc-800 text-white'
                              : 'bg-purple-700 hover:bg-purple-600 text-white'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{item.isClosed ? 'Ver Relatório' : 'Fechar Comissão'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Drill-down: Recebidos (com auditoria de desconto concedido e valor efetivo de entrada) */}
          {activeDrillDown === 'recebidos' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="p-2.5">Aluno</th>
                    <th className="p-2.5">Modalidade</th>
                    <th className="p-2.5">Professor</th>
                    <th className="p-2.5">Valor Contrato (Integral)</th>
                    <th className="p-2.5">Desconto Comercial</th>
                    <th className="p-2.5 font-bold text-emerald-900">Valor Efetivo Recebido</th>
                    <th className="p-2.5">Data da Baixa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {alunosRecebidos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-zinc-400 italic">
                        Nenhuma mensalidade quitada no período.
                      </td>
                    </tr>
                  ) : (
                    alunosRecebidos.map(st => {
                      const fee = st.enrollment?.monthlyFee || 0;
                      const paid = st.enrollment?.effectivePaidAmount !== undefined 
                        ? st.enrollment.effectivePaidAmount 
                        : fee;
                      const discount = Math.max(0, fee - paid);

                      return (
                        <tr key={st.id} className="hover:bg-zinc-50/50">
                          <td className="p-2.5 font-bold text-zinc-900">{st.name}</td>
                          <td className="p-2.5 text-zinc-600">{st.enrollment?.modalityName}</td>
                          <td className="p-2.5 font-medium">{st.enrollment?.instructorName}</td>
                          <td className="p-2.5 font-mono text-zinc-700">R$ {fee.toFixed(2)}</td>
                          <td className="p-2.5 font-mono">
                            {discount > 0 ? (
                              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                - R$ {discount.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-zinc-400">Sem desconto</span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono font-extrabold text-sm text-emerald-800">
                            R$ {paid.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-zinc-500 font-mono">
                            {st.enrollment?.paymentDate ? st.enrollment.paymentDate.split('-').reverse().join('/') : 'Em dia'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Drill-down: Faturamento Total ou Pendentes */}
          {(activeDrillDown === 'faturamento' || activeDrillDown === 'pendentes') && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="p-2.5">Aluno</th>
                    <th className="p-2.5">Modalidade</th>
                    <th className="p-2.5">Professor</th>
                    <th className="p-2.5">Dia Venc.</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 font-bold text-zinc-900">Valor Mensal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {(activeDrillDown === 'pendentes' ? alunosPendentes : activeStudents).map(st => (
                    <tr key={st.id} className="hover:bg-zinc-50/50">
                      <td className="p-2.5 font-bold text-zinc-900">{st.name}</td>
                      <td className="p-2.5 text-zinc-600">{st.enrollment?.modalityName}</td>
                      <td className="p-2.5">{st.enrollment?.instructorName}</td>
                      <td className="p-2.5 font-mono">Dia {st.enrollment?.dueDay}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          st.enrollment?.paymentStatus === 'atrasado'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {st.enrollment?.paymentStatus === 'atrasado' ? 'Pendente' : 'Recebido'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-zinc-900">
                        R$ {st.enrollment?.monthlyFee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Drill-down: Despesas */}
          {activeDrillDown === 'despesas' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold">
                    <th className="p-2.5">Descrição</th>
                    <th className="p-2.5">Categoria / Centro de Custo</th>
                    <th className="p-2.5">Tipo</th>
                    <th className="p-2.5">Vencimento</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 font-bold text-zinc-900">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {monthExpenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-zinc-50/50">
                      <td className="p-2.5 font-bold text-zinc-900">{exp.description}</td>
                      <td className="p-2.5">{exp.categoryName || 'Geral'}</td>
                      <td className="p-2.5 capitalize">{exp.type}</td>
                      <td className="p-2.5 font-mono">{exp.dueDate}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          exp.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exp.isPaid ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono font-bold text-zinc-900">
                        R$ {exp.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ESTRUTURA FORMAL DE DEMONSTRAÇÃO DO RESULTADO (RELATÓRIO DRE) */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">
              Demonstrativo de Resultado do Exercício (Visão Contábil / Gerencial)
            </h3>
            <p className="text-xs text-zinc-500">
              Competência apurada com base nas receitas contratuais e custos operacionais
            </p>
          </div>
          <span className="text-xs font-mono bg-zinc-200/80 px-2.5 py-1 rounded-lg text-zinc-700">
            {monthsList.find(m => m.num === selectedMonth)?.name} de {selectedYear}
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs font-mono">
          
          {/* 1. Receita Operacional Bruta */}
          <div className="space-y-1.5 pb-3 border-b border-zinc-100">
            <div className="flex justify-between items-center text-sm font-bold text-zinc-900 font-sans">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>1. RECEITA OPERACIONAL BRUTA (FATURAMENTO PREVISTO)</span>
              </span>
              <span>R$ {totalFaturamentoPrevisto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500 pl-4 text-xs">
              <span>(+) Mensalidades em Dia / Efetivamente Recebidas (Caixa)</span>
              <span className="text-emerald-700 font-bold">R$ {totalRecebidos.toFixed(2)}</span>
            </div>
            {totalDescontosConcedidos > 0 && (
              <div className="flex justify-between items-center text-zinc-400 pl-4 text-[11px]">
                <span>(-) Descontos Comerciais Aplicados em Mensalidades</span>
                <span className="text-amber-700 font-medium">(-) R$ {totalDescontosConcedidos.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-zinc-500 pl-4 text-xs">
              <span>(+) Mensalidades a Receber / Pendentes</span>
              <span className="text-rose-700">R$ {totalPendentes.toFixed(2)}</span>
            </div>
          </div>

          {/* 2. Custos com Profissionais (Comissões) */}
          <div className="space-y-1.5 pb-3 border-b border-zinc-100">
            <div className="flex justify-between items-center text-sm font-bold text-purple-900 font-sans">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-600" />
                <span>2. DEDUÇÕES / COMISSÕES DOS PROFESSORES</span>
              </span>
              <span className="text-purple-900">(-) R$ {totalComissoes.toFixed(2)}</span>
            </div>
            {instructorCommissions.map(c => (
              <div key={c.instructor.id} className="flex justify-between items-center text-zinc-500 pl-4 text-xs">
                <span>(-) {c.instructor.name} ({c.commissionPercentage}% sobre R$ {c.revenueGenerated.toFixed(2)})</span>
                <span>R$ {c.commissionValue.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* 3. Despesas Operacionais (Contas a Pagar) */}
          <div className="space-y-1.5 pb-3 border-b border-zinc-100">
            <div className="flex justify-between items-center text-sm font-bold text-amber-950 font-sans">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                <span>3. DESPESAS OPERACIONAIS E ADMINISTRATIVAS</span>
              </span>
              <span className="text-amber-900">(-) R$ {totalDespesasGeral.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500 pl-4 text-xs">
              <span>(-) Despesas Efetivamente Liquidadas / Pagas</span>
              <span>R$ {totalDespesasPagas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500 pl-4 text-xs">
              <span>(-) Despesas Provisionadas a Pagar</span>
              <span>R$ {totalDespesasPendentes.toFixed(2)}</span>
            </div>
          </div>

          {/* 4. Resultado Líquido Final */}
          <div className="pt-2">
            <div className="flex justify-between items-center p-4 bg-zinc-950 text-white rounded-xl text-base font-bold font-sans shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-mono">
                  =
                </div>
                <div>
                  <span className="block leading-tight">RESULTADO LÍQUIDO DO PERÍODO (SALDO GERAL)</span>
                  <span className="text-xs text-zinc-400 font-normal">
                    Faturamento Líquido após Comissões e Contas a Pagar
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl text-teal-400 font-mono">
                  R$ {saldoGeralPrevisto.toFixed(2)}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Margem: <span className="text-white font-bold">{margemOperacional}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal de Fechamento de Comissão e Emissão de Relatório */}
      {isFecharComissaoOpen && (
        <FecharComissaoModal
          isOpen={isFecharComissaoOpen}
          onClose={() => setIsFecharComissaoOpen(false)}
          instructors={instructors}
          students={students}
          agendaSessions={agendaSessions}
          modalities={modalities}
          preselectedInstructorId={selectedInstructorForClosing}
          initialMonth={selectedMonth}
          initialYear={selectedYear}
          commissionClosings={commissionClosings}
          onSaveClosing={(closing) => {
            if (onSaveCommissionClosing) onSaveCommissionClosing(closing);
          }}
          onReopenClosing={(closingId) => {
            if (onReopenCommissionClosing) onReopenCommissionClosing(closingId);
          }}
        />
      )}

    </div>
  );
};
