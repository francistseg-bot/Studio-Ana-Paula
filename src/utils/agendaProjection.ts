import {
  AgendaClassSession,
  ClassStudentSlot,
  Instructor,
  Student,
  StudioOperatingConfig,
} from '../types/studio';
import { DAY_NAME_TO_NUMBER } from './scheduleSlots';

export function toLocalIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMondayOfWeekIso(dateIso: string): string {
  const d = new Date(dateIso + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return dateIso;
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return toLocalIsoDate(d);
}

function normalizeText(value: string | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

const DAY_ALIAS_TO_NUMBER: Record<string, number> = {
  ...Object.entries(DAY_NAME_TO_NUMBER).reduce<Record<string, number>>((acc, [name, num]) => {
    acc[normalizeText(name)] = num;
    acc[normalizeText(name).slice(0, 3)] = num;
    return acc;
  }, {}),
  'segunda-feira': 1,
  'terca-feira': 2,
  'quarta-feira': 3,
  'quinta-feira': 4,
  'sexta-feira': 5,
  sabado: 6,
  domingo: 0,
};

export function enrollmentMatchesDayOfWeek(scheduleDays: string[] | undefined, dayOfWeek: number): boolean {
  if (!scheduleDays || scheduleDays.length === 0) return false;
  return scheduleDays.some(day => DAY_ALIAS_TO_NUMBER[normalizeText(day)] === dayOfWeek);
}

export function studentMatchesInstructor(student: Student, instructor: Instructor): boolean {
  if (!student.enrollment) return false;
  if (student.enrollment.instructorId === instructor.id) return true;
  if (
    !student.enrollment.instructorId &&
    normalizeText(student.enrollment.instructorName) === normalizeText(instructor.name)
  ) {
    return true;
  }
  return false;
}

function isDateOnOrAfterEnrollmentWeek(dateIso: string, startDate?: string): boolean {
  if (!startDate) return true;
  const startWeekMonday = getMondayOfWeekIso(startDate);
  const currentWeekMonday = getMondayOfWeekIso(toLocalIsoDate(new Date()));
  const effectiveMonday = startWeekMonday < currentWeekMonday ? startWeekMonday : currentWeekMonday;
  return dateIso >= effectiveMonday;
}

/**
 * Retorna os alunos que devem constar na sessão (sessão salva + projeção automática das matrículas ativas).
 */
export function getProjectedSessionFor(params: {
  date: string;
  time: string;
  instructor: Instructor;
  sessions: AgendaClassSession[];
  students: Student[];
  operatingConfig: StudioOperatingConfig;
}): AgendaClassSession {
  const { date, time, instructor, sessions, students, operatingConfig } = params;

  const existing = sessions.find(
    s => s.date === date && s.time === time && s.instructorId === instructor.id
  );

  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const baseStudents: ClassStudentSlot[] = existing ? [...existing.students] : [];
  const removedSet = new Set(existing?.removedStudentIds || []);
  const presentIds = new Set(baseStudents.map(sl => sl.studentId));

  // Projeta alunos ativos cuja matrícula inclui este dia da semana, horário e professor
  students.forEach(st => {
    if (st.status !== 'ativo' || !st.enrollment) return;
    if (st.enrollment.scheduleTime !== time) return;
    if (!studentMatchesInstructor(st, instructor)) return;
    if (!enrollmentMatchesDayOfWeek(st.enrollment.scheduleDays, dayOfWeek)) return;
    if (!isDateOnOrAfterEnrollmentWeek(date, st.enrollment.startDate)) return;
    if (removedSet.has(st.id)) return;
    if (presentIds.has(st.id)) return;

    const matchedDayLabel = st.enrollment.scheduleDays.find(
      d => DAY_ALIAS_TO_NUMBER[normalizeText(d)] === dayOfWeek
    );

    baseStudents.push({
      id: `slot-${st.id}-${date}-${time.replace(':', '')}`,
      studentId: st.id,
      studentName: st.name,
      studentPhone: st.phone,
      studentPhoto: st.photoUrl,
      attendanceStatus: 'agendado',
      notes: `Matrícula: ${st.enrollment.modalityName} (${matchedDayLabel || ''} ${time})`,
    });
    presentIds.add(st.id);
  });

  if (existing) {
    return {
      ...existing,
      students: baseStudents,
    };
  }

  return {
    id: `sess-${date}-${time.replace(':', '')}-${instructor.id}`,
    date,
    time,
    instructorId: instructor.id,
    instructorName: instructor.name,
    modalityName: 'Pilates em Aparelhos',
    maxCapacity: operatingConfig.defaultCapacity || 4,
    students: baseStudents,
  };
}

/**
 * Retorna todas as sessões efetivas (salvas + projetadas) para uma data específica e lista de professores.
 */
export function getProjectedSessionsForDate(params: {
  date: string;
  instructors: Instructor[];
  sessions: AgendaClassSession[];
  students: Student[];
  operatingConfig: StudioOperatingConfig;
}): AgendaClassSession[] {
  const { date, instructors, sessions, students, operatingConfig } = params;
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();

  const result: AgendaClassSession[] = [];

  instructors.forEach(inst => {
    const timesSet = new Set<string>();

    sessions
      .filter(s => s.date === date && s.instructorId === inst.id && s.students.length > 0)
      .forEach(s => timesSet.add(s.time));

    students.forEach(st => {
      if (
        st.status === 'ativo' &&
        st.enrollment &&
        st.enrollment.scheduleTime &&
        studentMatchesInstructor(st, inst) &&
        enrollmentMatchesDayOfWeek(st.enrollment.scheduleDays, dayOfWeek) &&
        isDateOnOrAfterEnrollmentWeek(date, st.enrollment.startDate)
      ) {
        timesSet.add(st.enrollment.scheduleTime);
      }
    });

    timesSet.forEach(time => {
      const projected = getProjectedSessionFor({
        date,
        time,
        instructor: inst,
        sessions,
        students,
        operatingConfig,
      });
      if (projected.students.length > 0) {
        result.push(projected);
      }
    });
  });

  return result;
}
