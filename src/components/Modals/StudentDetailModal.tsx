import React, { useState } from 'react';
import { 
  X, 
  User, 
  Activity, 
  AlertTriangle, 
  Target, 
  Calendar, 
  MessageSquare, 
  Plus, 
  Check, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Student, SessionEvolutionNote } from '../../types/pilates';

interface StudentDetailModalProps {
  student: Student;
  onClose: () => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onNavigateToPrescription: (studentName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  onClose,
  onUpdateStudent,
  onNavigateToPrescription,
}) => {
  const [activeTab, setActiveTab] = useState<'anamnese' | 'evolucoes' | 'plano'>('anamnese');

  // New evolution form state
  const [isAddingEvolution, setIsAddingEvolution] = useState(false);
  const [newEvoDate, setNewEvoDate] = useState('2026-11-08');
  const [newEvoInstructor, setNewEvoInstructor] = useState('Dra. Camila Soares');
  const [newEvoApparatus, setNewEvoApparatus] = useState('Reformer & Cadillac');
  const [newEvoExercises, setNewEvoExercises] = useState('');
  const [newEvoFeedback, setNewEvoFeedback] = useState('');
  const [newEvoPainLevel, setNewEvoPainLevel] = useState(student.assessment.evaPainScale);

  const handleSaveEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvoExercises.trim()) return;

    const newNote: SessionEvolutionNote = {
      id: `evo-${Date.now()}`,
      date: newEvoDate,
      instructorName: newEvoInstructor,
      apparatusUsed: newEvoApparatus.split(',').map(s => s.trim()),
      exercisesPerformed: newEvoExercises.split(',').map(s => s.trim()),
      studentFeedback: newEvoFeedback || 'Sessão bem tolerada sem queixas agudas.',
      painLevelAfter: newEvoPainLevel,
    };

    const updated: Student = {
      ...student,
      evolutionNotes: [newNote, ...student.evolutionNotes],
      assessment: {
        ...student.assessment,
        evaPainScale: newEvoPainLevel,
        lastEvaluationDate: newEvoDate,
      },
    };

    onUpdateStudent(updated);
    setIsAddingEvolution(false);
    setNewEvoExercises('');
    setNewEvoFeedback('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-start justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-lg">
              {student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">
                  {student.name}
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {student.status === 'active' ? 'Ativo' : student.status === 'medical_leave' ? 'Licença Médica' : 'Inativo'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                CPF: {student.cpf} · Tel: {student.phone} · Início: {student.startDate}
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

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 border-b border-stone-200 bg-white">
          <button
            onClick={() => setActiveTab('anamnese')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'anamnese'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Ficha de Anamnese & Postura
          </button>
          <button
            onClick={() => setActiveTab('evolucoes')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'evolucoes'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>Evolução Clínica</span>
            <span className="text-[10px] bg-stone-100 px-1.5 py-0.2 rounded-full font-mono">
              {student.evolutionNotes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('plano')}
            className={`py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'plano'
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Plano & Frequência
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {activeTab === 'anamnese' && (
            <div className="space-y-5">
              
              {/* EVA Pain Rating Strip */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                    Escala Visual Analógica de Dor (EVA)
                  </span>
                  <p className="text-stone-700 mt-0.5">
                    Intensidade relatada na última reavaliação ({student.assessment.lastEvaluationDate})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
                    {student.assessment.evaPainScale}
                  </span>
                  <span className="text-xs text-stone-400">/10</span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    student.assessment.evaPainScale >= 5 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {student.assessment.evaPainScale === 0 ? 'Sem Dor' : student.assessment.evaPainScale <= 3 ? 'Dor Leve' : student.assessment.evaPainScale <= 6 ? 'Dor Moderada' : 'Dor Severa'}
                  </span>
                </div>
              </div>

              {/* Main Complaints & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-900 font-semibold mb-1.5">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span>Queixa Principal & Histórico</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {student.assessment.mainComplaints}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-stone-200">
                  <div className="flex items-center gap-1.5 text-stone-900 font-semibold mb-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>Diagnóstico Postural & Biomecânico</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed">
                    {student.assessment.posturalDiagnosis}
                  </p>
                </div>
              </div>

              {/* Restrictions and Contraindications (High Clinical Importance) */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold mb-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Restrições e Cuidados no Repertório</span>
                </div>
                <ul className="space-y-1.5 text-amber-950">
                  {student.assessment.restrictions.map((res, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{res}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Therapeutic Goals */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                <div className="flex items-center gap-1.5 text-emerald-950 font-semibold mb-2">
                  <Target className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Objetivos do Tratamento & Condicionamento</span>
                </div>
                <ul className="space-y-1.5 text-emerald-950">
                  {student.assessment.goals.map((goal, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Clinical Notes */}
              <div className="p-4 rounded-xl border border-stone-200">
                <span className="font-semibold text-stone-900 block mb-1">
                  Observações do Fisioterapeuta / Instrutor
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {student.assessment.clinicalNotes}
                </p>
              </div>

              {/* Emergency Contact */}
              <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 flex items-center justify-between">
                <span>Contato de Emergência: <strong>{student.emergencyContact.name}</strong> ({student.emergencyContact.kinship})</span>
                <span className="font-mono">{student.emergencyContact.phone}</span>
              </div>

            </div>
          )}

          {activeTab === 'evolucoes' && (
            <div className="space-y-4">
              
              {/* Action to log new evolution note */}
              <div className="flex items-center justify-between pb-2">
                <span className="text-stone-600">
                  Registro diário pós-aula para acompanhamento da dor e respostas motoras.
                </span>
                <button
                  onClick={() => setIsAddingEvolution(!isAddingEvolution)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingEvolution ? 'Cancelar' : 'Nova Evolução'}</span>
                </button>
              </div>

              {/* Evolution Entry Form */}
              {isAddingEvolution && (
                <form onSubmit={handleSaveEvolution} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                  <h4 className="font-bold text-stone-900">Registrar Evolução de Aula</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium block mb-1">Data</label>
                      <input
                        type="date"
                        value={newEvoDate}
                        onChange={(e) => setNewEvoDate(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium block mb-1">Instrutor</label>
                      <input
                        type="text"
                        value={newEvoInstructor}
                        onChange={(e) => setNewEvoInstructor(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-stone-500 font-medium block mb-1">Dor Pós-Aula (EVA 0-10)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={newEvoPainLevel}
                        onChange={(e) => setNewEvoPainLevel(Number(e.target.value))}
                        className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">Aparelhos Utilizados</label>
                    <input
                      type="text"
                      placeholder="Ex: Reformer, Cadillac, Bola Suíça"
                      value={newEvoApparatus}
                      onChange={(e) => setNewEvoApparatus(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">Exercícios Realizados (separados por vírgula)</label>
                    <input
                      type="text"
                      placeholder="Ex: Footwork 3 molas, Bridging, Mermaid na torre"
                      value={newEvoExercises}
                      onChange={(e) => setNewEvoExercises(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 font-medium block mb-1">Feedback do Aluno & Comentários</label>
                    <textarea
                      placeholder="Relatou alívio lombar, mobilidade fluida sem dor..."
                      value={newEvoFeedback}
                      onChange={(e) => setNewEvoFeedback(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-stone-200 rounded-md p-1.5 text-xs text-stone-800"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingEvolution(false)}
                      className="px-3 py-1.5 text-stone-600 hover:bg-stone-200 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-medium rounded-md"
                    >
                      Salvar Evolução
                    </button>
                  </div>
                </form>
              )}

              {/* List of Previous Evolutions */}
              <div className="space-y-3">
                {student.evolutionNotes.length === 0 ? (
                  <p className="text-center py-6 text-stone-400 italic">
                    Nenhuma evolução registrada ainda. Registre a primeira aula do aluno.
                  </p>
                ) : (
                  student.evolutionNotes.map((note) => (
                    <div key={note.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-bold text-stone-900">{note.date}</span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-600">{note.instructorName}</span>
                        </div>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 text-stone-800">
                          EVA pós: {note.painLevelAfter}/10
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-stone-600 text-[11px]">
                        <strong>Aparelhos:</strong> {note.apparatusUsed.join(', ')}
                      </div>

                      <div className="text-stone-700 text-xs">
                        <strong>Repertório:</strong> {note.exercisesPerformed.join(' • ')}
                      </div>

                      {note.studentFeedback && (
                        <p className="text-[11px] text-stone-500 italic bg-white p-2 rounded border border-stone-100">
                          "{note.studentFeedback}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {activeTab === 'plano' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Plano Contratado</span>
                    <h4 className="text-base font-bold text-stone-900">{student.planName}</h4>
                  </div>
                  <span className="font-mono text-base font-bold text-stone-900">
                    {student.sessionsRemaining} aulas restantes
                  </span>
                </div>

                <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{
                      width: `${Math.round((student.sessionsRemaining / student.totalSessions) * 100)}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                  <span>Validade do ciclo: <strong>{student.planExpiry}</strong></span>
                  <span>Frequência total acumulada: <strong>{student.attendanceCount} presenças</strong></span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onNavigateToPrescription(student.name);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prescrever Aula com IA para {student.name.split(' ')[0]}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors"
          >
            Fechar Ficha
          </button>
        </div>

      </div>
    </div>
  );
};
