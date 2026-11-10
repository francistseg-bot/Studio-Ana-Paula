import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  Activity, 
  UserPlus
} from 'lucide-react';
import { Student } from '../types/pilates';

interface StudentsViewProps {
  students: Student[];
  onSelectStudent: (studentId: string) => void;
  onOpenNewStudent: () => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onSelectStudent,
  onOpenNewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'medical_leave' | 'inactive'>('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.assessment.mainComplaints.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.planName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Search Controls */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">
              Gestão de Alunos & Fichas Clínicas
            </h2>
            <p className="text-xs text-stone-500">
              Prontuários com anamnese postural, histórico de dor (EVA), restrições motoras e evolução
            </p>
          </div>

          <button
            onClick={onOpenNewStudent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-2xs self-start md:self-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastrar Aluno</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, patologia (ex: hérnia, escoliose), plano..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Status Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Todos ({students.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'active'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ativos ({students.filter(s => s.status === 'active').length})
            </button>
            <button
              onClick={() => setStatusFilter('medical_leave')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'medical_leave'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Licença Médica ({students.filter(s => s.status === 'medical_leave').length})
            </button>
          </div>

        </div>
      </div>

      {/* Students Data Grid */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/75 border-b border-stone-200 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                <th className="px-4 py-3">Aluno / Contato</th>
                <th className="px-4 py-3">Plano & Frequência</th>
                <th className="px-4 py-3">Queixa Principal & Diagnóstico</th>
                <th className="px-4 py-3 text-center">Nível Dor (EVA)</th>
                <th className="px-4 py-3 text-center">Aulas Restantes</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-stone-400 italic">
                    Nenhum aluno encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const hasSeverePain = student.assessment.evaPainScale >= 5;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-stone-50/70 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => onSelectStudent(student.id)}
                          className="font-semibold text-stone-900 hover:text-emerald-700 text-left block hover:underline"
                        >
                          {student.name}
                        </button>
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <span>{student.phone}</span>
                          <span>·</span>
                          <span>Início {student.startDate}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-stone-800 block">
                          {student.planName}
                        </span>
                        <span className="text-[11px] text-stone-500">
                          Vence em {student.planExpiry}
                        </span>
                      </td>

                      {/* Complaint & Diagnosis */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-stone-800 font-medium truncate" title={student.assessment.mainComplaints}>
                          {student.assessment.mainComplaints}
                        </p>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5" title={student.assessment.posturalDiagnosis}>
                          {student.assessment.posturalDiagnosis}
                        </p>
                        {student.assessment.restrictions.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {student.assessment.restrictions[0]}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* EVA Pain Scale */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-block font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            hasSeverePain
                              ? 'bg-rose-100 text-rose-800'
                              : student.assessment.evaPainScale > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {student.assessment.evaPainScale}/10
                        </span>
                      </td>

                      {/* Sessions remaining */}
                      <td className="px-4 py-3.5 text-center font-mono tabular-nums">
                        <span className="font-semibold text-stone-800">
                          {student.sessionsRemaining}
                        </span>
                        <span className="text-stone-400 text-[11px]">
                          /{student.totalSessions}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectStudent(student.id)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                            title="Ver Prontuário & Avaliação"
                          >
                            <FileText className="w-4 h-4 text-emerald-800" />
                          </button>

                          <a
                            href={`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${student.name.split(' ')[0]}, tudo bem? Passando para confirmar suas próximas aulas no PilatesCore Studio.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-700 transition-colors"
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

    </div>
  );
};
