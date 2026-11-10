import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Search, 
  Check, 
  Clock, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { 
  Student, 
  AgendaClassSession, 
  ClassStudentSlot, 
  Instructor 
} from '../../types/studio';

interface AddStudentToSlotModalProps {
  session: AgendaClassSession;
  students: Student[];
  instructors: Instructor[];
  onAddStudentToSlot: (sessionId: string, newSlot: ClassStudentSlot) => void;
  onClose: () => void;
}

export const AddStudentToSlotModal: React.FC<AddStudentToSlotModalProps> = ({
  session,
  students,
  instructors,
  onAddStudentToSlot,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isReplacement, setIsReplacement] = useState(false);
  const [originalInstructorId, setOriginalInstructorId] = useState<string>(session.instructorId);
  const [notes, setNotes] = useState('');

  const activeStudents = students.filter(s => s.status === 'ativo');
  const filteredStudents = activeStudents.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  const selectedStudent = activeStudents.find(s => s.id === selectedStudentId);
  const isDifferentInstructor = isReplacement && originalInstructorId !== session.instructorId;
  const originalInstructor = instructors.find(i => i.id === originalInstructorId);

  const handleConfirm = () => {
    if (!selectedStudent) return;

    if (session.students.length >= session.maxCapacity) {
      alert('Este horário já atingiu a capacidade máxima de 4 alunos.');
      return;
    }

    const newSlot: ClassStudentSlot = {
      id: `slot-${Date.now()}`,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentPhone: selectedStudent.phone,
      studentPhoto: selectedStudent.photoUrl,
      attendanceStatus: 'agendado',
      isReplacement,
      originalInstructorId: isReplacement ? originalInstructorId : undefined,
      originalInstructorName: isReplacement ? originalInstructor?.name : undefined,
      additionalCommissionPaid: isDifferentInstructor ? 35.00 : 0,
      notes: notes || (isReplacement ? 'Aula avulsa de reposição.' : 'Agendamento confirmado.')
    };

    onAddStudentToSlot(session.id, newSlot);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Incluir Aluno no Horário
              </h3>
              <p className="text-[11px] text-zinc-500">
                {session.date} às {session.time} · Prof. {session.instructorName}
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

        {/* Capacity status pill */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
          <div className="flex items-center gap-1.5 text-zinc-700 font-semibold">
            <Users className="w-4 h-4 text-teal-600" />
            <span>Capacidade da Turma:</span>
          </div>
          <span className="font-mono font-bold text-zinc-900 bg-white px-2 py-0.5 rounded border border-zinc-200">
            {session.students.length} de {session.maxCapacity} vagas ocupadas ({session.maxCapacity - session.students.length} livre(s))
          </span>
        </div>

        {/* Search & Select Student */}
        <div className="space-y-2">
          <label className="text-zinc-700 font-semibold block">
            Selecione o Aluno *
          </label>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>

          <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white">
            {filteredStudents.length === 0 ? (
              <div className="p-3 text-center text-zinc-400 italic">
                Nenhum aluno ativo encontrado
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedStudentId === student.id;
                const isAlreadyInSession = session.students.some(s => s.studentId === student.id);

                return (
                  <button
                    key={student.id}
                    type="button"
                    disabled={isAlreadyInSession}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full p-2.5 text-left flex items-center justify-between transition-colors ${
                      isAlreadyInSession
                        ? 'bg-zinc-50 opacity-40 cursor-not-allowed'
                        : isSelected
                        ? 'bg-teal-50 text-teal-900 font-bold'
                        : 'hover:bg-zinc-50 text-zinc-800'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{student.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {student.phone} · {student.enrollment?.modalityName || 'Sem matrícula'}
                      </span>
                    </div>

                    {isAlreadyInSession ? (
                      <span className="text-[10px] text-zinc-400 font-medium">Já na turma</span>
                    ) : isSelected ? (
                      <Check className="w-4 h-4 text-teal-600" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Tipo de Inclusão: Regular vs Reposição */}
        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-800 text-xs">
            <input
              type="checkbox"
              checked={isReplacement}
              onChange={(e) => setIsReplacement(e.target.checked)}
              className="accent-purple-600 rounded w-4 h-4"
            />
            <span>Esta inclusão é uma Aula de Reposição?</span>
          </label>

          {isReplacement && (
            <div className="space-y-2 pt-1 border-t border-zinc-200/60">
              <label className="text-[11px] text-zinc-600 block">
                Professor original da matrícula do aluno:
              </label>
              <select
                value={originalInstructorId}
                onChange={(e) => setOriginalInstructorId(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 text-xs"
              >
                {instructors.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.name} {i.id === session.instructorId ? '(Mesmo professor desta aula)' : '(Outro professor)'}
                  </option>
                ))}
              </select>

              {isDifferentInstructor && (
                <div className="p-2 rounded-lg bg-purple-100 text-purple-900 text-[11px] font-medium flex items-center justify-between">
                  <span>Adicional para professor substituto:</span>
                  <strong>+ R$ 35,00 na comissão</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="text-zinc-700 font-semibold block mb-1">
            Observações para a Sessão (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Treino de fortalecimento de lombar, atenção ao joelho..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!selectedStudent}
            onClick={handleConfirm}
            className="px-5 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg font-semibold transition-colors shadow-2xs"
          >
            Incluir Aluno na Turma
          </button>
        </div>

      </div>
    </div>
  );
};
