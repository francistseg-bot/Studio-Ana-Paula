import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Filter
} from 'lucide-react';
import { 
  ScheduledSession, 
  Student, 
  Instructor, 
  Equipment 
} from '../types/pilates';

interface ScheduleViewProps {
  sessions: ScheduledSession[];
  students: Student[];
  instructors: Instructor[];
  equipment: Equipment[];
  onOpenNewSession: () => void;
  onSelectStudent: (studentId: string) => void;
  onUpdateSessionStatus: (sessionId: string, status: 'completed' | 'cancelled' | 'scheduled') => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  sessions,
  students,
  instructors,
  equipment,
  onOpenNewSession,
  onSelectStudent,
  onUpdateSessionStatus,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-11-08');
  const [instructorFilter, setInstructorFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  // Time slots typical for Pilates Studio
  const TIME_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Quick navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate('2026-11-08');
  };

  // Filtered sessions for the selected day
  const daySessions = sessions.filter((s) => {
    if (s.date !== selectedDate) return false;
    if (instructorFilter !== 'all' && s.instructorId !== instructorFilter) return false;
    if (equipmentFilter !== 'all' && s.equipmentId !== equipmentFilter) return false;
    return true;
  });

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(selectedDate + 'T12:00:00'));

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Filters */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Date Selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors"
            >
              Hoje
            </button>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="ml-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-700" />
              <span className="text-sm font-bold text-stone-900 capitalize">
                {formattedDate}
              </span>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Filter by Instructor */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
              >
                <option value="all">Todos os Instrutores</option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Equipment */}
            <select
              value={equipmentFilter}
              onChange={(e) => setEquipmentFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            >
              <option value="all">Todos os Aparelhos</option>
              {equipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name}
                </option>
              ))}
            </select>

            {/* Agendar Sessão CTA */}
            <button
              onClick={onOpenNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Sessão</span>
            </button>

          </div>

        </div>
      </div>

      {/* Hourly Schedule View */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900">
              Grade Horária do Studio ({daySessions.length} aulas agendadas)
            </h3>
            <p className="text-xs text-stone-500">
              Capacidade máxima recomendada: até 3 alunos por horário nos aparelhos
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Concluída
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Agendada
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Cancelada
            </span>
          </div>
        </div>

        <div className="divide-y divide-stone-100">
          {TIME_SLOTS.map((slot) => {
            const slotSessions = daySessions.filter(s => s.time === slot);

            return (
              <div 
                key={slot} 
                className={`flex flex-col sm:flex-row items-stretch min-h-[72px] transition-colors ${
                  slotSessions.length > 0 ? 'bg-white' : 'bg-stone-50/40 hover:bg-stone-50/80'
                }`}
              >
                {/* Time Indicator Column */}
                <div className="w-24 sm:w-28 p-3 sm:p-4 border-b sm:border-b-0 sm:border-r border-stone-100 flex items-center justify-between sm:justify-start gap-2 shrink-0 bg-stone-50/60">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-xs font-bold font-mono text-stone-800 tabular-nums">
                    {slot}
                  </span>
                </div>

                {/* Session Card(s) in this Slot */}
                <div className="flex-1 p-3 sm:p-4">
                  {slotSessions.length === 0 ? (
                    <div className="flex items-center justify-between h-full">
                      <span className="text-xs text-stone-400 italic">
                        Horário livre / Disponível para agendamento
                      </span>
                      <button
                        onClick={onOpenNewSession}
                        className="opacity-0 hover:opacity-100 focus:opacity-100 text-xs text-emerald-700 hover:underline transition-opacity"
                      >
                        + Reservar
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {slotSessions.map((session) => {
                        const sessionStudents = students.filter(s => session.studentIds.includes(s.id));
                        const isCompleted = session.status === 'completed';
                        const isCancelled = session.status === 'cancelled';

                        return (
                          <div
                            key={session.id}
                            className={`p-3.5 rounded-xl border transition-all ${
                              isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200/60'
                                : isCancelled
                                ? 'bg-rose-50/30 border-rose-200/60'
                                : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-stone-900">
                                    {session.equipmentName}
                                  </span>
                                  <span className="text-[11px] text-stone-400">·</span>
                                  <span className="text-[11px] font-medium text-stone-600">
                                    {session.type === 'individual' ? 'VIP 1:1' : session.type === 'duo' ? 'Dupla' : 'Trio'}
                                  </span>
                                </div>
                                <span className="text-[11px] text-stone-500 block">
                                  Instrutor: {session.instructorName}
                                </span>
                              </div>

                              {/* Status Tag */}
                              <div className="shrink-0">
                                {isCompleted && (
                                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                    Presença Confirmada
                                  </span>
                                )}
                                {isCancelled && (
                                  <span className="text-[10px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                                    Cancelada
                                  </span>
                                )}
                                {session.status === 'scheduled' && (
                                  <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                                    Agendada
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Students in Session */}
                            <div className="space-y-1.5 my-2">
                              {sessionStudents.map(student => (
                                <div key={student.id} className="flex items-center justify-between text-xs">
                                  <button
                                    onClick={() => onSelectStudent(student.id)}
                                    className="font-medium text-stone-800 hover:text-emerald-700 flex items-center gap-1.5 hover:underline"
                                  >
                                    <User className="w-3 h-3 text-stone-400" />
                                    <span>{student.name}</span>
                                  </button>
                                  <span className="text-[11px] text-stone-500 tabular-nums">
                                    {student.sessionsRemaining} aulas rest.
                                  </span>
                                </div>
                              ))}
                            </div>

                            {session.notes && (
                              <p className="text-[11px] text-stone-500 italic border-t border-stone-200/50 pt-1.5 mt-2">
                                Obs: {session.notes}
                              </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-1.5 pt-2 mt-2 border-t border-stone-200/60">
                              {session.status !== 'completed' && (
                                <button
                                  onClick={() => onUpdateSessionStatus(session.id, 'completed')}
                                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded transition-colors"
                                  title="Confirmar presença dos alunos"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Confirmar Presença</span>
                                </button>
                              )}

                              {session.status === 'scheduled' && (
                                <button
                                  onClick={() => onUpdateSessionStatus(session.id, 'cancelled')}
                                  className="flex items-center gap-1 text-[11px] font-medium text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                                  title="Registrar falta / cancelamento"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Desmarcar</span>
                                </button>
                              )}

                              {session.status === 'completed' && (
                                <button
                                  onClick={() => onUpdateSessionStatus(session.id, 'scheduled')}
                                  className="text-[11px] text-stone-500 hover:text-stone-800 underline"
                                >
                                  Desfazer
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
