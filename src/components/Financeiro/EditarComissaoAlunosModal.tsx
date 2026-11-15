import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Users,
  Lock,
  Unlock,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Sparkles,
} from 'lucide-react';
import {
  AgendaClassSession,
  CommissionOverridesMap,
  Instructor,
  Modality,
  MonthlyCommissionClosing,
  Student,
  StudentCommissionOverride,
} from '../../types/studio';
import {
  calculateInstructorCommission,
  getCommissionPeriodKey,
} from '../../utils/commissionCalculator';

interface EditarComissaoAlunosModalProps {
  isOpen: boolean;
  onClose: () => void;
  instructor: Instructor;
  month: number;
  monthName: string;
  year: number;
  students: Student[];
  agendaSessions: AgendaClassSession[];
  modalities: Modality[];
  commissionClosings: MonthlyCommissionClosing[];
  commissionOverrides: CommissionOverridesMap;
  onSaveOverrides: (periodKey: string, overrides: Record<string, StudentCommissionOverride>) => void;
  onOpenClosingModal?: () => void;
}

export const EditarComissaoAlunosModal: React.FC<EditarComissaoAlunosModalProps> = ({
  isOpen,
  onClose,
  instructor,
  month,
  monthName,
  year,
  students,
  agendaSessions,
  modalities,
  commissionClosings,
  commissionOverrides,
  onSaveOverrides,
  onOpenClosingModal,
}) => {
  const periodKey = getCommissionPeriodKey(year, month, instructor.id);

  const [draftOverrides, setDraftOverrides] = useState<Record<string, StudentCommissionOverride>>(() => ({
    ...(commissionOverrides[periodKey] || {}),
  }));

  // Campos para inclusão manual de aluno (ex: aluno atendido por 2 professores)
  const [selectedAddStudentId, setSelectedAddStudentId] = useState<string>('');
  const [addAmount, setAddAmount] = useState<string>('');
  const [addNotes, setAddNotes] = useState<string>('');

  // Sincroniza o rascunho se abrir para outro instrutor/mês
  useEffect(() => {
    setDraftOverrides({ ...(commissionOverrides[periodKey] || {}) });
    setSelectedAddStudentId('');
    setAddAmount('');
    setAddNotes('');
  }, [periodKey, commissionOverrides, isOpen]);

  const draftMap = useMemo<CommissionOverridesMap>(
    () => ({
      ...commissionOverrides,
      [periodKey]: draftOverrides,
    }),
    [commissionOverrides, periodKey, draftOverrides]
  );

  const calc = useMemo(
    () =>
      calculateInstructorCommission({
        instructor,
        month,
        year,
        students,
        agendaSessions,
        modalities,
        commissionClosings,
        commissionOverrides: draftMap,
      }),
    [instructor, month, year, students, agendaSessions, modalities, commissionClosings, draftMap]
  );

  // Alunos ativos disponíveis para inclusão manual (ainda não presentes na lista deste professor como mensalidade/manual)
  const availableStudentsToAdd = useMemo(() => {
    const existingIds = new Set(
      calc.rows.filter(r => r.type === 'mensalidade').map(r => r.studentId)
    );
    return students
      .filter(s => s.status === 'ativo' && !existingIds.has(s.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [students, calc.rows]);

  if (!isOpen) return null;

  const handleAmountChange = (
    row: (typeof calc.rows)[number],
    rawValue: string
  ) => {
    const normalized = rawValue.replace(',', '.');
    const parsed = normalized === '' ? 0 : Math.max(0, parseFloat(normalized) || 0);

    setDraftOverrides(prev => {
      const next = { ...prev };
      const existingNote = prev[row.itemKey]?.notes ?? row.notes;

      if (!row.isManualAddition && Math.abs(parsed - row.defaultAmount) < 0.005 && !existingNote?.trim()) {
        delete next[row.itemKey];
        return next;
      }

      next[row.itemKey] = {
        itemKey: row.itemKey,
        studentId: row.studentId,
        studentName: row.studentName,
        customAmount: parsed,
        isManualAddition: row.isManualAddition,
        ...(existingNote ? { notes: existingNote } : {}),
      };
      return next;
    });
  };

  const handleNotesChange = (
    row: (typeof calc.rows)[number],
    notesValue: string
  ) => {
    setDraftOverrides(prev => {
      const next = { ...prev };
      const currentAmount = prev[row.itemKey]?.customAmount ?? row.commissionAmount;

      if (!row.isManualAddition && Math.abs(currentAmount - row.defaultAmount) < 0.005 && !notesValue.trim()) {
        delete next[row.itemKey];
        return next;
      }

      next[row.itemKey] = {
        itemKey: row.itemKey,
        studentId: row.studentId,
        studentName: row.studentName,
        customAmount: currentAmount,
        isManualAddition: row.isManualAddition,
        ...(notesValue.trim() ? { notes: notesValue } : {}),
      };
      return next;
    });
  };

  const handleResetRow = (itemKey: string) => {
    setDraftOverrides(prev => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
  };

  const handleResetAll = () => {
    setDraftOverrides({});
  };

  const handleSelectStudentForAddition = (studentId: string) => {
    setSelectedAddStudentId(studentId);
    const st = students.find(s => s.id === studentId);
    if (st && st.enrollment?.monthlyFee) {
      // Sugere metade da comissão padrão como ponto de partida (comum quando aluno divide entre 2 professores)
      const fullComm = (st.enrollment.monthlyFee * (instructor.commissionPercentage || 40)) / 100;
      setAddAmount((Math.round((fullComm / 2) * 100) / 100).toFixed(2));
      setAddNotes(
        st.enrollment.instructorName
          ? `Atendimento compartilhado (matrícula principal: ${st.enrollment.instructorName})`
          : 'Atendimento compartilhado'
      );
    } else {
      setAddAmount('0.00');
      setAddNotes('Atendimento compartilhado');
    }
  };

  const handleAddSharedStudent = () => {
    if (!selectedAddStudentId) return;
    const st = students.find(s => s.id === selectedAddStudentId);
    if (!st) return;

    const parsed = Math.max(0, parseFloat(addAmount.replace(',', '.')) || 0);
    const itemKey = `manual__${st.id}`;

    setDraftOverrides(prev => ({
      ...prev,
      [itemKey]: {
        itemKey,
        studentId: st.id,
        studentName: st.name,
        customAmount: Math.round(parsed * 100) / 100,
        isManualAddition: true,
        notes: addNotes.trim() || 'Atendimento compartilhado',
      },
    }));

    setSelectedAddStudentId('');
    setAddAmount('');
    setAddNotes('');
  };

  const handleSave = () => {
    onSaveOverrides(periodKey, draftOverrides);
    onClose();
  };

  const handleSaveAndOpenClosing = () => {
    onSaveOverrides(periodKey, draftOverrides);
    onClose();
    if (onOpenClosingModal) {
      onOpenClosingModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-4xl w-full p-5 sm:p-7 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-100 shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-950 text-purple-300 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                  Alunos Atendidos & Comissão por Aluno
                </h3>
                {calc.isClosed ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Competência Fechada</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 inline-flex items-center gap-1">
                    <Unlock className="w-3 h-3" />
                    <span>Pré-Fechamento (Editável)</span>
                  </span>
                )}
              </div>
              <p className="text-zinc-600 text-xs mt-0.5">
                <strong>{instructor.name}</strong> ({instructor.councilNumber}) · Competência:{' '}
                <strong>{monthName} / {year}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Regra de preservação do percentual padrão */}
        <div className="mt-3 p-3 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-start gap-2 text-purple-950 shrink-0">
          <AlertCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Percentual padrão preservado ({instructor.commissionPercentage}%):</strong>{' '}
            {calc.isClosed
              ? 'Esta comissão já foi fechada/homologada para o período. Para editar algum aluno, reabra a comissão primeiro em "Ver Relatório → Reabrir Comissão".'
              : 'Você pode ajustar manualmente o valor em R$ de cada aluno ou incluir um aluno compartilhado com outro professor antes do fechamento. Isso não altera o percentual padrão cadastrado em 2.5 Professores.'}
          </div>
        </div>

        {/* KPIs Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3.5 shrink-0">
          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              Alunos / Atendimentos
            </span>
            <div className="text-lg font-extrabold font-mono text-zinc-900 mt-0.5">
              {calc.rows.length}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">
              Cálculo Padrão ({instructor.commissionPercentage}%)
            </span>
            <div className="text-lg font-extrabold font-mono text-zinc-700 mt-0.5">
              R$ {calc.defaultTotal.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-950 text-white border border-purple-900">
            <span className="text-[10px] uppercase font-bold text-purple-300 block">
              Total Aplicado no DRE
            </span>
            <div className="text-lg font-extrabold font-mono text-teal-300 mt-0.5">
              R$ {calc.totalFinalCommission.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Conteúdo Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Tabela / Lista de Alunos Atendidos */}
          <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-2.5 bg-zinc-100/80 border-b border-zinc-200 flex items-center justify-between">
              <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-purple-700" />
                <span>Relação de Alunos Atendidos no Período</span>
              </span>
              {!calc.isClosed && Object.keys(draftOverrides).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-[11px] font-semibold text-zinc-600 hover:text-rose-700 inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restaurar tudo ao padrão</span>
                </button>
              )}
            </div>

            {calc.rows.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 italic">
                Nenhum aluno vinculado ou atendimento registrado para este professor no período. Utilize a seção abaixo para incluir um aluno atendido manualmente.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {calc.rows.map(row => (
                  <div
                    key={row.itemKey}
                    className={`p-3.5 transition-colors ${
                      row.isOverridden ? 'bg-purple-50/40' : 'hover:bg-zinc-50/70'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Informações do Aluno */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-zinc-900 text-sm">
                            {row.studentName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              row.isManualAddition
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : row.type === 'mensalidade'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200/70'
                                  : row.type === 'reposicao'
                                    ? 'bg-purple-50 text-purple-800 border border-purple-200/70'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200/70'
                            }`}
                          >
                            {row.isManualAddition ? 'Atendimento Compartilhado' : row.modalityName}
                          </span>
                          {row.isOverridden && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              Editado manualmente
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-zinc-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                          {row.monthlyFeeReference !== undefined && (
                            <span>
                              Mensalidade contrato:{' '}
                              <strong className="font-mono text-zinc-700">
                                R$ {row.monthlyFeeReference.toFixed(2)}
                              </strong>
                            </span>
                          )}
                          {!row.isManualAddition && (
                            <span>
                              Padrão ({row.type === 'reposicao' ? 'adicional' : `${instructor.commissionPercentage}%`}):{' '}
                              <strong className="font-mono text-zinc-700">
                                R$ {row.defaultAmount.toFixed(2)}
                              </strong>
                            </span>
                          )}
                          {row.primaryInstructorName && (
                            <span className="text-indigo-700 font-medium">
                              Prof. principal: {row.primaryInstructorName}
                            </span>
                          )}
                          {row.date && (
                            <span className="font-mono text-zinc-400">{row.date}</span>
                          )}
                        </div>

                        {/* Campo opcional de observação caso a caso */}
                        {!calc.isClosed && (
                          <div className="mt-2">
                            <input
                              type="text"
                              value={draftOverrides[row.itemKey]?.notes ?? row.notes ?? ''}
                              onChange={e => handleNotesChange(row, e.target.value)}
                              placeholder="Observação opcional (ex: dividido 50/50 com outro professor)"
                              className="w-full max-w-md bg-zinc-50 border border-zinc-200 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </div>
                        )}
                      </div>

                      {/* Campo de Edição do Valor da Comissão (R$) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end">
                          <label className="text-[10px] font-bold uppercase text-zinc-500 mb-0.5">
                            Comissão (R$)
                          </label>
                          {calc.isClosed ? (
                            <div className="font-mono font-extrabold text-sm text-zinc-900 px-3 py-2 bg-zinc-100 rounded-xl border border-zinc-200">
                              R$ {row.commissionAmount.toFixed(2)}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 font-mono font-bold text-xs">
                                  R$
                                </span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={
                                    draftOverrides[row.itemKey]?.customAmount !== undefined
                                      ? draftOverrides[row.itemKey].customAmount
                                      : row.commissionAmount
                                  }
                                  onChange={e => handleAmountChange(row, e.target.value)}
                                  className={`w-32 pl-8 pr-2.5 py-2 rounded-xl border font-mono font-bold text-sm text-right focus:outline-none focus:ring-2 min-h-[40px] ${
                                    row.isOverridden
                                      ? 'bg-amber-50 border-amber-400 text-amber-950 focus:ring-amber-500/30'
                                      : 'bg-white border-zinc-300 text-zinc-900 focus:ring-purple-500/30'
                                  }`}
                                />
                              </div>

                              {row.isManualAddition ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetRow(row.itemKey)}
                                  title="Remover aluno desta lista"
                                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              ) : row.isOverridden ? (
                                <button
                                  type="button"
                                  onClick={() => handleResetRow(row.itemKey)}
                                  title="Restaurar valor padrão calculado"
                                  className="p-2 text-zinc-500 hover:text-purple-800 hover:bg-purple-50 rounded-xl border border-zinc-200 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seção para Incluir Aluno Atendido por Outro Professor (Atendimento Compartilhado) */}
          {!calc.isClosed && (
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div>
                <h4 className="font-bold text-zinc-900 text-xs flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-teal-700" />
                  <span>Incluir Aluno Atendido por Dois Professores neste Mês</span>
                </h4>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Caso um aluno tenha matrícula vinculada a outro professor mas também seja atendido por{' '}
                  <strong>{instructor.name}</strong>, inclua-o abaixo definindo o valor exato da comissão.
                </p>
              </div>

              {/* Sugestões detectadas na agenda deste professor */}
              {calc.suggestedSharedStudents.length > 0 && (
                <div className="p-2.5 rounded-xl bg-teal-50/80 border border-teal-200 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-teal-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                    <span>Encontrados na agenda deste professor:</span>
                  </span>
                  {calc.suggestedSharedStudents.map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleSelectStudentForAddition(st.id)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-teal-600 hover:text-white text-teal-900 border border-teal-300 text-[11px] font-semibold transition-colors"
                    >
                      + {st.name}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-5">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                    Selecionar Aluno Ativo
                  </label>
                  <select
                    value={selectedAddStudentId}
                    onChange={e => handleSelectStudentForAddition(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-600 min-h-[40px]"
                  >
                    <option value="">-- Selecione um aluno --</option>
                    {availableStudentsToAdd.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                        {st.enrollment?.instructorName
                          ? ` (Matrícula: ${st.enrollment.instructorName} · R$ ${st.enrollment.monthlyFee.toFixed(2)})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                    Comissão a Receber (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={addAmount}
                    onChange={e => setAddAmount(e.target.value)}
                    className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600 min-h-[40px]"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">
                      Observação
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1x na semana"
                      value={addNotes}
                      onChange={e => setAddNotes(e.target.value)}
                      className="w-full bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-teal-600 min-h-[40px]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!selectedAddStudentId}
                    onClick={handleAddSharedStudent}
                    className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs min-h-[40px] shrink-0 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-xl font-medium min-h-[42px]"
          >
            {calc.isClosed ? 'Fechar' : 'Cancelar'}
          </button>

          {!calc.isClosed && (
            <div className="flex flex-wrap items-center gap-2">
              {onOpenClosingModal && (
                <button
                  type="button"
                  onClick={handleSaveAndOpenClosing}
                  className="px-3.5 py-2 border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 rounded-xl font-semibold flex items-center gap-1.5 min-h-[42px] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Salvar e Fechar Comissão</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs min-h-[42px] transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Salvar Ajustes no DRE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
