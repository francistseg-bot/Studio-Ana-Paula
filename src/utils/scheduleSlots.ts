import { DayScheduleHours, StudioOperatingConfig } from '../types/studio';

export const DAY_NAME_TO_NUMBER: Record<string, number> = {
  'Domingo': 0,
  'Segunda': 1,
  'Terça': 2,
  'Quarta': 3,
  'Quinta': 4,
  'Sexta': 5,
  'Sábado': 6,
};

export const NUMBER_TO_DAY_NAME: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado',
};

export function getEffectiveScheduleForInstructor(
  config: StudioOperatingConfig,
  instructorId?: string
): DayScheduleHours[] {
  if (instructorId && config.instructorCustomHours && config.instructorCustomHours[instructorId]) {
    return config.instructorCustomHours[instructorId];
  }
  return config.studioHours || [];
}

export function generateHourlySlots(startTime: string, endTime: string): string[] {
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  if (isNaN(startHour) || isNaN(endHour) || endHour <= startHour) {
    return [];
  }

  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
  }
  return slots;
}

export function getSlotsForDay(schedule: DayScheduleHours[], dayOfWeek: number): string[] {
  const dayConfig = schedule.find((d) => d.dayOfWeek === dayOfWeek);
  if (!dayConfig || !dayConfig.enabled) {
    return [];
  }
  return generateHourlySlots(dayConfig.startTime, dayConfig.endTime);
}

export function getAllEnabledSlotsForWeek(
  config: StudioOperatingConfig,
  instructorId?: string
): string[] {
  const schedulesToCheck: DayScheduleHours[][] = [];
  if (instructorId && instructorId !== 'all') {
    schedulesToCheck.push(getEffectiveScheduleForInstructor(config, instructorId));
  } else {
    schedulesToCheck.push(config.studioHours || []);
    if (config.instructorCustomHours) {
      Object.values(config.instructorCustomHours).forEach((sched) => {
        schedulesToCheck.push(sched);
      });
    }
  }

  const slotSet = new Set<string>();
  schedulesToCheck.forEach((sched) => {
    sched.forEach((day) => {
      if (day.enabled) {
        generateHourlySlots(day.startTime, day.endTime).forEach((t) => slotSet.add(t));
      }
    });
  });

  return Array.from(slotSet).sort();
}

export function getAvailableSlotsForEnrollment(
  config: StudioOperatingConfig,
  instructorId: string | undefined,
  selectedDays: string[]
): {
  slots: string[];
  disabledSelectedDays: string[];
  windowSummary: string;
  isInstructorCustom: boolean;
} {
  const isInstructorCustom = Boolean(
    instructorId && config.instructorCustomHours && config.instructorCustomHours[instructorId]
  );
  const schedule = getEffectiveScheduleForInstructor(config, instructorId);

  const selectedDayConfigs = selectedDays
    .map((name) => {
      const dayNum = DAY_NAME_TO_NUMBER[name];
      const cfg = schedule.find((d) => d.dayOfWeek === dayNum);
      return { name, dayNum, cfg };
    })
    .filter((item) => item.dayNum !== undefined);

  const disabledSelectedDays = selectedDayConfigs
    .filter((item) => !item.cfg || !item.cfg.enabled)
    .map((item) => item.name);

  const enabledSelected = selectedDayConfigs.filter((item) => item.cfg && item.cfg.enabled);

  let slots: string[] = [];
  let windowSummary = '';

  if (enabledSelected.length > 0) {
    const perDaySlots = enabledSelected.map((item) =>
      generateHourlySlots(item.cfg!.startTime, item.cfg!.endTime)
    );

    // Tenta interseção (horários disponíveis em TODOS os dias escolhidos pelo aluno)
    const intersection = perDaySlots.reduce((acc, curr) =>
      acc.filter((t) => curr.includes(t))
    );

    if (intersection.length > 0) {
      slots = intersection;
    } else {
      // Fallback para união caso os dias escolhidos tenham turnos diferentes
      const union = new Set<string>();
      perDaySlots.forEach((list) => list.forEach((t) => union.add(t)));
      slots = Array.from(union).sort();
    }

    windowSummary = enabledSelected
      .map((item) => `${item.name.slice(0, 3)}: ${item.cfg!.startTime}–${item.cfg!.endTime}`)
      .join(' · ');
  } else if (selectedDays.length === 0) {
    // Nenhum dia selecionado ainda: mostra todos os horários habilitados na semana
    const union = new Set<string>();
    const ranges: string[] = [];
    schedule.forEach((d) => {
      if (d.enabled) {
        generateHourlySlots(d.startTime, d.endTime).forEach((t) => union.add(t));
        ranges.push(`${d.dayName.slice(0, 3)}: ${d.startTime}–${d.endTime}`);
      }
    });
    slots = Array.from(union).sort();
    windowSummary = ranges.length > 0 ? 'Grade geral de 3. Agenda' : 'Nenhum dia ativo em 3. Agenda';
  } else {
    slots = [];
    windowSummary = 'Dia(s) selecionado(s) sem atendimento ativo em 3. Agenda';
  }

  return {
    slots,
    disabledSelectedDays,
    windowSummary,
    isInstructorCustom,
  };
}
