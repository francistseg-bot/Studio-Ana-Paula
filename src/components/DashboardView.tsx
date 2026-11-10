import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Dumbbell, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  Student, 
  ScheduledSession, 
  Equipment, 
  FinancialTransaction 
} from '../types/pilates';
import { ActiveTab } from './Header';

interface DashboardViewProps {
  students: Student[];
  sessions: ScheduledSession[];
  equipment: Equipment[];
  transactions: FinancialTransaction[];
  onSelectTab: (tab: ActiveTab) => void;
  onSelectStudent: (studentId: string) => void;
  onOpenNewSession: () => void;
  onOpenNewStudent: () => void;
  onCheckInSession: (sessionId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  sessions,
  equipment,
  transactions,
  onSelectTab,
  onSelectStudent,
  onOpenNewSession,
  onOpenNewStudent,
  onCheckInSession,
}) => {
  // Calculated stats
  const activeStudents = students.filter(s => s.status === 'active');
  const totalStudents = students.length;

  const todayStr = '2026-11-08';
  const todaySessions = sessions.filter(s => s.date === todayStr);
  const completedToday = todaySessions.filter(s => s.status === 'completed').length;
  const occupancyPercentage = Math.round((todaySessions.length / 8) * 100);

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingPayments = transactions.filter(t => t.status === 'pending');

  // Students with 2+ absences needing follow-up
  const absentStudents = students.filter(s => s.consecutiveAbsences >= 2 || s.status === 'medical_leave');

  return (
    <div className="space-y-6">
      
      {/* Studio Header Banner with Generated Interior Image */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-900 text-white shadow-sm border border-stone-800">
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/pilates_studio_interior_1794164317691.jpg"
            alt="Interior do Studio de Pilates"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent" />
        </div>

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Studio em Funcionamento</span>
              <span aria-hidden="true">·</span>
              <span>São Paulo - SP</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Painel de Gestão do Studio
            </h1>
            <p className="text-sm text-stone-300 leading-relaxed">
              Bem-vinda, Dra. Camila Soares. Hoje você tem{' '}
              <strong className="text-white font-semibold tabular-nums">{todaySessions.length} sessões agendadas</strong>,{' '}
              com foco especial em reabilitação de coluna e gestantes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => onSelectTab('ai-prescriber')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Prescritor IA de Exercícios</span>
            </button>
            <button
              onClick={onOpenNewSession}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors backdrop-blur-sm border border-white/10"
            >
              <Calendar className="w-4 h-4" />
              <span>Ver Grade Completa</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (Tabular Numerals & Anti-Slop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Alunos Ativos */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Alunos Ativos</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {activeStudents.length}
            <span className="text-xs font-normal text-stone-500 ml-1.5">
              / {totalStudents} cadastrados
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span className="font-medium">+4 novos este mês</span>
          </div>
        </div>

        {/* Metric 2: Sessões de Hoje */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Sessões Hoje</span>
            <Calendar className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {completedToday}
            <span className="text-xs font-normal text-stone-500 ml-1.5">
              de {todaySessions.length} concluídas
            </span>
          </div>
          <div className="mt-3 text-xs text-stone-500">
            <span>Ocupação de salas: </span>
            <strong className="text-stone-800 font-semibold tabular-nums">{occupancyPercentage}%</strong>
          </div>
        </div>

        {/* Metric 3: Faturamento Realizado */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Receita no Mês</span>
            <DollarSign className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-3 text-xs text-amber-700">
            <span className="font-medium tabular-nums">{pendingPayments.length} mensalidades</span> a vencer
          </div>
        </div>

        {/* Metric 4: Aparelhos & Equipamentos */}
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
            <span className="font-medium">Aparelhos no Studio</span>
            <Dumbbell className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 tabular-nums">
            {equipment.length}
            <span className="text-xs font-normal text-emerald-700 ml-1.5 font-medium">
              100% operacionais
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Molas e travas inspecionadas</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Schedule on Left + Operational Alerts on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Session Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Grade de Horários de Hoje
              </h2>
              <p className="text-xs text-stone-500">
                Acompanhe as presenças e os alunos nos aparelhos Reformer, Cadillac e Chair
              </p>
            </div>
            <button
              onClick={() => onSelectTab('schedule')}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>Ver agenda semanal</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySessions.map((session) => {
              const sessionStudents = students.filter(s => session.studentIds.includes(s.id));
              const isCompleted = session.status === 'completed';

              return (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCompleted
                      ? 'bg-stone-50/70 border-stone-200/80 text-stone-600'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-lg bg-stone-100 text-stone-800 text-center shrink-0">
                        <Clock className="w-4 h-4 mx-auto mb-0.5 text-stone-600" />
                        <span className="text-xs font-bold font-mono tabular-nums block">
                          {session.time}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          {session.durationMinutes}min
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-stone-900">
                            {session.equipmentName}
                          </span>
                          <span className="text-[11px] text-stone-500">·</span>
                          <span className="text-xs text-stone-600">
                            {session.instructorName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {sessionStudents.map(student => (
                            <button
                              key={student.id}
                              onClick={() => onSelectStudent(student.id)}
                              className="text-xs font-medium text-stone-800 hover:text-emerald-700 hover:underline flex items-center gap-1.5 bg-stone-100 hover:bg-emerald-50 px-2 py-0.5 rounded-md transition-colors"
                            >
                              <span>{student.name}</span>
                              <span className="text-[10px] text-stone-500 font-normal">
                                ({student.assessment.evaPainScale > 0 ? `EVA: ${student.assessment.evaPainScale}/10` : 'Sem dor'})
                              </span>
                            </button>
                          ))}
                        </div>

                        {session.notes && (
                          <p className="text-xs text-stone-500 mt-1.5 italic">
                            Nota: {session.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Presença Confirmada</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => onCheckInSession(session.id)}
                          className="flex items-center gap-1 text-xs font-medium text-stone-800 bg-stone-100 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors border border-stone-200"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Dar Presença</span>
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Operational & Clinical Alerts */}
        <div className="space-y-6">
          
          {/* Box 1: Avisos Clínicos & Aderência */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Atenção & Retenção</span>
              </h3>
              <span className="text-xs text-stone-500 tabular-nums">
                {absentStudents.length} alunos
              </span>
            </div>

            <p className="text-xs text-stone-500 mb-3 leading-relaxed">
              Alunos com faltas consecutivas ou licença médica. Entre em contato para reagendamento de reposição:
            </p>

            <div className="space-y-2.5">
              {absentStudents.map(student => (
                <div key={student.id} className="p-3 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-stone-900">
                      {student.name}
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      {student.status === 'medical_leave' ? 'Licença Médica' : `${student.consecutiveAbsences} faltas consecutivas`}
                    </p>
                  </div>
                  
                  <a
                    href={`https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${student.name.split(' ')[0]}, tudo bem? Aqui é do PilatesCore Studio. Sentimos sua falta! Vamos agendar sua reposição desta semana?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors text-xs flex items-center gap-1 font-medium"
                    title="Enviar WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Box 2: Quick Studio Actions */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white mb-2">
              Atalhos de Gestão
            </h3>
            <p className="text-xs text-stone-400 mb-4">
              Agilize a rotina clínica e administrativa do seu studio:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => onSelectTab('ai-prescriber')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Prescrever Sessão com IA</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={onOpenNewStudent}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-stone-300" />
                  <span>Cadastrar Novo Aluno</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>

              <button
                onClick={() => onSelectTab('financial')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-white text-xs font-medium transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-stone-300" />
                  <span>Lançar Mensalidade / Pagamento</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
