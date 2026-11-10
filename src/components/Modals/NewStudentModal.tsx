import React, { useState } from 'react';
import { X, UserPlus, HeartPulse } from 'lucide-react';
import { Student, MembershipPlan } from '../../types/pilates';

interface NewStudentModalProps {
  plans: MembershipPlan[];
  onClose: () => void;
  onAddStudent: (newStudent: Student) => void;
}

export const NewStudentModal: React.FC<NewStudentModalProps> = ({
  plans,
  onClose,
  onAddStudent,
}) => {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyKinship, setEmergencyKinship] = useState('Cônjuge');

  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'plan-1');

  // Clinical anamnesis fields
  const [mainComplaints, setMainComplaints] = useState('');
  const [posturalDiagnosis, setPosturalDiagnosis] = useState('');
  const [evaPainScale, setEvaPainScale] = useState(0);
  const [restrictions, setRestrictions] = useState('');
  const [goals, setGoals] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenPlan = plans.find(p => p.id === selectedPlanId) || plans[0];
    const totalSessions = chosenPlan.frequencyPerWeek ? chosenPlan.frequencyPerWeek * 4 : 10;

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name,
      cpf: cpf || '000.000.000-00',
      phone: phone || '(11) 90000-0000',
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      birthDate,
      emergencyContact: {
        name: emergencyName || 'Familiar',
        phone: emergencyPhone || phone,
        kinship: emergencyKinship,
      },
      planId: chosenPlan.id,
      planName: chosenPlan.name,
      status: 'active',
      sessionsRemaining: totalSessions,
      totalSessions,
      planExpiry: '2026-12-08',
      startDate: new Date().toISOString().split('T')[0],
      assessment: {
        lastEvaluationDate: new Date().toISOString().split('T')[0],
        evaPainScale,
        mainComplaints: mainComplaints || 'Condicionamento físico geral e fortalecimento de core.',
        posturalDiagnosis: posturalDiagnosis || 'Alinhamento postural padrão sem desvios estruturais severos.',
        restrictions: restrictions ? restrictions.split(',').map(s => s.trim()) : ['Respeitar limites fisiológicos normais.'],
        goals: goals ? goals.split(',').map(s => s.trim()) : ['Fortalecimento do Powerhouse', 'Melhora da flexibilidade'],
        physicalActivityLevel: 'moderate',
        clinicalNotes: clinicalNotes || 'Avaliação inicial realizada no estúdio.',
      },
      evolutionNotes: [],
      attendanceCount: 0,
      consecutiveAbsences: 0,
    };

    onAddStudent(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-stone-900 text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Cadastrar Novo Aluno
              </h3>
              <p className="text-xs text-stone-500">
                Cadastro cadastral e ficha de anamnese postural inicial
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          {/* Dados Pessoais */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1.5">
              1. Dados Pessoais & Contato
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-stone-600 font-medium block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Miranda da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 99876-5432"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">CPF</label>
                <input
                  type="text"
                  placeholder="123.456.789-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="aluno@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Plano & Emergência */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-900 border-b border-stone-100 pb-1.5">
              2. Plano & Emergência
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-stone-600 font-medium block mb-1">Plano Inicial</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {p.monthlyPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">Contato de Emergência (Nome e Parentesco)</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos (Cônjuge) - (11) 98888-7777"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Anamnese Clínica */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-stone-900 font-bold border-b border-stone-100 pb-1.5">
              <HeartPulse className="w-4 h-4 text-emerald-700" />
              <span>3. Anamnese & Avaliação Postural</span>
            </div>

            <div>
              <label className="text-stone-600 font-medium block mb-1">
                Queixa Principal / Histórico de Patologias
              </label>
              <textarea
                placeholder="Ex: Dor lombar crônica L5-S1, irradiação ciática, pós-operatório joelho..."
                value={mainComplaints}
                onChange={(e) => setMainComplaints(e.target.value)}
                rows={2}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-stone-600 font-medium block mb-1">
                  Diagnóstico Postural
                </label>
                <input
                  type="text"
                  placeholder="Ex: Hiperlordose lombar, protusão de ombros"
                  value={posturalDiagnosis}
                  onChange={(e) => setPosturalDiagnosis(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="text-stone-600 font-medium block mb-1">
                  Nível de Dor Inicial (EVA 0 a 10): <strong>{evaPainScale}/10</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={evaPainScale}
                  onChange={(e) => setEvaPainScale(Number(e.target.value))}
                  className="w-full accent-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="text-stone-600 font-medium block mb-1">
                Restrições / Movimentos Contraindicados (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Evitar flexão lombar sob carga, evitar hiperextensão cervical"
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="text-stone-600 font-medium block mb-1">
                Objetivos do Aluno (separados por vírgula)
              </label>
              <input
                type="text"
                placeholder="Ex: Alívio da dor, fortalecimento do core, flexibilidade"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-2xs"
            >
              Salvar Cadastro
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
