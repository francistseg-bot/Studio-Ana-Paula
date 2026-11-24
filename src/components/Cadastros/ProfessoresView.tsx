import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Percent, 
  DollarSign, 
  Users, 
  Phone, 
  Mail, 
  FileText,
  Sparkles,
  UserCheck,
  Edit3,
  Trash2,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { Instructor, Student, AgendaClassSession, Modality, MonthlyCommissionClosing, CommissionOverridesMap } from '../../types/studio';
import { FecharComissaoModal } from '../Financeiro/FecharComissaoModal';
import { calculateInstructorCommission } from '../../utils/commissionCalculator';

interface ProfessoresViewProps {
  instructors: Instructor[];
  students: Student[];
  agendaSessions?: AgendaClassSession[];
  modalities?: Modality[];
  commissionClosings?: MonthlyCommissionClosing[];
  commissionOverrides?: CommissionOverridesMap;
  isRestrictedInstructor?: boolean;
  canViewRevenue?: boolean;
  canManageClosings?: boolean;
  onSaveCommissionClosing?: (closing: MonthlyCommissionClosing) => void;
  onReopenCommissionClosing?: (closingId: string) => void;
  onAddInstructor: (instructor: Instructor) => void;
  onUpdateInstructor: (instructor: Instructor) => void;
  onDeleteInstructor: (instructorId: string) => void;
  onToggleStatus: (instructorId: string) => void;
}

export const ProfessoresView: React.FC<ProfessoresViewProps> = ({
  instructors,
  students,
  agendaSessions = [],
  modalities = [],
  commissionClosings = [],
  commissionOverrides = {},
  isRestrictedInstructor = false,
  canViewRevenue = true,
  canManageClosings = true,
  onSaveCommissionClosing,
  onReopenCommissionClosing,
  onAddInstructor,
  onUpdateInstructor,
  onDeleteInstructor,
  onToggleStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false);
  const [selectedInstructorForClosing, setSelectedInstructorForClosing] = useState<string>('');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [councilNumber, setCouncilNumber] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(40);
  const [specialties, setSpecialties] = useState('');

  const handleOpenAdd = () => {
    setEditingInstructor(null);
    setName('');
    setEmail('');
    setPhone('');
    setCouncilNumber('');
    setCommissionPercentage(40);
    setSpecialties('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (inst: Instructor) => {
    setEditingInstructor(inst);
    setName(inst.name);
    setEmail(inst.email);
    setPhone(inst.phone);
    setCouncilNumber(inst.councilNumber);
    setCommissionPercentage(inst.commissionPercentage);
    setSpecialties(inst.specialties ? inst.specialties.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !councilNumber.trim()) return;

    if (editingInstructor) {
      const updated: Instructor = {
        ...editingInstructor,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        councilNumber: councilNumber.trim(),
        commissionPercentage,
        specialties: specialties ? specialties.split(',').map(s => s.trim()) : ['Pilates em Aparelhos']
      };
      onUpdateInstructor(updated);
    } else {
      const newInst: Instructor = {
        id: `inst-${Date.now()}`,
        name: name.trim(),
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@studiopilates.com.br`,
        phone: phone || '(11) 98000-0000',
        councilNumber: councilNumber.trim(),
        commissionPercentage,
        status: 'Ativo',
        specialties: specialties ? specialties.split(',').map(s => s.trim()) : ['Pilates em Aparelhos']
      };
      onAddInstructor(newInst);
    }

    setIsModalOpen(false);
    setEditingInstructor(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>2.5 Cadastros / Corpo Clínico & Docente</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Professores & Instrutores do Studio
          </h2>
          <p className="text-xs text-zinc-500">
            {canViewRevenue
              ? 'Cadastro profissional, registro em conselho (CREFITO/CREF) e cálculo automatizado de comissões sobre as matrículas dos alunos'
              : 'Cadastro profissional, alunos vinculados na grade e estimativa de comissão do mês vigente'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManageClosings && (
            <button
              onClick={() => {
                setSelectedInstructorForClosing(instructors[0]?.id || '');
                setIsClosingModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs transition-colors shadow-2xs"
              title="Fechar comissão mensal e gerar relatório com alunos atendidos"
            >
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>Fechamento de Comissões</span>
            </button>
          )}

          {!isRestrictedInstructor && (
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-teal-400" />
              <span>Cadastrar Professor</span>
            </button>
          )}
        </div>
      </div>

      {/* Instructors & Commissions Calculation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {instructors.map((inst) => {
          const now = new Date();
          const currentMonth = now.getMonth() + 1;
          const currentYear = now.getFullYear();

          const assignedStudents = students.filter(
            s => s.status === 'ativo' && s.enrollment && s.enrollment.instructorId === inst.id
          );

          const commissionData = calculateInstructorCommission({
            instructor: inst,
            month: currentMonth,
            year: currentYear,
            students,
            agendaSessions,
            modalities,
            commissionClosings,
            commissionOverrides,
          });

          const totalEnrollmentRevenue = commissionData.revenueGenerated;
          const estimatedCommission = commissionData.totalMonthlyCommission + commissionData.totalSingleClassesCommission;
          const totalReplacementCommission = commissionData.totalReplacementCommission;
          const replacementSlotsCount = commissionData.rows.filter(r => r.type === 'reposicao').length;
          const totalFinalCommission = commissionData.totalFinalCommission;
          const isClosedThisMonth = commissionData.isClosed;

          return (
            <div
              key={inst.id}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xs p-5 flex flex-col justify-between hover:border-teal-500/80 transition-colors"
            >
              <div>
                {/* Top Info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-100/80 text-teal-900 flex items-center justify-center font-bold text-sm">
                      {inst.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">
                        {inst.name}
                      </h3>
                      <span className="text-[11px] font-mono text-zinc-500 block">
                        {inst.councilNumber}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    inst.status === 'Ativo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/50' : 'bg-zinc-100 text-zinc-500'
                  }`}>
                    {inst.status}
                  </span>
                </div>

                {/* Contacts */}
                <div className="text-xs text-zinc-600 space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="truncate">{inst.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{inst.phone}</span>
                  </div>
                </div>

                {/* Specialty Tags */}
                {inst.specialties && inst.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {inst.specialties.map((spec, idx) => (
                      <span key={idx} className="text-[10px] bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                {/* Commission Calculation Panel */}
                <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200/60 space-y-2 text-xs">
                  {canViewRevenue ? (
                    <>
                      <div className="flex items-center justify-between text-teal-950 font-bold border-b border-teal-200/60 pb-1.5">
                        <span className="flex items-center gap-1">
                          <Percent className="w-3.5 h-3.5 text-teal-700" />
                          <span>Comissão Matrículas:</span>
                        </span>
                        <span className="font-mono text-base font-extrabold text-teal-800">
                          {inst.commissionPercentage}%
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-700">
                        <span>Alunos vinculados:</span>
                        <strong className="font-mono font-bold text-zinc-900 tabular-nums">
                          {assignedStudents.length} alunos
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-700">
                        <span>Faturamento Matrículas:</span>
                        <strong className="font-mono tabular-nums text-zinc-900">
                          R$ {totalEnrollmentRevenue.toFixed(2)}
                        </strong>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-700">
                        <span>Comissão sobre Matrículas:</span>
                        <strong className="font-mono tabular-nums text-zinc-900">
                          R$ {estimatedCommission.toFixed(2)}
                        </strong>
                      </div>

                      {totalReplacementCommission > 0 && (
                        <div className="p-2 rounded-lg bg-purple-100/70 border border-purple-200 text-purple-950 flex items-center justify-between">
                          <div>
                            <span className="font-bold block text-[11px]">
                              + Reposições ({replacementSlotsCount} aula{replacementSlotsCount > 1 ? 's' : ''}):
                            </span>
                            <span className="text-[10px] text-purple-700">
                              Alunos de outro professor
                            </span>
                          </div>
                          <span className="font-mono font-extrabold text-purple-900">
                            + R$ {totalReplacementCommission.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between text-xs font-bold text-teal-950">
                        <span>Comissão Total Estimada:</span>
                        <span className="font-mono text-base font-extrabold text-teal-900 tabular-nums">
                          R$ {totalFinalCommission.toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-[11px] text-zinc-700">
                        <span>Alunos vinculados:</span>
                        <strong className="font-mono font-bold text-zinc-900 tabular-nums">
                          {assignedStudents.length} alunos
                        </strong>
                      </div>

                      <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between gap-2 text-xs font-bold text-teal-950">
                        <div>
                          <span className="block">Comissão Estimada do Mês:</span>
                          <span className="text-[10px] font-medium text-teal-700">
                            {isClosedThisMonth ? 'Competência fechada' : 'Prévia do mês vigente'}
                          </span>
                        </div>
                        <span className="font-mono text-base font-extrabold text-teal-900 tabular-nums">
                          R$ {totalFinalCommission.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Enrolled Students Quick List */}
                <div className="mt-3">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                    Alunos Atuais na Grade:
                  </span>
                  <div className="space-y-1">
                    {assignedStudents.length === 0 ? (
                      <span className="text-[11px] text-zinc-400 italic">
                        Nenhum aluno com matrícula vinculada ainda
                      </span>
                    ) : (
                      assignedStudents.map(s => {
                        const rowOverride = commissionData.rows.find(
                          r => r.type === 'mensalidade' && r.studentId === s.id
                        );
                        const commVal = rowOverride
                          ? rowOverride.commissionAmount
                          : ((s.enrollment?.monthlyFee || 0) * inst.commissionPercentage) / 100;
                        return (
                          <div key={s.id} className="text-[11px] text-zinc-700 flex justify-between items-center gap-2 bg-zinc-50 p-1.5 rounded">
                            <span className="font-medium truncate">{s.name}</span>
                            {canViewRevenue ? (
                              <span className="font-mono text-teal-800 font-bold shrink-0">
                                R$ {commVal.toFixed(2)} comissão
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500 truncate">
                                {s.enrollment?.modalityName || 'Matriculado'}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Fechamento Mensal de Comissão */}
                {canManageClosings && (
                  <div className="mt-4 pt-3 border-t border-zinc-100">
                    <button
                      onClick={() => {
                        setSelectedInstructorForClosing(inst.id);
                        setIsClosingModalOpen(true);
                      }}
                      className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs ${
                        isClosedThisMonth
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                          : 'bg-zinc-950 hover:bg-zinc-800 text-white'
                      }`}
                    >
                      {isClosedThisMonth ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Comissão Fechada (Ver Relatório)</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-teal-400" />
                          <span>Fechar Comissão Mensal</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </div>

              {/* Action buttons: Edit, Toggle, and Delete */}
              {!isRestrictedInstructor && (
                <div className="pt-3 mt-3 border-t border-zinc-100 flex items-center justify-between">
                  <button
                    onClick={() => onToggleStatus(inst.id)}
                    className="text-xs text-zinc-500 hover:text-zinc-900 font-medium"
                  >
                    {inst.status === 'Ativo' ? 'Pausar Atividades' : 'Reativar Professor'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(inst)}
                      className="p-1.5 rounded-lg text-zinc-600 hover:text-teal-700 hover:bg-teal-50 transition-colors"
                      title="Editar Professor e Comissão"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir o cadastro de ${inst.name}?`)) {
                          onDeleteInstructor(inst.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Excluir Professor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Modal: Cadastrar Professor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
                  {editingInstructor ? <Edit3 className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingInstructor ? `Editar Professor: ${editingInstructor.name}` : 'Cadastrar Professor / Instrutor'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Defina o registro no conselho e percentual da comissão
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Nome do Professor / Fisioterapeuta *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Ana Paula Rodrigues"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    Número do Conselho *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CREFITO-3 189420-F"
                    value={councilNumber}
                    onChange={(e) => setCouncilNumber(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    Comissão sobre Matrícula (%) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    placeholder="40"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="professor@studiopilates.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Especialidades (separadas por vírgula)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pilates Clínico, Coluna, Gestantes, Terceira Idade"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="pt-3 border-t border-zinc-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-semibold transition-colors shadow-2xs"
                >
                  {editingInstructor ? 'Salvar Alterações' : 'Salvar Professor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fechamento de Comissão Mensal & Emissão de Relatório */}
      {isClosingModalOpen && (
        <FecharComissaoModal
          isOpen={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          instructors={instructors}
          students={students}
          agendaSessions={agendaSessions}
          modalities={modalities}
          commissionClosings={commissionClosings}
          commissionOverrides={commissionOverrides}
          onSaveClosing={(closing) => {
            if (onSaveCommissionClosing) onSaveCommissionClosing(closing);
          }}
          onReopenClosing={(closingId) => {
            if (onReopenCommissionClosing) onReopenCommissionClosing(closingId);
          }}
          preselectedInstructorId={selectedInstructorForClosing}
        />
      )}

    </div>
  );
};
