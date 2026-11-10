import React, { useState } from 'react';
import { X, Calendar, Clock, Dumbbell, UserCheck } from 'lucide-react';
import { ScheduledSession, Student, Instructor, Equipment, SessionType } from '../../types/pilates';

interface NewSessionModalProps {
  students: Student[];
  instructors: Instructor[];
  equipment: Equipment[];
  onClose: () => void;
  onAddSession: (session: ScheduledSession) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  students,
  instructors,
  equipment,
  onClose,
  onAddSession,
}) => {
  const [date, setDate] = useState('2026-11-08');
  const [time, setTime] = useState('09:00');
  const [instructorId, setInstructorId] = useState(instructors[0]?.id || '');
  const [equipmentId, setEquipmentId] = useState(equipment[0]?.id || '');
  const [sessionType, setSessionType] = useState<SessionType>('duo');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    students[0] ? [students[0].id] : []
  );
  const [notes, setNotes] = useState('');

  const maxStudents = sessionType === 'individual' ? 1 : sessionType === 'duo' ? 2 : 3;

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      if (selectedStudentIds.length < maxStudents) {
        setSelectedStudentIds([...selectedStudentIds, id]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;

    const chosenInstructor = instructors.find(i => i.id === instructorId) || instructors[0];
    const chosenEquipment = equipment.find(eq => eq.id === equipmentId) || equipment[0];

    const newSession: ScheduledSession = {
      id: `sess-${Date.now()}`,
      date,
      time,
      durationMinutes: 50,
      equipmentId: chosenEquipment.id,
      equipmentName: chosenEquipment.name,
      instructorId: chosenInstructor.id,
      instructorName: chosenInstructor.name,
      type: sessionType,
      studentIds: selectedStudentIds,
      status: 'scheduled',
      notes,
    };

    onAddSession(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Agendar Nova Sessão
              </h3>
              <p className="text-xs text-stone-500">
                Alocação de horário, instrutor e aparelhos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-600 font-medium block mb-1">Data da Aula</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              />
            </div>

            <div>
              <label className="text-stone-600 font-medium block mb-1">Horário (50 min)</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
              >
                {['07:00', '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-stone-600 font-medium block mb-1">Instrutor</label>
              <select
                value={instructorId}
                onChange={(e) => setInstructorId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {instructors.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-stone-600 font-medium block mb-1">Aparelho Base</label>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {equipment.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-stone-600 font-medium block mb-1">Modalidade da Sessão</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSessionType('individual');
                  if (selectedStudentIds.length > 1) setSelectedStudentIds([selectedStudentIds[0]]);
                }}
                className={`py-2 px-3 text-center rounded-lg border font-medium transition-colors ${
                  sessionType === 'individual'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                VIP (1 Aluno)
              </button>

              <button
                type="button"
                onClick={() => setSessionType('duo')}
                className={`py-2 px-3 text-center rounded-lg border font-medium transition-colors ${
                  sessionType === 'duo'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                Dupla (2 Alunos)
              </button>

              <button
                type="button"
                onClick={() => setSessionType('trio')}
                className={`py-2 px-3 text-center rounded-lg border font-medium transition-colors ${
                  sessionType === 'trio'
                    ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                }`}
              >
                Trio (3 Alunos)
              </button>
            </div>
          </div>

          {/* Student Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-stone-600 font-medium">
                Selecionar Alunos ({selectedStudentIds.length}/{maxStudents})
              </label>
              <span className="text-[11px] text-stone-400">Clique para selecionar</span>
            </div>

            <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 p-1 bg-stone-50/50">
              {students.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleStudent(student.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-100/70 text-emerald-950 font-semibold'
                        : 'hover:bg-white text-stone-700'
                    }`}
                  >
                    <div>
                      <span>{student.name}</span>
                      <span className="text-[10px] text-stone-500 block">
                        {student.planName} · {student.sessionsRemaining} aulas rest.
                      </span>
                    </div>
                    {isSelected && (
                      <UserCheck className="w-4 h-4 text-emerald-800" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-stone-600 font-medium block mb-1">
              Observações / Foco Clínico do Dia
            </label>
            <input
              type="text"
              placeholder="Ex: Treino de descompressão axial e mobilidade torácica"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Footer CTA */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={selectedStudentIds.length === 0}
              className="px-5 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg font-semibold transition-colors"
            >
              Confirmar Agendamento
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
