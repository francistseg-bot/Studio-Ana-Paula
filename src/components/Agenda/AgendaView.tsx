import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Settings, 
  Filter, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  UserPlus,
  Trash2,
  CalendarDays,
  CalendarRange
} from 'lucide-react';
import { 
  AgendaViewMode, 
  AgendaClassSession, 
  ClassStudentSlot, 
  Instructor, 
  Student, 
  Modality, 
  StudioOperatingConfig, 
  AttendanceStatus 
} from '../../types/studio';
import { AjusteHorariosModal } from './AjusteHorariosModal';
import { RemarcarHorarioModal } from './RemarcarHorarioModal';
import { AddStudentToSlotModal } from './AddStudentToSlotModal';

interface AgendaViewProps {
  sessions: AgendaClassSession[];
  instructors: Instructor[];
  students: Student[];
  modalities: Modality[];
  operatingConfig: StudioOperatingConfig;
  onUpdateSessions: (newSessions: AgendaClassSession[]) => void;
  onUpdateOperatingConfig: (newConfig: StudioOperatingConfig) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  sessions,
  instructors,
  students,
  modalities,
  operatingConfig,
  onUpdateSessions,
  onUpdateOperatingConfig,
  onSelectStudentDetail,
}) => {
  // Current view mode: 'dia', 'semana', 'mes' (Requested by Francis)
  const [viewMode, setViewMode] = useState<AgendaViewMode>('dia');

  // Selected date ISO (YYYY-MM-DD)
  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // Filter by instructor ('all' or specific instructorId) (Requested by Francis)
  const [instructorFilter, setInstructorFilter] = useState<string>('all');

  // Modals state
  const [isAjusteHorariosOpen, setIsAjusteHorariosOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState<{
    slot: ClassStudentSlot;
    session: AgendaClassSession;
  } | null>(null);
  const [addStudentSession, setAddStudentSession] = useState<AgendaClassSession | null>(null);
  const [absenceMenuSlotId, setAbsenceMenuSlotId] = useState<string | null>(null);

  // Time navigation helpers
  const handlePrev = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'dia') {
      d.setDate(d.getDate() - 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNext = () => {
    const d = new Date(selectedDate + 'T12:00:00');
    if (viewMode === 'dia') {
      d.setDate(d.getDate() + 1);
    } else if (viewMode === 'semana') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(todayIso);
  };

  // Date titles
  const formattedDayTitle = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(selectedDate + 'T12:00:00'));

  const formattedMonthTitle = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric'
  }).format(new Date(selectedDate + 'T12:00:00'));

  // Get start of the week (Monday) and end of the week (Saturday)
  const getWeekDates = (dateStr: string) => {
    const current = new Date(dateStr + 'T12:00:00');
    const day = current.getDay(); // 0 = Sun, 1 = Mon ...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(current);
    monday.setDate(current.getDate() + diffToMonday);

    const weekDays: { date: string; name: string; dayNum: number }[] = [];
    for (let i = 0; i < 6; i++) { // Mon to Sat
      const nextD = new Date(monday);
      nextD.setDate(monday.getDate() + i);
      const iso = nextD.toISOString().split('T')[0];
      const names = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      weekDays.push({
        date: iso,
        name: names[i],
        dayNum: nextD.getDate()
      });
    }
    return weekDays;
  };

  const weekDates = getWeekDates(selectedDate);

  // Time slots typical for Pilates Studio based on studioOperatingConfig
  const TIME_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Helper to get or create a session in state
  const getSessionFor = (date: string, time: string, instructorId: string): AgendaClassSession => {
    const existing = sessions.find(
      s => s.date === date && s.time === time && s.instructorId === instructorId
    );
    if (existing) return existing;

    const inst = instructors.find(i => i.id === instructorId) || instructors[0];
    return {
      id: `sess-${date}-${time.replace(':', '')}-${instructorId}`,
      date,
      time,
      instructorId,
      instructorName: inst.name,
      modalityName: 'Pilates em Aparelhos',
      maxCapacity: operatingConfig.defaultCapacity || 4,
      students: []
    };
  };

  // Presence and Absence flag handlers
  const handleUpdateAttendance = (
    sessionId: string,
    slotId: string,
    newStatus: AttendanceStatus,
    notes?: string
  ) => {
    const updated = sessions.map(sess => {
      if (sess.id === sessionId) {
        return {
          ...sess,
          students: sess.students.map(slot => {
            if (slot.id === slotId) {
              return {
                ...slot,
                attendanceStatus: newStatus,
                notes: notes || slot.notes
              };
            }
            return slot;
          })
        };
      }
      return sess;
    });

    onUpdateSessions(updated);
    setAbsenceMenuSlotId(null);
  };

  // Add student to session
  const handleAddStudentToSlot = (sessionId: string, newSlot: ClassStudentSlot) => {
    const sessionExists = sessions.some(s => s.id === sessionId);
    if (sessionExists) {
      onUpdateSessions(
        sessions.map(s => s.id === sessionId ? { ...s, students: [...s.students, newSlot] } : s)
      );
    } else {
      // Find time, date and instructor from sessionId or add directly
      const parts = sessionId.split('-'); // sess-YYYY-MM-DD-HHMM-inst-X
      const date = parts.slice(1, 4).join('-');
      const instId = parts.slice(5).join('-');
      const inst = instructors.find(i => i.id === instId) || instructors[0];

      const newSession: AgendaClassSession = {
        id: sessionId,
        date: date || selectedDate,
        time: '08:00',
        instructorId: inst.id,
        instructorName: inst.name,
        modalityName: 'Pilates em Aparelhos',
        maxCapacity: 4,
        students: [newSlot]
      };
      onUpdateSessions([...sessions, newSession]);
    }
  };

  // Remove student from slot
  const handleRemoveStudentFromSlot = (sessionId: string, slotId: string) => {
    if (!confirm('Deseja remover este aluno do horário?')) return;
    onUpdateSessions(
      sessions.map(s => s.id === sessionId ? { ...s, students: s.students.filter(slot => slot.id !== slotId) } : s)
    );
  };

  // Confirm Rescheduling (Remarcação de aula com aviso prévio)
  const handleConfirmReschedule = (
    sourceSessionId: string,
    slotId: string,
    targetDate: string,
    targetTime: string,
    targetInstructorId: string,
    additionalCommission: number
  ) => {
    // 1. Mark original slot as remarcado
    let studentToMove: ClassStudentSlot | null = null;
    const sourceSess = sessions.find(s => s.id === sourceSessionId);
    if (sourceSess) {
      const originalSlot = sourceSess.students.find(sl => sl.id === slotId);
      if (originalSlot) {
        studentToMove = originalSlot;
      }
    }

    if (!studentToMove) return;

    const targetInst = instructors.find(i => i.id === targetInstructorId) || instructors[0];
    const originalInst = instructors.find(i => i.id === sourceSess?.instructorId) || instructors[0];

    // Create the replacement slot for the target session
    const isDifferentTeacher = targetInstructorId !== sourceSess?.instructorId;
    const replacementSlot: ClassStudentSlot = {
      id: `slot-rep-${Date.now()}`,
      studentId: studentToMove.studentId,
      studentName: studentToMove.studentName,
      studentPhone: studentToMove.studentPhone,
      studentPhoto: studentToMove.studentPhoto,
      attendanceStatus: 'agendado',
      isReplacement: true,
      originalInstructorId: sourceSess?.instructorId,
      originalInstructorName: originalInst.name,
      additionalCommissionPaid: additionalCommission,
      notes: `Reposição de aula perdida em ${sourceSess?.date} às ${sourceSess?.time}. ${isDifferentTeacher ? `Professor substituto: + R$ ${additionalCommission.toFixed(2)}` : ''}`
    };

    // Update sessions state
    let targetSession = sessions.find(
      s => s.date === targetDate && s.time === targetTime && s.instructorId === targetInstructorId
    );

    let updatedSessions: AgendaClassSession[];

    if (targetSession) {
      updatedSessions = sessions.map(sess => {
        if (sess.id === sourceSessionId) {
          return {
            ...sess,
            students: sess.students.map(sl => sl.id === slotId ? {
              ...sl,
              attendanceStatus: 'remarcado',
              rescheduledToDate: targetDate,
              rescheduledToTime: targetTime,
              rescheduledToInstructorId: targetInstructorId,
              rescheduledToInstructorName: targetInst.name
            } : sl)
          };
        }
        if (sess.id === targetSession!.id) {
          return {
            ...sess,
            students: [...sess.students, replacementSlot]
          };
        }
        return sess;
      });
    } else {
      // Create target session if not existing yet
      const newTargetSession: AgendaClassSession = {
        id: `sess-${targetDate}-${targetTime.replace(':', '')}-${targetInstructorId}`,
        date: targetDate,
        time: targetTime,
        instructorId: targetInstructorId,
        instructorName: targetInst.name,
        modalityName: 'Pilates em Aparelhos',
        maxCapacity: 4,
        students: [replacementSlot]
      };

      updatedSessions = sessions.map(sess => {
        if (sess.id === sourceSessionId) {
          return {
            ...sess,
            students: sess.students.map(sl => sl.id === slotId ? {
              ...sl,
              attendanceStatus: 'remarcado',
              rescheduledToDate: targetDate,
              rescheduledToTime: targetTime,
              rescheduledToInstructorId: targetInstructorId,
              rescheduledToInstructorName: targetInst.name
            } : sl)
          };
        }
        return sess;
      });

      updatedSessions.push(newTargetSession);
    }

    onUpdateSessions(updatedSessions);
    alert(`Aula remarcada com sucesso para ${targetDate} às ${targetTime} com ${targetInst.name}!`);
  };

  // Active instructors for display
  const activeInstructors = instructors.filter(i => i.status === 'Ativo');
  const displayedInstructors = instructorFilter === 'all' 
    ? activeInstructors 
    : activeInstructors.filter(i => i.id === instructorFilter);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span>3. Agenda & Atendimentos</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Agenda do Studio Ana Paula Rodrigues
          </h2>
          <p className="text-xs text-zinc-500">
            Controle de presenças, faltas com/sem aviso prévio, reposições e turmas com até 4 alunos
          </p>
        </div>

        {/* Action Button: Ajuste de Horário de Atendimento (Requested by Francis) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAjusteHorariosOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-2xs"
            title="Ajustar horários de funcionamento do Studio e por professor"
          >
            <Clock className="w-4 h-4 text-teal-400" />
            <span>Ajustar Horário de Atendimento</span>
          </button>
        </div>
      </div>

      {/* Control Bar: View Types (Dia, Semana, Mês), Instructor Selector & Date Navigator */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* 1. SELETOR DE 3 TIPOS DE AGENDA (Dia, Semana, Mês - Requested by Francis) */}
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('dia')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'dia'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Por Dia</span>
          </button>

          <button
            onClick={() => setViewMode('semana')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'semana'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-teal-600" />
            <span>Por Semana</span>
          </button>

          <button
            onClick={() => setViewMode('mes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'mes'
                ? 'bg-white text-zinc-900 shadow-2xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5 text-teal-600" />
            <span>Por Mês</span>
          </button>
        </div>

        {/* 2. BOTÃO SELECIONÁVEL DE AGENDA POR PROFESSOR (Requested by Francis) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <User className="w-4 h-4 text-zinc-400" />
          <span className="font-semibold text-zinc-700 hidden sm:inline">Professor:</span>
          <select
            value={instructorFilter}
            onChange={(e) => setInstructorFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 font-bold text-zinc-800 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="all">Todos os Professores ({activeInstructors.length})</option>
            {activeInstructors.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} ({inst.councilNumber})
              </option>
            ))}
          </select>
        </div>

        {/* 3. DATE NAVIGATOR */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-2.5 py-1 font-semibold rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="font-bold text-zinc-900 capitalize text-xs sm:text-sm pl-1 truncate">
            {viewMode === 'mes' ? formattedMonthTitle : formattedDayTitle}
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* VISTA 1: AGENDA POR DIA (Timeline detalhada com até 4 alunos) */}
      {/* ============================================================== */}
      {viewMode === 'dia' && (
        <div className="space-y-4">
          
          {displayedInstructors.map((instructor) => {
            return (
              <div key={instructor.id} className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
                
                {/* Professor Header Banner */}
                <div className="bg-zinc-950 text-white p-3.5 sm:px-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold text-xs">
                      {instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-zinc-100">
                        {instructor.name}
                      </h3>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {instructor.councilNumber} · Comiss.: {instructor.commissionPercentage}%
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] bg-zinc-800 text-teal-400 font-semibold px-2.5 py-1 rounded-lg border border-zinc-700">
                    Máx. 4 alunos / horário
                  </span>
                </div>

                {/* Timeline Slots */}
                <div className="divide-y divide-zinc-100">
                  {TIME_SLOTS.map((time) => {
                    const session = getSessionFor(selectedDate, time, instructor.id);
                    const studentsInSlot = session.students;
                    const isFull = studentsInSlot.length >= (session.maxCapacity || 4);

                    return (
                      <div key={time} className="p-4 hover:bg-zinc-50/50 transition-colors">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          
                          {/* Time & Slot summary column */}
                          <div className="w-32 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-extrabold text-zinc-900">
                                {time}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isFull 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : studentsInSlot.length > 0 
                                  ? 'bg-teal-100 text-teal-900' 
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}>
                                {studentsInSlot.length}/4
                              </span>
                            </div>
                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                              {isFull ? 'Turma Completa' : `${4 - studentsInSlot.length} vaga(s) livre(s)`}
                            </span>
                          </div>

                          {/* 4 Apparatus Student Slots (Requested: Possibilitar a inclusão de até 4 alunos por horário) */}
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                            
                            {/* Render up to 4 cards */}
                            {[0, 1, 2, 3].map((slotIdx) => {
                              const slot = studentsInSlot[slotIdx];

                              if (slot) {
                                const isPresente = slot.attendanceStatus === 'presente';
                                const isFaltaComAviso = slot.attendanceStatus === 'falta_com_aviso';
                                const isFaltaSemAviso = slot.attendanceStatus === 'falta_sem_aviso';
                                const isRemarcado = slot.attendanceStatus === 'remarcado';

                                return (
                                  <div
                                    key={slot.id}
                                    className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                                      isPresente
                                        ? 'bg-emerald-50/70 border-emerald-300'
                                        : isFaltaComAviso
                                        ? 'bg-amber-50/70 border-amber-300'
                                        : isFaltaSemAviso
                                        ? 'bg-rose-50/70 border-rose-300'
                                        : isRemarcado
                                        ? 'bg-purple-50/60 border-purple-200'
                                        : 'bg-white border-zinc-200 shadow-2xs'
                                    }`}
                                  >
                                    <div>
                                      {/* Top Row: Apparatus label + Student Name */}
                                      <div className="flex items-start justify-between gap-1 mb-1">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                          Aparelho {slotIdx + 1}
                                        </span>

                                        <button
                                          onClick={() => handleRemoveStudentFromSlot(session.id, slot.id)}
                                          className="text-zinc-400 hover:text-rose-600 p-0.5"
                                          title="Remover do horário"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>

                                      <h4 className="font-bold text-zinc-900 text-xs truncate" title={slot.studentName}>
                                        {slot.studentName}
                                      </h4>

                                      <span className="text-[10px] text-zinc-500 font-mono block">
                                        {slot.studentPhone}
                                      </span>

                                      {/* Reposição Badge */}
                                      {slot.isReplacement && (
                                        <div className="mt-1.5 p-1 rounded bg-purple-100 text-purple-900 text-[9px] font-semibold border border-purple-200 flex items-center justify-between">
                                          <span>Aula de Reposição</span>
                                          {slot.additionalCommissionPaid && slot.additionalCommissionPaid > 0 ? (
                                            <span className="font-bold text-purple-800">+ R$ {slot.additionalCommissionPaid.toFixed(2)}</span>
                                          ) : null}
                                        </div>
                                      )}

                                      {/* Status message */}
                                      {slot.notes && (
                                        <p className="text-[10px] text-zinc-600 mt-1 line-clamp-1 italic" title={slot.notes}>
                                          {slot.notes}
                                        </p>
                                      )}
                                    </div>

                                    {/* Attendance Flag Controls (Requested by Francis) */}
                                    <div className="pt-2 mt-2 border-t border-zinc-200/60 space-y-1.5">
                                      
                                      <div className="flex items-center justify-between gap-1">
                                        
                                        {/* Flag Presente */}
                                        <button
                                          type="button"
                                          onClick={() => handleUpdateAttendance(session.id, slot.id, 'presente')}
                                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                                            isPresente
                                              ? 'bg-emerald-600 text-white shadow-2xs'
                                              : 'bg-zinc-100 text-zinc-700 hover:bg-emerald-100 hover:text-emerald-900'
                                          }`}
                                          title="Marcar Presença Confirmada"
                                        >
                                          <CheckCircle2 className="w-3 h-3" />
                                          <span>Presente</span>
                                        </button>

                                        {/* Flag Falta (Abre opções com ou sem aviso) */}
                                        <div className="relative flex-1">
                                          <button
                                            type="button"
                                            onClick={() => setAbsenceMenuSlotId(absenceMenuSlotId === slot.id ? null : slot.id)}
                                            className={`w-full py-1 px-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                                              isFaltaComAviso || isFaltaSemAviso
                                                ? 'bg-rose-600 text-white shadow-2xs'
                                                : 'bg-zinc-100 text-zinc-700 hover:bg-rose-100 hover:text-rose-900'
                                            }`}
                                            title="Registrar Falta / Ausência"
                                          >
                                            <XCircle className="w-3 h-3" />
                                            <span>Falta</span>
                                          </button>

                                          {/* Dropdown Com vs Sem Aviso */}
                                          {absenceMenuSlotId === slot.id && (
                                            <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-zinc-200 rounded-xl shadow-xl p-1.5 w-48 text-[11px] animate-in fade-in zoom-in-95">
                                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 block">
                                                Motivo da Ausência:
                                              </span>
                                              
                                              {/* COM AVISO PRÉVIO */}
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateAttendance(session.id, slot.id, 'falta_com_aviso', 'Aviso prévio confirmado.')}
                                                className="w-full text-left p-1.5 rounded-lg hover:bg-amber-50 text-amber-900 font-semibold flex items-center gap-1.5"
                                              >
                                                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                                <div>
                                                  <span>Com Aviso Prévio</span>
                                                  <span className="block text-[9px] text-amber-700 font-normal">Gera direito à reposição</span>
                                                </div>
                                              </button>

                                              {/* SEM AVISO PRÉVIO */}
                                              <button
                                                type="button"
                                                onClick={() => handleUpdateAttendance(session.id, slot.id, 'falta_sem_aviso', 'Não compareceu sem justificativa.')}
                                                className="w-full text-left p-1.5 rounded-lg hover:bg-rose-50 text-rose-900 font-semibold flex items-center gap-1.5 mt-1"
                                              >
                                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                                <div>
                                                  <span>Sem Aviso Prévio</span>
                                                  <span className="block text-[9px] text-rose-700 font-normal">Perde a aula conforme contrato</span>
                                                </div>
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                      </div>

                                      {/* BOTÃO REMARCAR HORÁRIO (Apenas se Falta COM Aviso Prévio - Requested by Francis) */}
                                      {isFaltaComAviso && (
                                        <button
                                          type="button"
                                          onClick={() => setRescheduleData({ slot, session })}
                                          className="w-full py-1.5 px-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                                          title="Abrir agenda para remarcar horário"
                                        >
                                          <CalendarIcon className="w-3 h-3" />
                                          <span>Remarcar Horário (Reposição)</span>
                                        </button>
                                      )}

                                      {/* Informação se já foi remarcado */}
                                      {isRemarcado && slot.rescheduledToDate && (
                                        <div className="p-1.5 rounded bg-purple-100 text-purple-950 text-[10px] font-medium leading-tight">
                                          Remarcado para: <strong>{slot.rescheduledToDate} às {slot.rescheduledToTime}</strong> ({slot.rescheduledToInstructorName})
                                        </div>
                                      )}

                                    </div>
                                  </div>
                                );
                              }

                              // Vaga Livre (< 4 alunos)
                              return (
                                <button
                                  key={slotIdx}
                                  type="button"
                                  onClick={() => setAddStudentSession(session)}
                                  className="p-3 rounded-xl border border-dashed border-zinc-300 hover:border-teal-500 hover:bg-teal-50/30 text-zinc-400 hover:text-teal-700 transition-all flex flex-col items-center justify-center min-h-[130px] group"
                                >
                                  <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-teal-100 flex items-center justify-center transition-colors mb-1.5">
                                    <Plus className="w-4 h-4 text-zinc-500 group-hover:text-teal-700" />
                                  </div>
                                  <span className="font-bold text-xs text-zinc-600 group-hover:text-teal-800">
                                    Vaga {slotIdx + 1} de 4
                                  </span>
                                  <span className="text-[10px] text-zinc-400 group-hover:text-teal-600">
                                    + Incluir Aluno
                                  </span>
                                </button>
                              );
                            })}

                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}

        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 2: AGENDA POR SEMANA (Grade Segunda a Sábado)           */}
      {/* ============================================================== */}
      {viewMode === 'semana' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-x-auto">
          <div className="min-w-[800px]">
            
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/80 text-xs">
              <div className="p-3 font-bold text-zinc-400 uppercase tracking-wider text-[11px] text-center border-r border-zinc-200">
                Horário
              </div>
              {weekDates.map((d) => (
                <div key={d.date} className="p-3 text-center border-r border-zinc-100 last:border-r-0">
                  <span className="font-bold text-zinc-900 block text-xs">
                    {d.name}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-bold mt-0.5 ${
                    d.date === todayIso ? 'bg-teal-600 text-white' : 'text-zinc-500'
                  }`}>
                    {d.dayNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="divide-y divide-zinc-100 text-xs">
              {TIME_SLOTS.map((time) => (
                <div key={time} className="grid grid-cols-7 min-h-[85px]">
                  
                  {/* Time label */}
                  <div className="p-3 font-mono font-bold text-zinc-700 flex items-center justify-center border-r border-zinc-200 bg-zinc-50/40">
                    {time}
                  </div>

                  {/* Day cells */}
                  {weekDates.map((d) => {
                    // Gather all sessions on that date and time matching instructorFilter
                    const matchingSessions = sessions.filter(s => {
                      if (s.date !== d.date || s.time !== time) return false;
                      if (instructorFilter !== 'all' && s.instructorId !== instructorFilter) return false;
                      return true;
                    });

                    const totalStudents = matchingSessions.reduce((acc, s) => acc + s.students.length, 0);

                    return (
                      <div
                        key={d.date}
                        onClick={() => {
                          setSelectedDate(d.date);
                          setViewMode('dia');
                        }}
                        className="p-2 border-r border-zinc-100 last:border-r-0 hover:bg-teal-50/20 cursor-pointer transition-colors flex flex-col justify-between"
                      >
                        {matchingSessions.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-zinc-300 hover:text-teal-600 text-[10px]">
                            + Vago
                          </div>
                        ) : (
                          matchingSessions.map(sess => (
                            <div key={sess.id} className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1 mb-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-zinc-800 truncate">
                                  {sess.instructorName.split(' ')[0]}
                                </span>
                                <span className={`px-1 rounded text-[9px] font-bold ${
                                  sess.students.length >= 4 ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                                }`}>
                                  {sess.students.length}/4
                                </span>
                              </div>

                              {/* Student name chips */}
                              <div className="space-y-0.5">
                                {sess.students.map(slot => (
                                  <div key={slot.id} className="text-[10px] text-zinc-600 truncate flex items-center gap-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      slot.attendanceStatus === 'presente' ? 'bg-emerald-500' :
                                      slot.attendanceStatus === 'falta_com_aviso' ? 'bg-amber-500' :
                                      slot.attendanceStatus === 'falta_sem_aviso' ? 'bg-rose-500' : 'bg-zinc-300'
                                    }`} />
                                    <span className="truncate">{slot.studentName.split(' ')[0]}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}

                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISTA 3: AGENDA POR MÊS (Calendário Mensal Completo)          */}
      {/* ============================================================== */}
      {viewMode === 'mes' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Month Day Grid (35-day grid) */}
          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 35 }).map((_, index) => {
              const currentMonthDate = new Date(selectedDate + 'T12:00:00');
              const firstDayOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
              const startDayOffset = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1; // 0=Mon
              
              const dayDate = new Date(firstDayOfMonth);
              dayDate.setDate(1 - startDayOffset + index);

              const iso = dayDate.toISOString().split('T')[0];
              const isCurrentMonth = dayDate.getMonth() === currentMonthDate.getMonth();
              const isToday = iso === todayIso;
              const isSelected = iso === selectedDate;

              // Sessions on this day
              const daySessions = sessions.filter(s => {
                if (s.date !== iso) return false;
                if (instructorFilter !== 'all' && s.instructorId !== instructorFilter) return false;
                return true;
              });

              const studentCount = daySessions.reduce((acc, s) => acc + s.students.length, 0);
              const presencas = daySessions.reduce(
                (acc, s) => acc + s.students.filter(sl => sl.attendanceStatus === 'presente').length, 0
              );
              const faltas = daySessions.reduce(
                (acc, s) => acc + s.students.filter(sl => sl.attendanceStatus.startsWith('falta')).length, 0
              );

              return (
                <div
                  key={iso}
                  onClick={() => {
                    setSelectedDate(iso);
                    setViewMode('dia');
                  }}
                  className={`min-h-[90px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 shadow-2xs'
                      : isCurrentMonth
                      ? 'bg-white border-zinc-200 hover:border-teal-300 hover:bg-zinc-50'
                      : 'bg-zinc-50/50 border-zinc-100 opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-xs font-bold ${
                      isToday ? 'w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[11px]' : 'text-zinc-800'
                    }`}>
                      {dayDate.getDate()}
                    </span>

                    {studentCount > 0 && (
                      <span className="text-[10px] font-bold font-mono text-teal-800 bg-teal-50 px-1 rounded">
                        {studentCount} al.
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {presencas > 0 && (
                      <div className="text-[10px] font-medium text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{presencas} presença(s)</span>
                      </div>
                    )}
                    {faltas > 0 && (
                      <div className="text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>{faltas} falta(s)</span>
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-zinc-400 block text-right">
                    Ver dia →
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS: Ajuste de Horários, Remarcação e Inclusão de Aluno       */}
      {/* ============================================================== */}
      
      {/* Modal 1: Ajuste de Horários de Atendimento (Studio e Professores) */}
      {isAjusteHorariosOpen && (
        <AjusteHorariosModal
          config={operatingConfig}
          instructors={activeInstructors}
          onSave={onUpdateOperatingConfig}
          onClose={() => setIsAjusteHorariosOpen(false)}
        />
      )}

      {/* Modal 2: Remarcar Horário (Para faltas com aviso prévio) */}
      {rescheduleData && (
        <RemarcarHorarioModal
          slot={rescheduleData.slot}
          sourceSession={rescheduleData.session}
          sessions={sessions}
          instructors={activeInstructors}
          modalities={modalities}
          onConfirmReschedule={handleConfirmReschedule}
          onClose={() => setRescheduleData(null)}
        />
      )}

      {/* Modal 3: Incluir Aluno no Horário Livre (< 4 alunos) */}
      {addStudentSession && (
        <AddStudentToSlotModal
          session={addStudentSession}
          students={students}
          instructors={activeInstructors}
          onAddStudentToSlot={handleAddStudentToSlot}
          onClose={() => setAddStudentSession(null)}
        />
      )}

    </div>
  );
};
