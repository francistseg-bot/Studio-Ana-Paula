import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageSquare, 
  Phone, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  BookmarkCheck,
  UserCheck,
  UserX,
  X,
  Filter,
  Camera,
  Image as ImageIcon,
  FileCheck,
  MapPin,
  Mail,
  Upload,
  Trash2,
  Clock
} from 'lucide-react';
import { Student, Modality, Instructor, Enrollment, EnrollmentScheduleSlot, CompanyData, StudioOperatingConfig } from '../../types/studio';
import { ContratoModal } from '../Modals/ContratoModal';
import {
  getAvailableSlotsForEnrollment,
  getEffectiveScheduleForInstructor,
  getSlotsForDay,
  DAY_NAME_TO_NUMBER
} from '../../utils/scheduleSlots';
import { toLocalIsoDate } from '../../utils/agendaProjection';
import { getCycleDueDateIso, getEffectiveBillingStatus } from '../../utils/billingStatus';
import {
  formatEnrollmentInstructorsSummary,
  formatEnrollmentScheduleSummary,
  getEnrollmentInstructorShares,
  getEnrollmentSlots,
  hasDistinctSlotTimesOrInstructors,
} from '../../utils/enrollmentSchedule';

const WEEKDAY_ORDER = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function sortWeekDays(days: string[]): string[] {
  return [...days].sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));
}

interface AlunosViewProps {
  students: Student[];
  modalities: Modality[];
  instructors: Instructor[];
  companyData: CompanyData;
  operatingConfig: StudioOperatingConfig;
  initialFilter?: { status?: 'ativo' | 'inativo'; paymentStatus?: 'em_dia' | 'atrasado' };
  canViewFinancialInfo?: boolean;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onToggleStudentStatus?: (studentId: string) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const AlunosView: React.FC<AlunosViewProps> = ({
  students,
  modalities,
  instructors,
  companyData,
  operatingConfig,
  initialFilter,
  canViewFinancialInfo = true,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onToggleStudentStatus,
  onSelectStudentDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>(
    initialFilter?.status || 'all'
  );
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'em_dia' | 'pendente' | 'atrasado'>(
    initialFilter?.paymentStatus || 'all'
  );

  // Modal: Novo Aluno + Matrícula na mesma tela
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Modal: Emissão de Contrato
  const [studentToContract, setStudentToContract] = useState<Student | null>(null);

  // Form Fields - Aluno
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [profession, setProfession] = useState('');
  const [observations, setObservations] = useState('');
  const [status, setStatus] = useState<'ativo' | 'inativo'>('ativo');
  const [consentImageUse, setConsentImageUse] = useState(true);
  const [consentMedicalCertificate, setConsentMedicalCertificate] = useState(true);

  // Form Fields - Matrícula
  const [includeEnrollment, setIncludeEnrollment] = useState(true);
  const [selectedModalityId, setSelectedModalityId] = useState(modalities[0]?.id || '');
  const [daysPerWeek, setDaysPerWeek] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Terça', 'Quinta']);
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const [instructorId, setInstructorId] = useState(instructors[0]?.id || '');
  const [scheduleSlots, setScheduleSlots] = useState<EnrollmentScheduleSlot[]>(() =>
    ['Terça', 'Quinta'].map((day) => ({
      day,
      time: '08:00',
      instructorId: instructors[0]?.id || '',
      instructorName: instructors[0]?.name || 'A definir',
    }))
  );
  const [dueDayInput, setDueDayInput] = useState<string>('10');
  const [startDate, setStartDate] = useState<string>(() => toLocalIsoDate(new Date()));
  const [paymentStatus, setPaymentStatus] = useState<'em_dia' | 'pendente' | 'atrasado'>('pendente');

  // Modal para inclusão rápida de matrícula em aluno já existente
  const [matriculaModalStudent, setMatriculaModalStudent] = useState<Student | null>(null);

  // Horários disponíveis sincronizados com 3. Agenda (operatingConfig)
  const effectiveInstructorSchedule = getEffectiveScheduleForInstructor(
    operatingConfig,
    instructorId || instructors[0]?.id
  );
  const scheduleInfo = getAvailableSlotsForEnrollment(
    operatingConfig,
    instructorId || instructors[0]?.id,
    selectedDays
  );

  const sundayEnabled = effectiveInstructorSchedule.find(d => d.dayOfWeek === 0)?.enabled;
  const availableWeekDays = sundayEnabled
    ? ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']
    : ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const buildSlotForDay = (
    day: string,
    instId: string,
    preferredTime: string
  ): EnrollmentScheduleSlot => {
    const chosenInst = instructors.find(i => i.id === instId) || instructors[0];
    const resolvedInstId = chosenInst?.id || '';
    const dayNum = DAY_NAME_TO_NUMBER[day];
    const effectiveSchedule = getEffectiveScheduleForInstructor(operatingConfig, resolvedInstId);
    const daySlots = dayNum !== undefined ? getSlotsForDay(effectiveSchedule, dayNum) : [];
    const resolvedTime = daySlots.includes(preferredTime)
      ? preferredTime
      : daySlots[0] || preferredTime || '08:00';
    return {
      day,
      time: resolvedTime,
      instructorId: resolvedInstId,
      instructorName: chosenInst?.name || 'A definir',
    };
  };

  // Mantém o horário padrão compatível com as janelas configuradas em 3. Agenda
  useEffect(() => {
    if (scheduleInfo.slots.length > 0 && !scheduleInfo.slots.includes(scheduleTime)) {
      const isEditingLegacySlot = editingStudent?.enrollment?.scheduleTime === scheduleTime;
      if (!isEditingLegacySlot) {
        setScheduleTime(scheduleInfo.slots[0]);
      }
    }
  }, [instructorId, selectedDays, operatingConfig, scheduleInfo.slots.join(',')]);

  const getParsedDueDay = () => {
    const parsed = parseInt(dueDayInput, 10);
    if (isNaN(parsed)) return 10;
    return Math.min(31, Math.max(1, parsed));
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      const nextDays = selectedDays.filter(d => d !== day);
      setSelectedDays(nextDays);
      setScheduleSlots(prev => prev.filter(s => s.day !== day));
    } else {
      const nextDays = sortWeekDays([...selectedDays, day]);
      setSelectedDays(nextDays);
      const newSlot = buildSlotForDay(day, instructorId || instructors[0]?.id || '', scheduleTime);
      setScheduleSlots(prev =>
        [...prev.filter(s => s.day !== day), newSlot].sort(
          (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
        )
      );
    }
  };

  const handleDefaultInstructorChange = (newInstId: string) => {
    const prevInstId = instructorId;
    setInstructorId(newInstId);
    const newInst = instructors.find(i => i.id === newInstId) || instructors[0];
    if (!newInst) return;
    setScheduleSlots(prev => {
      const allMatchedPrev = prev.every(s => !s.instructorId || s.instructorId === prevInstId);
      if (!allMatchedPrev) return prev;
      return prev.map(slot => {
        const dayNum = DAY_NAME_TO_NUMBER[slot.day];
        const instSched = getEffectiveScheduleForInstructor(operatingConfig, newInst.id);
        const dayAvailable = dayNum !== undefined ? getSlotsForDay(instSched, dayNum) : [];
        const nextTime =
          dayAvailable.length === 0 || dayAvailable.includes(slot.time)
            ? slot.time
            : dayAvailable[0];
        return {
          ...slot,
          time: nextTime,
          instructorId: newInst.id,
          instructorName: newInst.name,
        };
      });
    });
  };

  const handleDefaultTimeChange = (newTime: string) => {
    const prevTime = scheduleTime;
    setScheduleTime(newTime);
    setScheduleSlots(prev => {
      const allMatchedPrev = prev.every(s => !s.time || s.time === prevTime);
      if (!allMatchedPrev) return prev;
      return prev.map(slot => ({ ...slot, time: newTime }));
    });
  };

  const handleApplyDefaultToAllDays = () => {
    const targetInstId = instructorId || instructors[0]?.id || '';
    setScheduleSlots(prev =>
      prev.map(slot => buildSlotForDay(slot.day, targetInstId, scheduleTime))
    );
  };

  const handleSlotTimeChange = (day: string, newTime: string) => {
    setScheduleSlots(prev =>
      prev.map(slot => (slot.day === day ? { ...slot, time: newTime } : slot))
    );
  };

  const handleSlotInstructorChange = (day: string, newInstId: string) => {
    const chosenInst = instructors.find(i => i.id === newInstId);
    if (!chosenInst) return;
    const dayNum = DAY_NAME_TO_NUMBER[day];
    const instSched = getEffectiveScheduleForInstructor(operatingConfig, chosenInst.id);
    const dayAvailable = dayNum !== undefined ? getSlotsForDay(instSched, dayNum) : [];

    setScheduleSlots(prev =>
      prev.map(slot => {
        if (slot.day !== day) return slot;
        const nextTime =
          dayAvailable.length === 0 || dayAvailable.includes(slot.time)
            ? slot.time
            : dayAvailable[0];
        return {
          ...slot,
          time: nextTime,
          instructorId: chosenInst.id,
          instructorName: chosenInst.name,
        };
      })
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    const defaultInstId = instructors[0]?.id || '';
    const defaultDays = ['Terça', 'Quinta'];
    const defaultSchedule = getAvailableSlotsForEnrollment(operatingConfig, defaultInstId, defaultDays);
    const defaultTime = defaultSchedule.slots[0] || '08:00';

    setName('');
    setBirthDate('1990-01-01');
    setCpf('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPhotoUrl('');
    setEmergencyContact('');
    setEmergencyPhone('');
    setProfession('');
    setObservations('');
    setStatus('ativo');
    setConsentImageUse(true);
    setConsentMedicalCertificate(true);
    setIncludeEnrollment(true);
    setSelectedModalityId(modalities[0]?.id || '');
    setDaysPerWeek(2);
    setSelectedDays(defaultDays);
    setScheduleTime(defaultTime);
    setInstructorId(defaultInstId);
    setScheduleSlots(defaultDays.map(day => buildSlotForDay(day, defaultInstId, defaultTime)));
    setDueDayInput('10');
    setStartDate(toLocalIsoDate(new Date()));
    setPaymentStatus('pendente');
    setEditingStudent(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddStudentOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setName(student.name);
    setBirthDate(student.birthDate);
    setCpf(student.cpf || '');
    setPhone(student.phone);
    setEmail(student.email || '');
    setAddress(student.address || '');
    setPhotoUrl(student.photoUrl || '');
    setEmergencyContact(student.emergencyContact || '');
    setEmergencyPhone(student.emergencyPhone || '');
    setProfession(student.profession || '');
    setObservations(student.observations || '');
    setStatus(student.status);
    setConsentImageUse(student.consentImageUse ?? true);
    setConsentMedicalCertificate(student.consentMedicalCertificate ?? true);

    if (student.enrollment) {
      const billing = getEffectiveBillingStatus(student.enrollment, student.createdAt);
      const existingSlots = getEnrollmentSlots(student.enrollment);
      const sortedSlots = [...existingSlots].sort(
        (a, b) => WEEKDAY_ORDER.indexOf(a.day) - WEEKDAY_ORDER.indexOf(b.day)
      );
      setIncludeEnrollment(true);
      setSelectedModalityId(student.enrollment.modalityId);
      setDaysPerWeek(student.enrollment.daysPerWeek);
      setSelectedDays(sortedSlots.map(s => s.day));
      setScheduleTime(sortedSlots[0]?.time || student.enrollment.scheduleTime);
      setInstructorId(sortedSlots[0]?.instructorId || student.enrollment.instructorId);
      setScheduleSlots(sortedSlots);
      setDueDayInput((student.enrollment.dueDay || 10).toString());
      setStartDate(student.enrollment.startDate || student.createdAt || toLocalIsoDate(new Date()));
      setPaymentStatus(
        billing.status === 'pago'
          ? 'em_dia'
          : billing.status === 'a_vencer'
          ? 'pendente'
          : 'atrasado'
      );
    } else {
      setIncludeEnrollment(false);
      setStartDate(student.createdAt || toLocalIsoDate(new Date()));
      setPaymentStatus('pendente');
    }

    setIsAddStudentOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    let enrollmentData: Enrollment | undefined = undefined;

    if (includeEnrollment && selectedModalityId) {
      const chosenMod = modalities.find(m => m.id === selectedModalityId);
      const chosenInst = instructors.find(i => i.id === instructorId) || instructors[0];
      const existingEnr = editingStudent?.enrollment;
      const parsedDueDay = getParsedDueDay();
      const effectiveStart = startDate || toLocalIsoDate(new Date());
      const todayIso = toLocalIsoDate(new Date());
      const dueDateIso = getCycleDueDateIso(parsedDueDay, effectiveStart);

      const normalizedSlots: EnrollmentScheduleSlot[] = (scheduleSlots.length > 0
        ? scheduleSlots
        : (selectedDays.length > 0 ? selectedDays : ['Segunda', 'Quarta']).map(day =>
            buildSlotForDay(day, chosenInst?.id || '', scheduleTime)
          )
      ).map(sl => {
        const matchedInst = instructors.find(i => i.id === sl.instructorId);
        return {
          day: sl.day,
          time: sl.time || scheduleTime || '08:00',
          instructorId: matchedInst?.id || sl.instructorId || chosenInst?.id || '',
          instructorName: matchedInst?.name || sl.instructorName || chosenInst?.name || 'A definir',
        };
      });
      const primarySlot = normalizedSlots[0];
      const combinedInstructorName = formatEnrollmentInstructorsSummary({
        scheduleSlots: normalizedSlots,
      } as Enrollment);

      // Se o vencimento for >= Hoje e não estiver pago, nunca salva como vencido/atrasado
      const normalizedStatus: 'em_dia' | 'pendente' | 'atrasado' =
        paymentStatus === 'em_dia'
          ? 'em_dia'
          : todayIso > dueDateIso
          ? 'atrasado'
          : 'pendente';

      const monthlyFeeVal = chosenMod?.price || 380.00;
      const isPaid = normalizedStatus === 'em_dia';

      enrollmentData = {
        ...(existingEnr || {}),
        modalityId: chosenMod?.id || 'mod-1',
        modalityName: chosenMod?.name || 'Pilates em Aparelhos',
        daysPerWeek: chosenMod?.daysPerWeek || normalizedSlots.length || daysPerWeek,
        scheduleDays: normalizedSlots.map(s => s.day),
        scheduleTime: primarySlot?.time || scheduleTime,
        scheduleSlots: normalizedSlots,
        instructorId: primarySlot?.instructorId || chosenInst?.id || '',
        instructorName: combinedInstructorName,
        monthlyFee: monthlyFeeVal,
        dueDay: parsedDueDay,
        paymentStatus: normalizedStatus,
        startDate: effectiveStart,
        paymentDate: isPaid ? (existingEnr?.paymentDate || todayIso) : undefined,
        effectivePaidAmount: isPaid ? (existingEnr?.effectivePaidAmount ?? monthlyFeeVal) : undefined,
        discountAmount: isPaid ? existingEnr?.discountAmount : undefined,
        paymentMethod: isPaid ? existingEnr?.paymentMethod : undefined,
      };
    }

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name,
        birthDate,
        cpf,
        phone,
        email,
        address,
        photoUrl,
        emergencyContact,
        emergencyPhone,
        profession,
        observations,
        status,
        consentImageUse,
        consentMedicalCertificate,
        enrollment: enrollmentData || editingStudent.enrollment,
      };
      onUpdateStudent(updated);
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name,
        birthDate,
        cpf: cpf || '000.000.000-00',
        phone,
        email,
        address,
        photoUrl,
        emergencyContact,
        emergencyPhone,
        profession,
        observations: observations || 'Sem observações clínicas cadastradas.',
        consentImageUse,
        consentMedicalCertificate,
        status,
        enrollment: enrollmentData,
        createdAt: toLocalIsoDate(new Date())
      };
      onAddStudent(newStudent);
    }

    setIsAddStudentOpen(false);
    resetForm();
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.cpf && s.cpf.includes(searchTerm)) ||
      (s.profession && s.profession.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.observations && s.observations.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    let matchesPayment = true;
    if (canViewFinancialInfo && paymentFilter !== 'all') {
      if (!s.enrollment) {
        matchesPayment = false;
      } else {
        const billing = getEffectiveBillingStatus(s.enrollment, s.createdAt);
        if (paymentFilter === 'em_dia') matchesPayment = billing.status === 'pago';
        else if (paymentFilter === 'pendente') matchesPayment = billing.status === 'a_vencer';
        else if (paymentFilter === 'atrasado') matchesPayment = billing.status === 'vencido';
      }
    }

    return matchesSearch && matchesStatus && matchesPayment;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Users className="w-4 h-4" />
            <span>
              {canViewFinancialInfo ? '2.4 Cadastros / Alunos, Fotos & Contrato' : '2.4 Cadastros / Alunos & Matrículas'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            {canViewFinancialInfo ? 'Cadastro de Alunos & Emissão de Contratos' : 'Cadastro de Alunos & Grade'}
          </h2>
          <p className="text-xs text-zinc-500">
            {canViewFinancialInfo
              ? 'Ficha cadastral com endereço, e-mail, fotos anexadas e emissão de contrato padrão com 1 clique'
              : 'Ficha cadastral com endereço, e-mail, fotos anexadas e horários vinculados'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <UserPlus className="w-4 h-4 text-teal-400" />
          <span>Cadastrar Aluno & Matrícula</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, endereço, telefone, CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('ativo')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'ativo' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Ativos ({students.filter(s => s.status === 'ativo').length})
            </button>
            <button
              onClick={() => setStatusFilter('inativo')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'inativo' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Inativos ({students.filter(s => s.status === 'inativo').length})
            </button>
          </div>

          {/* Payment Status Filter */}
          {canViewFinancialInfo && (
            <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
              <button
                onClick={() => setPaymentFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  paymentFilter === 'all' ? 'bg-white text-zinc-900 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                Financeiro: Todos
              </button>
              <button
                onClick={() => setPaymentFilter('em_dia')}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  paymentFilter === 'em_dia' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                Pagos
              </button>
              <button
                onClick={() => setPaymentFilter('pendente')}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  paymentFilter === 'pendente' ? 'bg-white text-amber-800 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                A Vencer
              </button>
              <button
                onClick={() => setPaymentFilter('atrasado')}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  paymentFilter === 'atrasado' ? 'bg-white text-rose-800 shadow-2xs font-bold' : 'text-zinc-600'
                }`}
              >
                Em Atraso
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3">Foto / Aluno</th>
                <th className="px-4 py-3">Endereço & E-mail</th>
                <th className="px-4 py-3">Matrícula & Horário</th>
                <th className="px-4 py-3">Professor</th>
                {canViewFinancialInfo && (
                  <th className="px-4 py-3 text-center">Mensalidade</th>
                )}
                <th className="px-4 py-3 text-right">
                  {canViewFinancialInfo ? 'Contrato & Ações' : 'Ações'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={canViewFinancialInfo ? 6 : 5} className="px-4 py-8 text-center text-zinc-400 italic">
                    Nenhum aluno encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const billing = student.enrollment
                    ? getEffectiveBillingStatus(student.enrollment, student.createdAt)
                    : null;
                  const isOverdue = billing?.status === 'vencido';
                  const isUpcoming = billing?.status === 'a_vencer';

                  return (
                    <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                      
                      {/* Photo + Name + Phone */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {student.photoUrl ? (
                            <img
                              src={student.photoUrl}
                              alt={student.name}
                              className="w-9 h-9 rounded-full object-cover ring-2 ring-teal-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-xs shrink-0">
                              {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => onSelectStudentDetail(student)}
                                className="font-bold text-zinc-900 hover:text-teal-700 hover:underline block text-left"
                              >
                                {student.name}
                              </button>
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                student.status === 'ativo'
                                  ? 'bg-teal-50 text-teal-800 border border-teal-200/60'
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}>
                                {student.status === 'ativo' ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                              <span>{student.phone}</span>
                              <span>·</span>
                              <span>Nasc: {student.birthDate}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                student.consentImageUse 
                                  ? 'bg-teal-50 text-teal-700 border border-teal-200/60' 
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}>
                                <span>Redes:</span>
                                <strong>{student.consentImageUse ? 'Sim' : 'Não'}</strong>
                              </span>
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                student.consentMedicalCertificate 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                              }`}>
                                <span>Atestado:</span>
                                <strong>{student.consentMedicalCertificate ? 'Ciente' : 'Não'}</strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Address & Email */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="text-zinc-800 font-medium truncate flex items-center gap-1" title={student.address}>
                          <MapPin className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{student.address || 'Endereço não cadastrado'}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-zinc-400 shrink-0" />
                          <span className="truncate">{student.email || 'E-mail não cadastrado'}</span>
                        </div>
                      </td>

                      {/* Modality & Schedule */}
                      <td className="px-4 py-3.5 max-w-xs">
                        {student.enrollment ? (
                          <div>
                            <span className="font-semibold text-zinc-900 block truncate">
                              {student.enrollment.modalityName}
                            </span>
                            {hasDistinctSlotTimesOrInstructors(student.enrollment) ? (
                              <div className="flex flex-wrap gap-1 mt-0.5">
                                {getEnrollmentSlots(student.enrollment).map((sl) => (
                                  <span
                                    key={sl.day}
                                    className="inline-flex items-center px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono text-[10px]"
                                  >
                                    {sl.day.slice(0, 3)} {sl.time}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-zinc-500 block truncate">
                                {formatEnrollmentScheduleSummary(student.enrollment)}
                              </span>
                            )}
                            {student.enrollment.startDate && (
                              <span className="text-[10px] text-teal-700 font-mono block mt-0.5">
                                Início na agenda: {student.enrollment.startDate.split('-').reverse().join('/')}
                              </span>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              const defaultDays = ['Segunda', 'Quarta'];
                              const defaultInstId = instructors[0]?.id || '';
                              const info = getAvailableSlotsForEnrollment(operatingConfig, defaultInstId, defaultDays);
                              const defaultTime = info.slots[0] || '08:00';
                              setMatriculaModalStudent(student);
                              setSelectedModalityId(modalities[0]?.id || '');
                              setInstructorId(defaultInstId);
                              setSelectedDays(defaultDays);
                              setScheduleTime(defaultTime);
                              setScheduleSlots(
                                defaultDays.map(day => buildSlotForDay(day, defaultInstId, defaultTime))
                              );
                              setDueDayInput('10');
                              setStartDate(toLocalIsoDate(new Date()));
                            }}
                            className="text-xs text-teal-700 font-semibold hover:underline flex items-center gap-1"
                          >
                            <BookmarkCheck className="w-3.5 h-3.5" />
                            <span>+ Vincular Matrícula</span>
                          </button>
                        )}
                      </td>

                      {/* Instructor */}
                      <td className="px-4 py-3.5 text-zinc-800">
                        {student.enrollment ? (
                          <div>
                            <span className="font-medium block">
                              {formatEnrollmentInstructorsSummary(student.enrollment)}
                            </span>
                            {getEnrollmentInstructorShares(student.enrollment).length > 1 && (
                              <span className="text-[10px] text-teal-700 font-semibold block">
                                {canViewFinancialInfo ? 'Comissão dividida' : 'Professores alternados'}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">-</span>
                        )}
                      </td>

                      {/* Monthly Fee & Status */}
                      {canViewFinancialInfo && (
                        <td className="px-4 py-3.5 text-center">
                          {student.enrollment ? (
                            <div>
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                                isOverdue
                                  ? 'bg-rose-100 text-rose-800'
                                  : isUpcoming
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isOverdue
                                  ? 'Vencida'
                                  : isUpcoming
                                  ? `A Vencer (Dia ${student.enrollment.dueDay})`
                                  : 'Em Dia / Pago'}
                              </span>
                              <div className="text-[11px] font-mono text-zinc-600 mt-0.5">
                                R$ {student.enrollment.monthlyFee.toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-400 text-[11px] italic">Sem plano</span>
                          )}
                        </td>
                      )}

                      {/* Contract Button + Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* BOTÃO INATIVAR / REATIVAR ALUNO (Requested by user) */}
                          {student.status === 'ativo' ? (
                            <button
                              onClick={() => onToggleStudentStatus?.(student.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] transition-colors shadow-2xs"
                              title="Inativar aluno caso ele pare de fazer as aulas"
                            >
                              <UserX className="w-3.5 h-3.5 text-amber-700" />
                              <span>Inativar</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggleStudentStatus?.(student.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] transition-colors shadow-2xs"
                              title="Reativar aluno na plataforma"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                              <span>Reativar</span>
                            </button>
                          )}

                          {/* BOTÃO EMITIR CONTRATO (Requested by user) */}
                          {canViewFinancialInfo && (
                            <button
                              onClick={() => setStudentToContract(student)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-[11px] transition-colors border border-teal-200/60 shadow-2xs"
                              title="Emitir Contrato com base no modelo padrão"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-teal-700" />
                              <span>Contrato</span>
                            </button>
                          )}

                          {/* BOTÃO EDITAR ALUNO */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                            title="Editar Dados, Fotos e Matrícula"
                          >
                            <Edit3 className="w-4 h-4 text-zinc-700" />
                          </button>

                          <button
                            onClick={() => onSelectStudentDetail(student)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                            title="Ver Prontuário & Observações"
                          >
                            <FileText className="w-4 h-4 text-teal-700" />
                          </button>

                          {/* BOTÃO EXCLUIR CADASTRO */}
                          <button
                            onClick={() => onDeleteStudent(student.id)}
                            className="p-1.5 rounded-lg text-zinc-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Excluir cadastro permanentemente"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>

                          <a
                            href={`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                              canViewFinancialInfo && isOverdue
                                ? `Olá ${student.name.split(' ')[0]}! Aqui é do Studio Ana Paula Rodrigues. Passando para lembrar da sua mensalidade deste mês no valor de R$ ${student.enrollment?.monthlyFee.toFixed(2)}.`
                                : `Olá ${student.name.split(' ')[0]}! Tudo bem? Aqui é do Studio Ana Paula Rodrigues Pilates e Fisioterapia.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-1.5 rounded-lg transition-colors ${
                              canViewFinancialInfo && isOverdue
                                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                            }`}
                            title="Enviar WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </a>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Cadastrar Aluno com Endereço, E-mail, Fotos e Matrícula */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingStudent ? `Editar Aluno - ${editingStudent.name}` : 'Cadastrar Aluno & Inclusão de Matrícula'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {editingStudent 
                      ? 'Atualize dados pessoais, foto, consentimentos contratuais e matrícula' 
                      : 'Preencha os dados do aluno, anexe fotos e vincule o serviço'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto space-y-5 pr-1 flex-1">
              
              {/* Seção 1: Dados do Aluno */}
              <div className="space-y-3">
                <h4 className="font-bold text-zinc-900 pb-1 border-b border-zinc-100 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold">1</span>
                  <span>Dados Cadastrais & Foto</span>
                </h4>

                {/* BOTÃO PARA ANEXAR FOTOS (Requested by user) */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt="Foto do Aluno"
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-teal-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-zinc-200 text-zinc-500 flex flex-col items-center justify-center">
                        <Camera className="w-6 h-6 text-zinc-400" />
                        <span className="text-[9px] mt-0.5">Sem foto</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-center sm:text-left">
                    <label className="text-zinc-800 font-semibold block">
                      Foto de Perfil ou Avaliação Postural
                    </label>
                    <p className="text-[11px] text-zinc-500">
                      Anexe uma foto do aluno ou registro fotográfico postural (PNG ou JPG)
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                      <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{photoUrl ? 'Alterar Foto' : 'Anexar Foto'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="px-2.5 py-1.5 rounded-lg border border-zinc-300 text-zinc-600 hover:bg-zinc-100 text-xs"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Duarte Silveira"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Telefone / WhatsApp *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98123-4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">E-mail *</label>
                    <input
                      type="email"
                      required
                      placeholder="aluno@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="123.456.789-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Profissão</label>
                    <input
                      type="text"
                      placeholder="Ex: Arquiteta, Advogado, Aposentada..."
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">
                      Situação do Aluno na Plataforma *
                    </label>
                    <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setStatus('ativo')}
                        className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs flex items-center justify-center gap-1 transition-all ${
                          status === 'ativo'
                            ? 'bg-teal-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Ativo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('inativo')}
                        className={`flex-1 py-1.5 px-2 rounded-md font-semibold text-xs flex items-center justify-center gap-1 transition-all ${
                          status === 'inativo'
                            ? 'bg-amber-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                        title="Inativar caso o aluno pare de frequentar as aulas"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Inativo</span>
                      </button>
                    </div>
                  </div>

                  {/* ENDEREÇO (Requested by user) */}
                  <div className="sm:col-span-2">
                    <label className="text-zinc-700 font-semibold block mb-1">Endereço Completo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rua, número, complemento, bairro, cidade - SP, CEP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Contato de Emergência (Nome e Parentesco)</label>
                    <input
                      type="text"
                      placeholder="Ex: Carlos (Cônjuge)"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Telefone de Emergência</label>
                    <input
                      type="text"
                      placeholder="(11) 98888-7777"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    Caixa de Texto para Observações Clínicas & Patologias
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Queixa de dor lombar L5-S1, irradiação ciática, escoliose, gestante 20 semanas..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Seção 2: Inclusão da Matrícula */}
              <div className="space-y-3 pt-3 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold">2</span>
                    <span>Inclusão da Matrícula do Aluno</span>
                  </h4>
                  <label className="flex items-center gap-1.5 text-xs text-teal-800 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeEnrollment}
                      onChange={(e) => setIncludeEnrollment(e.target.checked)}
                      className="accent-teal-600 rounded"
                    />
                    <span>Ativar matrícula agora</span>
                  </label>
                </div>

                {includeEnrollment && (
                  <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-zinc-700 font-semibold block mb-1">
                          Tipo de Modalidade Cadastrada *
                        </label>
                        <select
                          value={selectedModalityId}
                          onChange={(e) => {
                            setSelectedModalityId(e.target.value);
                            const mod = modalities.find(m => m.id === e.target.value);
                            if (mod && mod.daysPerWeek > 0) setDaysPerWeek(mod.daysPerWeek);
                          }}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-teal-600"
                        >
                          {modalities.map((mod) => (
                            <option key={mod.id} value={mod.id}>
                              {mod.name}
                              {canViewFinancialInfo ? ` - R$ ${mod.price.toFixed(2)}` : ''}{' '}
                              {mod.billingType === 'pacote' ? `(Pacote: ${mod.packageClasses || 10} aulas)` : mod.billingType === 'reposicao' ? '(Reposição)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-700 font-semibold block mb-1">
                          Professor Padrão *
                        </label>
                        <select
                          value={instructorId}
                          onChange={(e) => handleDefaultInstructorChange(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 font-medium focus:outline-none focus:ring-1 focus:ring-teal-600"
                        >
                          {instructors.map((inst) => (
                            <option key={inst.id} value={inst.id}>
                              {inst.name} ({inst.councilNumber})
                              {canViewFinancialInfo ? ` - Com.: ${inst.commissionPercentage}%` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Dias na semana */}
                    <div>
                      <label className="text-zinc-700 font-semibold block mb-1">
                        Dias na Semana Escolhidos ({selectedDays.length} selecionados)
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {availableWeekDays.map((day) => {
                          const isSelected = selectedDays.includes(day);
                          const dayNum = DAY_NAME_TO_NUMBER[day];
                          const dayCfg = effectiveInstructorSchedule.find(d => d.dayOfWeek === dayNum);
                          const isDayOpen = dayCfg?.enabled ?? true;
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={!isDayOpen && !isSelected}
                              onClick={() => toggleDay(day)}
                              title={
                                isDayOpen && dayCfg
                                  ? `${day}: ${dayCfg.startTime} às ${dayCfg.endTime}`
                                  : `${day}: Fechado em 3. Agenda`
                              }
                              className={`py-1.5 text-center rounded-lg border font-medium text-[11px] transition-colors ${
                                isSelected
                                  ? 'bg-teal-700 text-white border-teal-700 font-bold'
                                  : !isDayOpen
                                  ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed line-through'
                                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                              }`}
                            >
                              {day.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                      {scheduleInfo.disabledSelectedDays.length > 0 && (
                        <p className="text-[10px] text-amber-700 font-medium mt-1">
                          Atenção: {scheduleInfo.disabledSelectedDays.join(', ')} está desabilitado(a) em 3. Agenda para o professor padrão.
                        </p>
                      )}
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinancialInfo ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-3`}>
                      <div>
                        <label className="text-zinc-700 font-semibold block mb-1">
                          Data de Início *
                        </label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                        />
                        <span className="text-[10px] text-teal-800 block mt-1 leading-tight">
                          Corte para entrada na 3. Agenda
                        </span>
                      </div>

                      <div>
                        <label className="text-zinc-700 font-semibold block mb-1">
                          Horário Padrão *
                        </label>
                        <select
                          value={scheduleTime}
                          onChange={(e) => handleDefaultTimeChange(e.target.value)}
                          disabled={scheduleInfo.slots.length === 0 && !scheduleTime}
                          className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                        >
                          {scheduleInfo.slots.length === 0 ? (
                            <option value={scheduleTime || ''}>
                              {scheduleTime ? `${scheduleTime} (sem grade ativa)` : 'Sem horários em 3. Agenda'}
                            </option>
                          ) : (
                            <>
                              {scheduleTime && !scheduleInfo.slots.includes(scheduleTime) && (
                                <option value={scheduleTime}>
                                  {scheduleTime} (fora da grade atual)
                                </option>
                              )}
                              {scheduleInfo.slots.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </>
                          )}
                        </select>
                        <span className="text-[10px] text-teal-800 block mt-1 leading-tight">
                          {scheduleInfo.isInstructorCustom ? 'Grade do professor: ' : 'Grade 3. Agenda: '}
                          {scheduleInfo.windowSummary}
                        </span>
                      </div>

                      {canViewFinancialInfo && (
                        <>
                          <div>
                            <label className="text-zinc-700 font-semibold block mb-1">
                              Dia de Vencimento *
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={31}
                              required
                              value={dueDayInput}
                              onChange={(e) => setDueDayInput(e.target.value)}
                              onBlur={() => {
                                const parsed = parseInt(dueDayInput, 10);
                                if (isNaN(parsed) || parsed < 1) setDueDayInput('1');
                                else if (parsed > 31) setDueDayInput('31');
                              }}
                              placeholder="Ex: 10"
                              className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-teal-600"
                            />
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              Edição manual livre (dia 1 a 31)
                            </span>
                          </div>

                          <div>
                            <label className="text-zinc-700 font-semibold block mb-1">
                              Status Financeiro Inicial
                            </label>
                            <select
                              value={paymentStatus}
                              onChange={(e) => setPaymentStatus(e.target.value as 'em_dia' | 'pendente' | 'atrasado')}
                              className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                            >
                              <option value="pendente">A Vencer / Aguardando Pagamento</option>
                              <option value="em_dia">Em Dia (Já Pago)</option>
                              <option value="atrasado">Em Atraso / Vencido</option>
                            </select>
                            {(() => {
                              const previewDueIso = getCycleDueDateIso(getParsedDueDay(), startDate);
                              const todayIso = toLocalIsoDate(new Date());
                              const dueFormatted = previewDueIso.split('-').reverse().join('/');
                              if (paymentStatus === 'em_dia') {
                                return (
                                  <span className="text-[10px] text-emerald-700 block mt-1 leading-tight">
                                    Mensalidade será marcada como <strong>Paga</strong>.
                                  </span>
                                );
                              }
                              if (todayIso > previewDueIso) {
                                return (
                                  <span className="text-[10px] text-rose-700 block mt-1 leading-tight">
                                    Venc. {dueFormatted} já passou de Hoje — entrará como <strong>Vencido</strong> em 4.2 Contas a Receber.
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] text-amber-800 block mt-1 leading-tight">
                                  Venc. {dueFormatted} (&ge; Hoje) — ficará como <strong>A Vencer</strong> em 4.2 Contas a Receber até passar a data.
                                </span>
                              );
                            })()}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Personalização por Dia: Horários e Professores distintos */}
                    {scheduleSlots.length > 0 && (
                      <div className="p-3 rounded-xl bg-white border border-teal-200/80 space-y-2.5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-zinc-100">
                          <div>
                            <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-teal-700" />
                              <span>Horário e Professor por Dia da Semana</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              Ajuste cada dia individualmente se o aluno fizer aulas em horários ou com professores diferentes
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleApplyDefaultToAllDays}
                            className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-[10px] shrink-0 self-start sm:self-center transition-colors"
                          >
                            Aplicar padrão a todos
                          </button>
                        </div>

                        <div className="space-y-2">
                          {scheduleSlots.map((slot) => {
                            const dayNum = DAY_NAME_TO_NUMBER[slot.day];
                            const slotInstSchedule = getEffectiveScheduleForInstructor(
                              operatingConfig,
                              slot.instructorId
                            );
                            const dayCfg = slotInstSchedule.find(d => d.dayOfWeek === dayNum);
                            const dayAvailableSlots =
                              dayNum !== undefined ? getSlotsForDay(slotInstSchedule, dayNum) : [];
                            const isClosedForSlotInst = dayCfg && !dayCfg.enabled;

                            return (
                              <div
                                key={slot.day}
                                className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center p-2 rounded-lg bg-zinc-50/80 border border-zinc-200/70"
                              >
                                <div className="sm:col-span-3 flex items-center justify-between sm:block">
                                  <span className="inline-block px-2 py-0.5 rounded bg-teal-100 text-teal-900 font-bold text-[11px]">
                                    {slot.day}
                                  </span>
                                  {isClosedForSlotInst ? (
                                    <span className="text-[10px] text-amber-700 font-medium block mt-0.5">
                                      Fechado para este prof.
                                    </span>
                                  ) : dayCfg ? (
                                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                                      {dayCfg.startTime}–{dayCfg.endTime}
                                    </span>
                                  ) : null}
                                </div>

                                <div className="sm:col-span-3">
                                  <label className="text-[10px] text-zinc-500 font-medium block mb-0.5">
                                    Horário
                                  </label>
                                  <select
                                    value={slot.time}
                                    onChange={(e) => handleSlotTimeChange(slot.day, e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-900 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-600"
                                  >
                                    {dayAvailableSlots.length === 0 ? (
                                      <option value={slot.time || '08:00'}>
                                        {slot.time || '08:00'}
                                      </option>
                                    ) : (
                                      <>
                                        {slot.time && !dayAvailableSlots.includes(slot.time) && (
                                          <option value={slot.time}>{slot.time}</option>
                                        )}
                                        {dayAvailableSlots.map((t) => (
                                          <option key={t} value={t}>{t}</option>
                                        ))}
                                      </>
                                    )}
                                  </select>
                                </div>

                                <div className="sm:col-span-6">
                                  <label className="text-[10px] text-zinc-500 font-medium block mb-0.5">
                                    Professor neste dia
                                  </label>
                                  <select
                                    value={slot.instructorId}
                                    onChange={(e) => handleSlotInstructorChange(slot.day, e.target.value)}
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-zinc-900 font-medium text-[11px] focus:outline-none focus:ring-1 focus:ring-teal-600"
                                  >
                                    {instructors.map((inst) => (
                                      <option key={inst.id} value={inst.id}>
                                        {inst.name}
                                        {canViewFinancialInfo ? ` (${inst.commissionPercentage}%)` : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {(() => {
                          const shares = getEnrollmentInstructorShares({ scheduleSlots } as Enrollment);
                          if (shares.length <= 1) return null;
                          const chosenMod = modalities.find(m => m.id === selectedModalityId);
                          const baseFee = chosenMod?.price || 380;
                          return (
                            <div className="p-2.5 rounded-lg bg-purple-50/80 border border-purple-200 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] font-bold text-purple-950">
                                <span>Rateio Automático entre Professores ({shares.length} vinculados)</span>
                                {canViewFinancialInfo && (
                                  <span className="font-mono text-purple-800">
                                    Base: R$ {baseFee.toFixed(2)}
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                {shares.map((sh) => {
                                  const instObj = instructors.find(i => i.id === sh.instructorId);
                                  const commPct = instObj?.commissionPercentage ?? 40;
                                  const propFee = Math.round(baseFee * sh.share * 100) / 100;
                                  const propComm = Math.round(((propFee * commPct) / 100) * 100) / 100;
                                  const daysDesc = sh.slots.map(s => `${s.day.slice(0, 3)} ${s.time}`).join(', ');
                                  return (
                                    <div
                                      key={sh.instructorId || sh.instructorName}
                                      className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-purple-900 bg-white/80 px-2 py-1 rounded border border-purple-200/70"
                                    >
                                      <span>
                                        <strong>{sh.instructorName}</strong> · {daysDesc} ({sh.slotCount}/{sh.totalSlots} aulas)
                                      </span>
                                      {canViewFinancialInfo && (
                                        <span className="font-mono font-bold text-purple-950">
                                          {Math.round(sh.share * 100)}% (R$ {propFee.toFixed(2)}) × {commPct}% = R$ {propComm.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Seção 3: Consentimentos & Termos Contratuais (Perguntas com Sim ou Não) */}
              <div className="space-y-3 pt-3 border-t border-zinc-200">
                <div>
                  <h4 className="font-bold text-zinc-900 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 text-[10px] flex items-center justify-center font-bold">3</span>
                    <span>Termos de Consentimento & Obrigações Contratuais</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Perguntas obrigatórias que constam no contrato padrão com as opções Sim ou Não
                  </p>
                </div>

                {/* Pergunta 1: Utilização de imagem em redes sociais */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <label className="text-zinc-900 font-bold block text-xs">
                        Autoriza a utilização da imagem em postagens nas redes sociais? *
                      </label>
                      <p className="text-[11px] text-zinc-500">
                        Divulgação de evolução postural, fotos ou vídeos de treinos no Instagram e redes do Studio
                      </p>
                    </div>

                    {/* Botões Sim / Não */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 shrink-0 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setConsentImageUse(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          consentImageUse
                            ? 'bg-teal-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SIM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsentImageUse(false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          !consentImageUse
                            ? 'bg-rose-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>NÃO</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] bg-white p-2 rounded-lg border border-zinc-100 font-mono text-zinc-600 flex items-center justify-between">
                    <span>No Contrato: {consentImageUse ? '[ X ] SIM   [   ] NÃO' : '[   ] SIM   [ X ] NÃO'}</span>
                    <span className="text-[10px] text-zinc-400">
                      {consentImageUse ? 'Autorizado expressamente' : 'Não autorizado (Imagem preservada)'}
                    </span>
                  </div>
                </div>

                {/* Pergunta 2: Atestado anual de aptidão física */}
                <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/80 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <label className="text-zinc-900 font-bold block text-xs">
                        Ciente de que deve apresentar anualmente atestado de aptidão física? *
                      </label>
                      <p className="text-[11px] text-zinc-500">
                        Obrigatoriedade médico-legal renovável a cada 12 meses para prática segura de Pilates e Fisioterapia
                      </p>
                    </div>

                    {/* Botões Sim / Não */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-zinc-200 shrink-0 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setConsentMedicalCertificate(true)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          consentMedicalCertificate
                            ? 'bg-teal-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>SIM</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setConsentMedicalCertificate(false)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                          !consentMedicalCertificate
                            ? 'bg-amber-600 text-white shadow-2xs font-bold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>NÃO</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-[10px] bg-white p-2 rounded-lg border border-zinc-100 font-mono text-zinc-600 flex items-center justify-between">
                    <span>No Contrato: {consentMedicalCertificate ? '[ X ] SIM   [   ] NÃO' : '[   ] SIM   [ X ] NÃO'}</span>
                    <span className="text-[10px] text-zinc-400">
                      {consentMedicalCertificate ? 'Ciente da apresentação anual' : 'Pendente de comprovação médica'}
                    </span>
                  </div>
                </div>

              </div>

              {/* Botões do Modal */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">
                  {canViewFinancialInfo
                    ? 'O contrato poderá ser emitido com 1 clique após salvar.'
                    : 'Os horários serão sincronizados com 3. Agenda após salvar.'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStudentOpen(false)}
                    className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                  >
                    {editingStudent ? 'Salvar Alterações' : 'Salvar Cadastro & Matrícula'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: Vincular Matrícula em Aluno Existente */}
      {matriculaModalStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 text-xs animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Vincular Matrícula para {matriculaModalStudent.name}
            </h3>
            <p className="text-zinc-500 mb-4">
              {canViewFinancialInfo
                ? 'Selecione a modalidade, dias, horários, professores e dia de vencimento'
                : 'Selecione a modalidade, dias, horários e professores'}
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">Modalidade</label>
                <select
                  value={selectedModalityId}
                  onChange={(e) => setSelectedModalityId(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900"
                >
                  {modalities.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                      {canViewFinancialInfo ? ` - R$ ${m.price.toFixed(2)}` : ''}{' '}
                      {m.billingType === 'pacote' ? `(Pacote: ${m.packageClasses || 10} aulas)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">Professor Padrão</label>
                <select
                  value={instructorId}
                  onChange={(e) => handleDefaultInstructorChange(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900"
                >
                  {instructors.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.councilNumber})
                      {canViewFinancialInfo ? ` - Com.: ${i.commissionPercentage}%` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Dias na Semana ({selectedDays.length} selecionados)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {availableWeekDays.map((day) => {
                    const isSelected = selectedDays.includes(day);
                    const dayNum = DAY_NAME_TO_NUMBER[day];
                    const dayCfg = effectiveInstructorSchedule.find(d => d.dayOfWeek === dayNum);
                    const isDayOpen = dayCfg?.enabled ?? true;
                    return (
                      <button
                        key={day}
                        type="button"
                        disabled={!isDayOpen && !isSelected}
                        onClick={() => toggleDay(day)}
                        className={`py-1.5 text-center rounded-lg border font-medium text-[11px] transition-colors ${
                          isSelected
                            ? 'bg-teal-700 text-white border-teal-700 font-bold'
                            : !isDayOpen
                            ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed line-through'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={`grid grid-cols-1 ${canViewFinancialInfo ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">Data de Início *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono"
                  />
                  <span className="text-[10px] text-teal-800 block mt-0.5 leading-tight">
                    Corte na agenda
                  </span>
                </div>
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">Horário Padrão</label>
                  <select
                    value={scheduleTime}
                    onChange={(e) => handleDefaultTimeChange(e.target.value)}
                    disabled={scheduleInfo.slots.length === 0}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono"
                  >
                    {scheduleInfo.slots.length === 0 ? (
                      <option value="">Sem horários ativos</option>
                    ) : (
                      scheduleInfo.slots.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))
                    )}
                  </select>
                  <span className="text-[10px] text-teal-800 block mt-0.5 leading-tight">
                    {scheduleInfo.windowSummary}
                  </span>
                </div>
                {canViewFinancialInfo && (
                  <div>
                    <label className="text-zinc-700 font-semibold block mb-1">Vencimento (1 a 31)</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={dueDayInput}
                      onChange={(e) => setDueDayInput(e.target.value)}
                      onBlur={() => {
                        const parsed = parseInt(dueDayInput, 10);
                        if (isNaN(parsed) || parsed < 1) setDueDayInput('1');
                        else if (parsed > 31) setDueDayInput('31');
                      }}
                      placeholder="Ex: 10"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {scheduleSlots.length > 0 && (
                <div className="p-3 rounded-xl bg-teal-50/40 border border-teal-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-900">
                      Horário e Professor por Dia
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyDefaultToAllDays}
                      className="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-700 font-semibold text-[10px] hover:bg-zinc-100"
                    >
                      Aplicar padrão a todos
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {scheduleSlots.map((slot) => {
                      const dayNum = DAY_NAME_TO_NUMBER[slot.day];
                      const slotInstSched = getEffectiveScheduleForInstructor(operatingConfig, slot.instructorId);
                      const dayAvailableSlots =
                        dayNum !== undefined ? getSlotsForDay(slotInstSched, dayNum) : [];
                      return (
                        <div key={slot.day} className="grid grid-cols-12 gap-2 items-center bg-white p-1.5 rounded-lg border border-zinc-200">
                          <span className="col-span-3 font-bold text-teal-900 text-[11px]">
                            {slot.day}
                          </span>
                          <select
                            value={slot.time}
                            onChange={(e) => handleSlotTimeChange(slot.day, e.target.value)}
                            className="col-span-3 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-1 font-mono text-[11px]"
                          >
                            {dayAvailableSlots.length === 0 ? (
                              <option value={slot.time || '08:00'}>{slot.time || '08:00'}</option>
                            ) : (
                              <>
                                {slot.time && !dayAvailableSlots.includes(slot.time) && (
                                  <option value={slot.time}>{slot.time}</option>
                                )}
                                {dayAvailableSlots.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </>
                            )}
                          </select>
                          <select
                            value={slot.instructorId}
                            onChange={(e) => handleSlotInstructorChange(slot.day, e.target.value)}
                            className="col-span-6 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-1 text-[11px] font-medium"
                          >
                            {instructors.map((inst) => (
                              <option key={inst.id} value={inst.id}>
                                {inst.name}
                                {canViewFinancialInfo ? ` (${inst.commissionPercentage}%)` : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                  {(() => {
                    const shares = getEnrollmentInstructorShares({ scheduleSlots } as Enrollment);
                    if (shares.length <= 1) return null;
                    const chosenMod = modalities.find(m => m.id === selectedModalityId);
                    const baseFee = chosenMod?.price || 380;
                    return (
                      <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-[10px] text-purple-900 space-y-1">
                        <strong className="block text-purple-950">
                          Comissão dividida automaticamente entre {shares.length} professores:
                        </strong>
                        {shares.map((sh) => {
                          const instObj = instructors.find(i => i.id === sh.instructorId);
                          const commPct = instObj?.commissionPercentage ?? 40;
                          const propFee = Math.round(baseFee * sh.share * 100) / 100;
                          const propComm = Math.round(((propFee * commPct) / 100) * 100) / 100;
                          return (
                            <div key={sh.instructorId || sh.instructorName} className="flex justify-between">
                              <span>{sh.instructorName} ({sh.slotCount}/{sh.totalSlots} aulas)</span>
                              {canViewFinancialInfo && (
                                <span className="font-mono font-bold">
                                  {Math.round(sh.share * 100)}% → R$ {propComm.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  onClick={() => setMatriculaModalStudent(null)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    const chosenMod = modalities.find(m => m.id === selectedModalityId);
                    const chosenInst = instructors.find(i => i.id === instructorId) || instructors[0];

                    const parsedDueDay = getParsedDueDay();
                    const effectiveStart = startDate || toLocalIsoDate(new Date());
                    const todayIso = toLocalIsoDate(new Date());
                    const dueDateIso = getCycleDueDateIso(parsedDueDay, effectiveStart);

                    const normalizedSlots: EnrollmentScheduleSlot[] = (scheduleSlots.length > 0
                      ? scheduleSlots
                      : (selectedDays.length > 0 ? selectedDays : ['Segunda', 'Quarta']).map(day =>
                          buildSlotForDay(day, chosenInst?.id || '', scheduleTime)
                        )
                    ).map(sl => {
                      const matchedInst = instructors.find(i => i.id === sl.instructorId);
                      return {
                        day: sl.day,
                        time: sl.time || scheduleTime || '08:00',
                        instructorId: matchedInst?.id || sl.instructorId || chosenInst?.id || '',
                        instructorName: matchedInst?.name || sl.instructorName || chosenInst?.name || 'A definir',
                      };
                    });
                    const primarySlot = normalizedSlots[0];
                    const combinedInstructorName = formatEnrollmentInstructorsSummary({
                      scheduleSlots: normalizedSlots,
                    } as Enrollment);

                    const updated: Student = {
                      ...matriculaModalStudent,
                      status: 'ativo',
                      enrollment: {
                        modalityId: chosenMod?.id || 'mod-1',
                        modalityName: chosenMod?.name || 'Pilates em Aparelhos',
                        daysPerWeek: chosenMod?.daysPerWeek || normalizedSlots.length || 2,
                        scheduleDays: normalizedSlots.map(s => s.day),
                        scheduleTime: primarySlot?.time || scheduleTime,
                        scheduleSlots: normalizedSlots,
                        instructorId: primarySlot?.instructorId || chosenInst?.id || '',
                        instructorName: combinedInstructorName,
                        monthlyFee: chosenMod?.price || 380,
                        dueDay: parsedDueDay,
                        paymentStatus: todayIso > dueDateIso ? 'atrasado' : 'pendente',
                        startDate: effectiveStart
                      }
                    };

                    onUpdateStudent(updated);
                    setMatriculaModalStudent(null);
                  }}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold"
                >
                  Concluir Matrícula
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EMISSÃO DE CONTRATO (Requested by user) */}
      {studentToContract && (
        <ContratoModal
          student={studentToContract}
          companyData={companyData}
          onClose={() => setStudentToContract(null)}
        />
      )}

    </div>
  );
};
