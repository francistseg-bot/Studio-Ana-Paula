export type UserRole = 'Administrador' | 'Recepcionista' | 'Fisioterapeuta / Instrutor' | 'Financeiro';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordMasked?: string;
  role: UserRole;
  permissions: string[];
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export type BillingType = 'mensalidade' | 'aula_avulsa' | 'pacote' | 'reposicao';

export interface Modality {
  id: string;
  name: string;
  billingType: BillingType;
  daysPerWeek: number; // 1, 2, 3, 4, 5 ou 0 para avulsa/pacote/reposicao
  packageClasses?: number; // Quantidade de aulas/atendimentos quando for pacote
  price: number;
  additionalTeacherFee?: number; // Valor adicional na comissão do professor quando for aula de reposição de outro professor
  description: string;
  active: boolean;
}

export interface Enrollment {
  modalityId: string;
  modalityName: string;
  daysPerWeek: number;
  scheduleDays: string[]; // ex: ['Segunda', 'Quarta']
  scheduleTime: string;   // ex: '09:00'
  instructorId: string;
  instructorName: string;
  monthlyFee: number;
  dueDay: number; // 5, 10, 15, 20
  paymentStatus: 'em_dia' | 'atrasado';
  startDate: string;
  effectivePaidAmount?: number; // Valor efetivamente recebido após eventual desconto
  paymentDate?: string;         // Data efetiva da baixa do pagamento
  discountAmount?: number;      // Valor do desconto concedido (monthlyFee - effectivePaidAmount)
}

export interface CompanyData {
  corporateName: string; // Razão Social
  tradeName: string;     // Nome Fantasia
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string; // Horários de atendimento
  contractTemplate: string; // Modelo padrão de contrato com tags
}

export interface Student {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  cpf: string;
  phone: string;
  email: string;
  address: string;
  photoUrl?: string;
  emergencyContact: string;
  emergencyPhone: string;
  profession: string;
  observations: string;
  consentImageUse: boolean; // Autoriza uso de imagem em redes sociais
  consentMedicalCertificate: boolean; // Ciente de apresentar anualmente atestado de aptidão física
  status: 'ativo' | 'inativo';
  enrollment?: Enrollment;
  signature?: string; // Base64 image
  createdAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  councilNumber: string; // Ex: CREFITO 123456-F
  commissionPercentage: number; // Percentual sobre a matrícula
  status: 'Ativo' | 'Inativo';
  specialties: string[];
}

// --- FINANCE TYPES ---
export type ExpenseType = 'fixa' | 'eventual';

export interface ExpenseCategory {
  id: string;
  name: string; // Centro de custo
}

export interface Expense {
  id: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string;
  isPaid: boolean;
  type: ExpenseType;
  isRecurring: boolean;
}

export interface MonthlyPayment {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  instructorId: string;
  instructorName: string;
  modalityName: string;
  originalAmount: number;
  paidAmount?: number; // pode ser menor com desconto
  dueDate: string; // YYYY-MM-DD
  paymentDate?: string; // Data efetiva
  status: 'em_dia' | 'atrasado' | 'pago';
  notes?: string;
}

export type MainNavigation = 
  | 'dashboard'
  | 'cadastros-empresa'
  | 'cadastros-usuarios'
  | 'cadastros-modalidades'
  | 'cadastros-alunos'
  | 'cadastros-professores'
  | 'cadastros-despesas'
  | 'agenda'
  | 'financeiro-pagar'
  | 'financeiro-receber'
  | 'financeiro-dre';

// --- AGENDA & ATENDIMENTO TYPES ---
export type AgendaViewMode = 'dia' | 'semana' | 'mes';

export type AttendanceStatus = 
  | 'agendado' 
  | 'presente' 
  | 'falta_com_aviso' 
  | 'falta_sem_aviso' 
  | 'remarcado';

export interface ClassStudentSlot {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  studentPhoto?: string;
  attendanceStatus: AttendanceStatus;
  isReplacement?: boolean; // Se é aula de reposição
  originalInstructorId?: string; // Professor de origem do aluno
  originalInstructorName?: string;
  additionalCommissionPaid?: number; // Valor adicional na comissão caso seja outro professor
  rescheduledToDate?: string;
  rescheduledToTime?: string;
  rescheduledToInstructorId?: string;
  rescheduledToInstructorName?: string;
  notes?: string;
}

export interface AgendaClassSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // '07:00', '08:00', etc.
  instructorId: string;
  instructorName: string;
  modalityName?: string;
  maxCapacity: number; // default: 4 alunos por horário com o mesmo professor
  students: ClassStudentSlot[]; // até 4 alunos
}

export interface DayScheduleHours {
  dayOfWeek: number; // 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb
  dayName: string;
  enabled: boolean;
  startTime: string; // '07:00'
  endTime: string;   // '20:00'
}

export interface StudioOperatingConfig {
  defaultCapacity: number; // 4 alunos por horário
  studioHours: DayScheduleHours[];
  instructorCustomHours: Record<string, DayScheduleHours[]>; // instructorId -> custom schedule
}

// Fechamento Mensal de Comissões dos Professores
export interface AttendedStudentCommissionItem {
  studentId: string;
  studentName: string;
  type: 'mensalidade' | 'aula_avulsa' | 'reposicao';
  modalityName: string;
  commissionAmount: number; // APENAS o valor da comissão devida ao professor (sem mensalidade integral)
  details: string; // Ex: 'Comissão 40% sobre atendimento regular', 'Reposição aluno de outro professor (+R$ 35,00)'
  date?: string;
}

export interface MonthlyCommissionClosing {
  id: string;
  instructorId: string;
  instructorName: string;
  instructorCouncil: string;
  month: number;
  year: number;
  closedAt: string;
  status: 'fechado' | 'pago';
  commissionPercentage: number;
  totalMonthlyCommission: number;
  totalSingleClassesCommission: number;
  totalReplacementCommission: number;
  totalFinalCommission: number;
  attendedStudents: AttendedStudentCommissionItem[];
  notes?: string;
}
