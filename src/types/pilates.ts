export type StudentStatus = 'active' | 'inactive' | 'trial' | 'medical_leave';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type SessionType = 'individual' | 'duo' | 'trio' | 'group_4';
export type EquipmentType = 'reformer' | 'cadillac' | 'chair' | 'barrel' | 'mat';
export type TransactionType = 'income' | 'expense';
export type PaymentStatus = 'paid' | 'pending' | 'overdue';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';

export interface PosturalAssessment {
  lastEvaluationDate: string;
  evaPainScale: number; // 0 to 10
  mainComplaints: string; // Ex: Dor lombar crônica L5-S1
  posturalDiagnosis: string; // Ex: Hiperlordose lombar, anteriorização de ombros
  restrictions: string[]; // Ex: Evitar flexão lombar sob carga
  goals: string[]; // Ex: Fortalecimento do Core, alívio de dor, flexibilidade
  physicalActivityLevel: 'sedentary' | 'moderate' | 'active';
  clinicalNotes: string;
}

export interface SessionEvolutionNote {
  id: string;
  date: string;
  instructorName: string;
  apparatusUsed: string[];
  exercisesPerformed: string[];
  studentFeedback: string;
  painLevelAfter: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  emergencyContact: {
    name: string;
    phone: string;
    kinship: string;
  };
  planId: string;
  planName: string;
  status: StudentStatus;
  sessionsRemaining: number;
  totalSessions: number;
  planExpiry: string;
  startDate: string;
  assessment: PosturalAssessment;
  evolutionNotes: SessionEvolutionNote[];
  attendanceCount: number;
  consecutiveAbsences: number;
}

export interface Instructor {
  id: string;
  name: string;
  title: string; // Fisioterapeuta Dermato/Traumato, Educador Físico
  crefito_cref: string;
  phone: string;
  email: string;
  specialties: string[];
  color: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  condition: 'excellent' | 'good' | 'maintenance_due';
  springsCount: {
    yellow: number; // Leve
    blue: number;   // Média-leve
    red: number;    // Média-pesada
    green: number;  // Pesada
  };
  lastMaintenance: string;
  nextMaintenance: string;
  notes: string;
}

export interface ScheduledSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  equipmentId: string;
  equipmentName: string;
  instructorId: string;
  instructorName: string;
  type: SessionType;
  studentIds: string[];
  status: SessionStatus;
  cancellationReason?: string;
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  description: string;
  studentId?: string;
  studentName?: string;
  category: 'mensalidade' | 'plano_trimestral' | 'aula_avulsa' | 'avaliacao' | 'manutencao_aparelhos' | 'aluguel_despesas' | 'produtos';
  type: TransactionType;
  amount: number;
  date: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
}

export interface MembershipPlan {
  id: string;
  name: string;
  frequencyPerWeek: number;
  monthlyPrice: number;
  description: string;
  activeStudentsCount: number;
}

export interface PrescribedExercise {
  name: string;
  apparatus: string;
  springTension: string; // Ex: 1 Vermelha + 1 Azul
  repetitions: string;
  objective: string;
  precautions: string;
}

export interface PilatesPrescription {
  title: string;
  duration: string;
  studentName: string;
  focus: string;
  warmup: PrescribedExercise[];
  mainRepertoire: PrescribedExercise[];
  cooldown: PrescribedExercise[];
  clinicalObservations: string;
}
