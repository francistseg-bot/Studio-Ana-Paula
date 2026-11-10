import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  DollarSign,
  Users
} from 'lucide-react';
import { 
  ClassStudentSlot, 
  AgendaClassSession, 
  Instructor, 
  Modality 
} from '../../types/studio';

interface RemarcarHorarioModalProps {
  slot: ClassStudentSlot;
  sourceSession: AgendaClassSession;
  sessions: AgendaClassSession[];
  instructors: Instructor[];
  modalities: Modality[];
  onConfirmReschedule: (
    sourceSessionId: string,
    slotId: string,
    targetDate: string,
    targetTime: string,
    targetInstructorId: string,
    additionalCommission: number
  ) => void;
  onClose: () => void;
}

export const RemarcarHorarioModal: React.FC<RemarcarHorarioModalProps> = ({
  slot,
  sourceSession,
  sessions,
  instructors,
  modalities,
  onConfirmReschedule,
  onClose,
}) => {
  // Tomorrow as default date for reschedule
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  const nextDateIso = nextDate.toISOString().split('T')[0];

  const [targetDate, setTargetDate] = useState<string>(nextDateIso);
  const [targetInstructorId, setTargetInstructorId] = useState<string>(sourceSession.instructorId);
  const [targetTime, setTargetTime] = useState<string>('09:00');

  // Find modality "reposicao" to get configured additional fee
  const reposicaoModality = modalities.find(m => m.billingType === 'reposicao');
  const configuredAdditionalFee = reposicaoModality?.additionalTeacherFee || 35.00;

  const isDifferentInstructor = targetInstructorId !== sourceSession.instructorId;
  const additionalCommission = isDifferentInstructor ? configuredAdditionalFee : 0;

  const selectedInstructor = instructors.find(i => i.id === targetInstructorId) || instructors[0];
  const originalInstructor = instructors.find(i => i.id === sourceSession.instructorId) || instructors[0];

  // Common Pilates time slots
  const TIME_SLOTS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Helper to get capacity of a slot on the target date
  const getSlotInfo = (time: string) => {
    const existing = sessions.find(
      s => s.date === targetDate && s.time === time && s.instructorId === targetInstructorId
    );
    const count = existing?.students.length || 0;
    const max = existing?.maxCapacity || 4;
    const isFull = count >= max;
    return { count, max, isFull, free: Math.max(0, max - count) };
  };

  const currentSlotInfo = getSlotInfo(targetTime);

  const handleConfirm = () => {
    if (currentSlotInfo.isFull) {
      alert('Este horário já atingiu a capacidade máxima de 4 alunos. Por favor, selecione outro horário.');
      return;
    }

    onConfirmReschedule(
      sourceSession.id,
      slot.id,
      targetDate,
      targetTime,
      targetInstructorId,
      additionalCommission
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-900">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Remarcar Horário de Reposição
              </h3>
              <p className="text-[11px] text-zinc-500">
                Aluno com falta pré-avisada tem direito a agendamento de reposição
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student & Origin Session Info Box */}
        <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-xs">
                {slot.studentName.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 text-xs">{slot.studentName}</h4>
                <span className="text-[11px] text-zinc-500">{slot.studentPhone}</span>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
              Falta c/ Aviso Prévio
            </span>
          </div>

          <div className="pt-2 border-t border-zinc-200/60 flex items-center justify-between text-[11px] text-zinc-600">
            <span>Aula original perdida:</span>
            <strong>{sourceSession.date} às {sourceSession.time} com {originalInstructor.name}</strong>
          </div>
        </div>

        {/* Form: Escolha do Novo Horário */}
        <div className="space-y-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Data da Reposição */}
            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Data da Reposição *
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-mono text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
            </div>

            {/* 2. Professor da Reposição */}
            <div>
              <label className="text-zinc-700 font-semibold block mb-1">
                Professor Escolhido *
              </label>
              <select
                value={targetInstructorId}
                onChange={(e) => setTargetInstructorId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
              >
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {inst.id === sourceSession.instructorId ? '(Mesmo Professor)' : '(Outro Professor)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Horários Disponíveis para a Data e Professor Selecionados */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-zinc-700 font-semibold block">
                Selecione o Horário Disponível (Até 4 alunos por turma) *
              </label>
              <span className="text-[11px] text-zinc-500">
                Capacidade: {currentSlotInfo.count} de {currentSlotInfo.max} alunos
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map((t) => {
                const info = getSlotInfo(t);
                const isSelected = targetTime === t;

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={info.isFull}
                    onClick={() => setTargetTime(t)}
                    className={`py-2 px-1 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                      info.isFull
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-800 hover:border-purple-300 hover:bg-purple-50/40'
                    }`}
                  >
                    <span className="font-mono text-xs">{t}</span>
                    <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-purple-200' : 'text-zinc-400'}`}>
                      {info.isFull ? 'Lotado' : `${info.free} vaga(s)`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Banner de Comissão Adicional quando for outro professor */}
          {isDifferentInstructor ? (
            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1.5 text-purple-950">
              <div className="flex items-center gap-2 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Aula de Reposição com Professor Substituto!</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                O aluno terá sua aula com <strong>{selectedInstructor.name}</strong> (diferente da professora original {originalInstructor.name}).
              </p>
              <div className="pt-1.5 border-t border-purple-200 flex items-center justify-between text-xs font-bold text-purple-900">
                <span>Adicional a Creditar na Comissão do Substituto:</span>
                <span className="font-mono text-sm font-extrabold text-purple-950">
                  + R$ {configuredAdditionalFee.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 text-teal-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-[11px]">
                Reposição com o mesmo professor da matrícula ({originalInstructor.name}). Não incide adicional de substituição.
              </span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            A nova aula entrará na grade imediatamente.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirmar Remarcação</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
