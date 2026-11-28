import { Enrollment, EnrollmentScheduleSlot, Instructor } from '../types/studio';

function normalizePersonName(value?: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/^(dr\.?|dra\.?|prof\.?|profa\.?)\s+/i, '')
    .replace(/\s+/g, ' ');
}

export function instructorMatchesSlot(
  slot: Pick<EnrollmentScheduleSlot, 'instructorId' | 'instructorName'>,
  instructor: Pick<Instructor, 'id' | 'name'>
): boolean {
  if (slot.instructorId && instructor.id && slot.instructorId === instructor.id) {
    return true;
  }
  if (
    !slot.instructorId &&
    slot.instructorName &&
    normalizePersonName(slot.instructorName) === normalizePersonName(instructor.name)
  ) {
    return true;
  }
  return false;
}

/**
 * Retorna a grade detalhada por dia da matrícula, com fallback automático para matrículas legadas.
 */
export function getEnrollmentSlots(enrollment?: Enrollment | null): EnrollmentScheduleSlot[] {
  if (!enrollment) return [];

  if (enrollment.scheduleSlots && enrollment.scheduleSlots.length > 0) {
    return enrollment.scheduleSlots.map((slot) => ({
      day: slot.day,
      time: slot.time || enrollment.scheduleTime || '08:00',
      instructorId: slot.instructorId || enrollment.instructorId || '',
      instructorName: slot.instructorName || enrollment.instructorName || 'A definir',
    }));
  }

  return (enrollment.scheduleDays || []).map((day) => ({
    day,
    time: enrollment.scheduleTime || '08:00',
    instructorId: enrollment.instructorId || '',
    instructorName: enrollment.instructorName || 'A definir',
  }));
}

export interface EnrollmentInstructorShare {
  instructorId: string;
  instructorName: string;
  slotCount: number;
  totalSlots: number;
  share: number; // fração entre 0 e 1 (ex: 0.5 para 1 de 2 aulas)
  slots: EnrollmentScheduleSlot[];
}

/**
 * Agrupa os professores vinculados à matrícula e calcula a fração proporcional de aulas de cada um.
 */
export function getEnrollmentInstructorShares(
  enrollment?: Enrollment | null
): EnrollmentInstructorShare[] {
  const slots = getEnrollmentSlots(enrollment);
  if (slots.length === 0) {
    if (enrollment?.instructorId || enrollment?.instructorName) {
      return [
        {
          instructorId: enrollment.instructorId || '',
          instructorName: enrollment.instructorName || 'A definir',
          slotCount: 1,
          totalSlots: 1,
          share: 1,
          slots: [],
        },
      ];
    }
    return [];
  }

  const totalSlots = slots.length;
  const groups = new Map<string, EnrollmentInstructorShare>();

  slots.forEach((slot) => {
    const key = slot.instructorId || `name:${normalizePersonName(slot.instructorName)}`;
    const existing = groups.get(key);
    if (existing) {
      existing.slotCount += 1;
      existing.slots.push(slot);
      existing.share = existing.slotCount / totalSlots;
    } else {
      groups.set(key, {
        instructorId: slot.instructorId,
        instructorName: slot.instructorName || 'A definir',
        slotCount: 1,
        totalSlots,
        share: 1 / totalSlots,
        slots: [slot],
      });
    }
  });

  return Array.from(groups.values());
}

export function getInstructorShareForEnrollment(
  enrollment: Enrollment | undefined | null,
  instructor: Pick<Instructor, 'id' | 'name'>
): {
  share: number;
  slotCount: number;
  totalSlots: number;
  slots: EnrollmentScheduleSlot[];
} {
  if (!enrollment) {
    return { share: 0, slotCount: 0, totalSlots: 0, slots: [] };
  }

  const allSlots = getEnrollmentSlots(enrollment);
  if (allSlots.length === 0) {
    const matchesLegacy =
      (enrollment.instructorId && enrollment.instructorId === instructor.id) ||
      (!enrollment.instructorId &&
        normalizePersonName(enrollment.instructorName) === normalizePersonName(instructor.name));
    return matchesLegacy
      ? { share: 1, slotCount: 1, totalSlots: 1, slots: [] }
      : { share: 0, slotCount: 0, totalSlots: 0, slots: [] };
  }

  const matchedSlots = allSlots.filter((slot) => instructorMatchesSlot(slot, instructor));
  if (matchedSlots.length === 0) {
    return { share: 0, slotCount: 0, totalSlots: allSlots.length, slots: [] };
  }

  return {
    share: matchedSlots.length / allSlots.length,
    slotCount: matchedSlots.length,
    totalSlots: allSlots.length,
    slots: matchedSlots,
  };
}

export function hasDistinctSlotTimesOrInstructors(enrollment?: Enrollment | null): boolean {
  const slots = getEnrollmentSlots(enrollment);
  if (slots.length <= 1) return false;
  const uniqueTimes = new Set(slots.map((s) => s.time));
  const uniqueInstructors = new Set(
    slots.map((s) => s.instructorId || normalizePersonName(s.instructorName))
  );
  return uniqueTimes.size > 1 || uniqueInstructors.size > 1;
}

export function formatEnrollmentScheduleSummary(enrollment?: Enrollment | null): string {
  if (!enrollment) return 'A combinar';
  const slots = getEnrollmentSlots(enrollment);
  if (slots.length === 0) return `${enrollment.daysPerWeek}x na semana às ${enrollment.scheduleTime}`;

  const uniqueTimes = new Set(slots.map((s) => s.time));
  if (uniqueTimes.size === 1) {
    const days = slots.map((s) => s.day).join(', ');
    return `${enrollment.daysPerWeek}x (${days}) às ${slots[0].time}`;
  }

  return slots.map((s) => `${s.day.slice(0, 3)} ${s.time}`).join(' · ');
}

export function formatEnrollmentInstructorsSummary(enrollment?: Enrollment | null): string {
  if (!enrollment) return 'A definir';
  const shares = getEnrollmentInstructorShares(enrollment);
  if (shares.length === 0) return enrollment.instructorName || 'A definir';
  return shares.map((s) => s.instructorName).join(' / ');
}

export function formatEnrollmentTimesForContract(enrollment?: Enrollment | null): string {
  if (!enrollment) return 'A combinar';
  const slots = getEnrollmentSlots(enrollment);
  if (slots.length === 0) return enrollment.scheduleTime || 'A combinar';

  const uniqueTimes = new Set(slots.map((s) => s.time));
  if (uniqueTimes.size === 1) {
    return slots[0].time;
  }

  return slots.map((s) => `${s.day} (${s.time})`).join(', ');
}
