import { Enrollment } from '../types/studio';
import { toLocalIsoDate } from './agendaProjection';

export type EffectiveBillingStatus = 'pago' | 'a_vencer' | 'vencido';

export interface BillingEvaluation {
  status: EffectiveBillingStatus;
  dueDateIso: string;
  isDueToday: boolean;
  daysUntilDue: number;
  daysOverdue: number;
}

function diffDaysIso(fromIso: string, toIso: string): number {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return 0;
  const fromMs = Date.UTC(fy, fm - 1, fd);
  const toMs = Date.UTC(ty, tm - 1, td);
  return Math.round((toMs - fromMs) / 86400000);
}

/**
 * Calcula a data de vencimento (YYYY-MM-DD) para o ciclo atual (ou mês de início futuro)
 * respeitando o último dia do mês caso dueDay seja 29, 30 ou 31.
 */
export function getCycleDueDateIso(
  dueDay: number,
  startDate?: string,
  referenceDate: Date = new Date()
): string {
  const todayIso = toLocalIsoDate(referenceDate);
  const todayYm = todayIso.slice(0, 7);

  let targetYear = referenceDate.getFullYear();
  let targetMonth = referenceDate.getMonth() + 1; // 1..12

  if (startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    const startYm = startDate.slice(0, 7);
    if (startYm > todayYm) {
      const [sy, sm] = startDate.split('-').map(Number);
      if (sy && sm) {
        targetYear = sy;
        targetMonth = sm;
      }
    }
  }

  const lastDayOfMonth = new Date(targetYear, targetMonth, 0).getDate();
  const safeDueDay = Math.min(Math.max(1, Math.floor(dueDay || 10)), lastDayOfMonth);

  return `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(safeDueDay).padStart(2, '0')}`;
}

/**
 * Avalia o status financeiro real da mensalidade no 4.2 Contas a Receber:
 * - 'pago': já quitado no ciclo atual (ou legado em_dia sem data de pagamento)
 * - 'a_vencer': ainda não pago, porém o dia/data de vencimento é >= Hoje (não está vencido!)
 * - 'vencido': ainda não pago e já passou da data de vencimento (Hoje > data de vencimento)
 */
export function getEffectiveBillingStatus(
  enrollment: Enrollment,
  studentCreatedAt?: string,
  referenceDate: Date = new Date()
): BillingEvaluation {
  const todayIso = toLocalIsoDate(referenceDate);
  const todayYm = todayIso.slice(0, 7);
  const dueDateIso = getCycleDueDateIso(
    enrollment.dueDay,
    enrollment.startDate || studentCreatedAt,
    referenceDate
  );

  const isExplicitlyPaidForCycle =
    enrollment.paymentStatus === 'em_dia' &&
    (!enrollment.paymentDate || enrollment.paymentDate.slice(0, 7) >= todayYm);

  if (isExplicitlyPaidForCycle) {
    const daysUntilDue = Math.max(0, diffDaysIso(todayIso, dueDateIso));
    return {
      status: 'pago',
      dueDateIso,
      isDueToday: todayIso === dueDateIso,
      daysUntilDue,
      daysOverdue: 0,
    };
  }

  // Não pago no ciclo atual: só é considerado vencido se JÁ PASSOU da data de vencimento
  if (todayIso > dueDateIso) {
    return {
      status: 'vencido',
      dueDateIso,
      isDueToday: false,
      daysUntilDue: 0,
      daysOverdue: Math.max(1, diffDaysIso(dueDateIso, todayIso)),
    };
  }

  return {
    status: 'a_vencer',
    dueDateIso,
    isDueToday: todayIso === dueDateIso,
    daysUntilDue: Math.max(0, diffDaysIso(todayIso, dueDateIso)),
    daysOverdue: 0,
  };
}
