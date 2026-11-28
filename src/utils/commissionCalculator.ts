import {
  AgendaClassSession,
  AttendedStudentCommissionItem,
  CommissionOverridesMap,
  Instructor,
  Modality,
  MonthlyCommissionClosing,
  Student,
} from '../types/studio';
import { getInstructorShareForEnrollment } from './enrollmentSchedule';

export interface CalculatedCommissionRow {
  itemKey: string;
  studentId: string;
  studentName: string;
  type: 'mensalidade' | 'aula_avulsa' | 'reposicao';
  modalityName: string;
  monthlyFeeReference?: number;
  primaryInstructorName?: string;
  defaultAmount: number;
  commissionAmount: number;
  isOverridden: boolean;
  isManualAddition: boolean;
  details: string;
  notes?: string;
  date?: string;
}

export interface InstructorCommissionCalculation {
  isClosed: boolean;
  closingId: string;
  closedAt: string;
  closingRecord?: MonthlyCommissionClosing;
  commissionPercentage: number;
  rows: CalculatedCommissionRow[];
  attendedStudents: AttendedStudentCommissionItem[];
  revenueGenerated: number;
  defaultTotal: number;
  totalMonthlyCommission: number;
  totalSingleClassesCommission: number;
  totalReplacementCommission: number;
  totalFinalCommission: number;
  hasManualOverrides: boolean;
  suggestedSharedStudents: Student[];
}

export function getCommissionPeriodKey(year: number, month: number, instructorId: string): string {
  return `${year}-${month}__${instructorId}`;
}

export function isSessionInPeriod(dateStr: string | undefined, month: number, year: number): boolean {
  if (!dateStr) return true;
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    const sessYear = parseInt(parts[0], 10);
    const sessMonth = parseInt(parts[1], 10);
    if (!Number.isNaN(sessYear) && !Number.isNaN(sessMonth)) {
      return sessYear === year && sessMonth === month;
    }
  }
  const d = new Date(dateStr);
  return d.getMonth() + 1 === month && d.getFullYear() === year;
}

export function calculateInstructorCommission(params: {
  instructor: Instructor;
  month: number;
  year: number;
  students: Student[];
  agendaSessions: AgendaClassSession[];
  modalities: Modality[];
  commissionClosings: MonthlyCommissionClosing[];
  commissionOverrides?: CommissionOverridesMap;
}): InstructorCommissionCalculation {
  const {
    instructor,
    month,
    year,
    students,
    agendaSessions,
    modalities,
    commissionClosings,
    commissionOverrides = {},
  } = params;

  const existingClosing = commissionClosings.find(
    c => c.instructorId === instructor.id && c.month === month && c.year === year
  );

  const assignedEntries = students
    .filter(s => s.status === 'ativo' && s.enrollment)
    .map(s => ({
      student: s,
      shareInfo: getInstructorShareForEnrollment(s.enrollment, instructor),
    }))
    .filter(entry => entry.shareInfo.share > 0);

  const revenueGenerated = Math.round(
    assignedEntries.reduce(
      (acc, entry) => acc + (entry.student.enrollment?.monthlyFee || 0) * entry.shareInfo.share,
      0
    ) * 100
  ) / 100;

  if (existingClosing) {
    const rows: CalculatedCommissionRow[] = existingClosing.attendedStudents.map((item, idx) => ({
      itemKey: `closed__${idx}__${item.studentId}`,
      studentId: item.studentId,
      studentName: item.studentName,
      type: item.type,
      modalityName: item.modalityName,
      defaultAmount: item.commissionAmount,
      commissionAmount: item.commissionAmount,
      isOverridden: item.details.toLowerCase().includes('manual'),
      isManualAddition: item.details.toLowerCase().includes('compartilhado'),
      details: item.details,
      date: item.date,
    }));

    return {
      isClosed: true,
      closingId: existingClosing.id,
      closedAt: existingClosing.closedAt,
      closingRecord: existingClosing,
      commissionPercentage: existingClosing.commissionPercentage,
      rows,
      attendedStudents: existingClosing.attendedStudents,
      revenueGenerated,
      defaultTotal: existingClosing.totalFinalCommission,
      totalMonthlyCommission: existingClosing.totalMonthlyCommission,
      totalSingleClassesCommission: existingClosing.totalSingleClassesCommission,
      totalReplacementCommission: existingClosing.totalReplacementCommission,
      totalFinalCommission: existingClosing.totalFinalCommission,
      hasManualOverrides: false,
      suggestedSharedStudents: [],
    };
  }

  const commPct = instructor.commissionPercentage ?? 40;
  const periodKey = getCommissionPeriodKey(year, month, instructor.id);
  const overridesForInstructor = commissionOverrides[periodKey] || {};

  const rows: CalculatedCommissionRow[] = [];
  let sumMonthly = 0;
  let sumReplacement = 0;
  let sumSingle = 0;
  let defaultTotal = 0;
  let hasManualOverrides = false;

  // 1. Matrículas Ativas Vinculadas a este Professor (integral ou rateado entre professores)
  assignedEntries.forEach(({ student: st, shareInfo }) => {
    const fee = st.enrollment?.monthlyFee || 0;
    const proportionalFee = Math.round(fee * shareInfo.share * 100) / 100;
    const defaultAmount = Math.round(((proportionalFee * commPct) / 100) * 100) / 100;
    const itemKey = `mensalidade__${st.id}`;
    const override = overridesForInstructor[itemKey];
    const hasCustom = override && typeof override.customAmount === 'number';
    const finalAmount = hasCustom ? override.customAmount : defaultAmount;
    const isOverridden = hasCustom && (Math.abs(finalAmount - defaultAmount) > 0.009 || !!override?.notes?.trim());

    if (isOverridden) {
      hasManualOverrides = true;
    }

    defaultTotal += defaultAmount;
    sumMonthly += finalAmount;

    const isShared = shareInfo.share < 0.999;
    const slotsDesc = shareInfo.slots.map(sl => `${sl.day.slice(0, 3)} ${sl.time}`).join(', ');
    const baseDetails = isShared
      ? `Rateio ${shareInfo.slotCount}/${shareInfo.totalSlots} aulas${slotsDesc ? ` (${slotsDesc})` : ''} · Comissão ${commPct}%`
      : `Comissão Contratual (${commPct}%)`;
    const details = isOverridden
      ? `${override?.notes?.trim() ? override.notes.trim() : baseDetails} · Ajuste manual`
      : baseDetails;

    rows.push({
      itemKey,
      studentId: st.id,
      studentName: st.name,
      type: 'mensalidade',
      modalityName: st.enrollment?.modalityName || 'Pilates Regular',
      monthlyFeeReference: proportionalFee,
      defaultAmount,
      commissionAmount: finalAmount,
      isOverridden,
      isManualAddition: false,
      details,
      notes: override?.notes,
    });
  });

  // 2. Aulas de Reposição Atendidas (Alunos vindos de outro professor)
  agendaSessions.forEach(sess => {
    if (sess.instructorId !== instructor.id || !isSessionInPeriod(sess.date, month, year)) return;

    sess.students.forEach(slot => {
      if (slot.isReplacement && slot.originalInstructorId && slot.originalInstructorId !== instructor.id) {
        const defaultAmount = slot.additionalCommissionPaid || 35.0;
        const itemKey = `reposicao__${sess.id}__${slot.id}`;
        const override = overridesForInstructor[itemKey];
        const hasCustom = override && typeof override.customAmount === 'number';
        const finalAmount = hasCustom ? override.customAmount : defaultAmount;
        const isOverridden = hasCustom && (Math.abs(finalAmount - defaultAmount) > 0.009 || !!override?.notes?.trim());

        if (isOverridden) {
          hasManualOverrides = true;
        }

        defaultTotal += defaultAmount;
        sumReplacement += finalAmount;

        const baseDetails = `Reposição realizada (${slot.originalInstructorName ? `de ${slot.originalInstructorName}` : 'outro professor'})`;
        const details = isOverridden
          ? `${override?.notes?.trim() ? override.notes.trim() : baseDetails} · Ajuste manual`
          : baseDetails;

        rows.push({
          itemKey,
          studentId: slot.studentId,
          studentName: slot.studentName,
          type: 'reposicao',
          modalityName: 'Aula de Reposição',
          primaryInstructorName: slot.originalInstructorName,
          defaultAmount,
          commissionAmount: finalAmount,
          isOverridden,
          isManualAddition: false,
          details,
          notes: override?.notes,
          date: sess.date ? `${sess.date.split('-').reverse().join('/')} às ${sess.time}` : undefined,
        });
      }
    });
  });

  // 3. Aulas Avulsas / Sessões Avulsas atendidas
  const avulsaMod = modalities.find(m => m.billingType === 'aula_avulsa');
  const baseAvulsaPrice = avulsaMod?.price || 130.0;

  agendaSessions.forEach(sess => {
    if (sess.instructorId !== instructor.id || !isSessionInPeriod(sess.date, month, year)) return;

    sess.students.forEach(slot => {
      if (slot.notes?.toLowerCase().includes('avulsa') || slot.notes?.toLowerCase().includes('sessão')) {
        const defaultAmount = Math.round(((baseAvulsaPrice * commPct) / 100) * 100) / 100;
        const itemKey = `avulsa__${sess.id}__${slot.id}`;
        const override = overridesForInstructor[itemKey];
        const hasCustom = override && typeof override.customAmount === 'number';
        const finalAmount = hasCustom ? override.customAmount : defaultAmount;
        const isOverridden = hasCustom && (Math.abs(finalAmount - defaultAmount) > 0.009 || !!override?.notes?.trim());

        if (isOverridden) {
          hasManualOverrides = true;
        }

        defaultTotal += defaultAmount;
        sumSingle += finalAmount;

        const baseDetails = `Atendimento avulso (${commPct}%)`;
        const details = isOverridden
          ? `${override?.notes?.trim() ? override.notes.trim() : baseDetails} · Ajuste manual`
          : baseDetails;

        rows.push({
          itemKey,
          studentId: slot.studentId,
          studentName: slot.studentName,
          type: 'aula_avulsa',
          modalityName: 'Sessão Avulsa',
          defaultAmount,
          commissionAmount: finalAmount,
          isOverridden,
          isManualAddition: false,
          details,
          notes: override?.notes,
          date: sess.date ? `${sess.date.split('-').reverse().join('/')} às ${sess.time}` : undefined,
        });
      }
    });
  });

  // 4. Alunos adicionados manualmente neste mês (ex: aluno atendido por 2 professores)
  Object.values(overridesForInstructor).forEach(override => {
    if (!override.isManualAddition) return;
    const alreadyPrimary = rows.some(
      r => r.type === 'mensalidade' && r.studentId === override.studentId && !r.isManualAddition
    );
    if (alreadyPrimary) return;

    const studentObj = students.find(s => s.id === override.studentId);
    const fee = studentObj?.enrollment?.monthlyFee;
    const primaryInst = studentObj?.enrollment?.instructorName;
    const finalAmount = override.customAmount || 0;

    hasManualOverrides = true;
    sumMonthly += finalAmount;

    const noteText = override.notes?.trim()
      ? override.notes.trim()
      : primaryInst
        ? `Atendimento compartilhado (matrícula em ${primaryInst})`
        : 'Atendimento compartilhado neste período';

    rows.push({
      itemKey: override.itemKey,
      studentId: override.studentId,
      studentName: studentObj?.name || override.studentName,
      type: 'mensalidade',
      modalityName: studentObj?.enrollment?.modalityName || 'Atendimento Compartilhado',
      monthlyFeeReference: fee,
      primaryInstructorName: primaryInst,
      defaultAmount: 0,
      commissionAmount: finalAmount,
      isOverridden: true,
      isManualAddition: true,
      details: `${noteText} · Ajuste manual`,
      notes: override.notes,
    });
  });

  // Sugestões de alunos de outros professores que tiveram aula na agenda com este instrutor no período
  const includedStudentIds = new Set(rows.filter(r => r.type === 'mensalidade').map(r => r.studentId));
  const agendaStudentIds = new Set<string>();
  agendaSessions.forEach(sess => {
    if (sess.instructorId === instructor.id && isSessionInPeriod(sess.date, month, year)) {
      sess.students.forEach(slot => {
        if (!slot.isReplacement) {
          agendaStudentIds.add(slot.studentId);
        }
      });
    }
  });

  const suggestedSharedStudents = students.filter(
    s =>
      s.status === 'ativo' &&
      agendaStudentIds.has(s.id) &&
      getInstructorShareForEnrollment(s.enrollment, instructor).share === 0 &&
      !includedStudentIds.has(s.id)
  );

  const attendedStudents: AttendedStudentCommissionItem[] = rows.map(row => {
    const item: AttendedStudentCommissionItem = {
      studentId: row.studentId,
      studentName: row.studentName,
      type: row.type,
      modalityName: row.modalityName,
      commissionAmount: row.commissionAmount,
      details: row.details,
    };
    if (row.date) {
      item.date = row.date;
    }
    return item;
  });

  const totalFinalCommission = Math.round((sumMonthly + sumReplacement + sumSingle) * 100) / 100;

  return {
    isClosed: false,
    closingId: '',
    closedAt: '',
    commissionPercentage: commPct,
    rows,
    attendedStudents,
    revenueGenerated,
    defaultTotal: Math.round(defaultTotal * 100) / 100,
    totalMonthlyCommission: Math.round(sumMonthly * 100) / 100,
    totalSingleClassesCommission: Math.round(sumSingle * 100) / 100,
    totalReplacementCommission: Math.round(sumReplacement * 100) / 100,
    totalFinalCommission,
    hasManualOverrides,
    suggestedSharedStudents,
  };
}
