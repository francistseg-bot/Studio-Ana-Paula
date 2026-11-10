import React, { useState } from 'react';
import { 
  Users, 
  UserX, 
  Cake, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Phone,
  MessageSquare,
  Calendar,
  Layers,
  Heart,
  ChevronRight
} from 'lucide-react';
import { Student, MainNavigation } from '../types/studio';

interface DashboardOverviewProps {
  students: Student[];
  onNavigate: (tab: MainNavigation, filter?: { status?: 'ativo' | 'inativo'; paymentStatus?: 'em_dia' | 'atrasado' }) => void;
  onSelectStudentDetail: (student: Student) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  students,
  onNavigate,
  onSelectStudentDetail,
}) => {
  // Check birthdays today
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentDay = String(today.getDate()).padStart(2, '0');

  const birthdayStudents = students.filter((s) => {
    if (!s.birthDate) return false;
    const parts = s.birthDate.split('-');
    if (parts.length === 3) {
      return parts[1] === currentMonth && parts[2] === currentDay;
    }
    return false;
  });

  const activeStudents = students.filter(s => s.status === 'ativo');
  const inactiveStudents = students.filter(s => s.status === 'inativo');

  const upToDateStudents = students.filter(
    s => s.status === 'ativo' && s.enrollment && s.enrollment.paymentStatus === 'em_dia'
  );

  const overdueStudents = students.filter(
    s => s.status === 'ativo' && s.enrollment && s.enrollment.paymentStatus === 'atrasado'
  );

  const totalOverdueAmount = overdueStudents.reduce(
    (acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0
  );

  const totalUpToDateAmount = upToDateStudents.reduce(
    (acc, s) => acc + (s.enrollment?.monthlyFee || 0), 0
  );

  const [birthdayModalOpen, setBirthdayModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      
      {/* Studio Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-zinc-950 text-white p-6 sm:p-8 border border-zinc-800 shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-radial from-teal-500 to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
              alt="Logo Studio Ana Paula Rodrigues"
              className="w-16 h-16 rounded-2xl object-cover bg-white p-1 ring-2 ring-teal-500/40 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Studio Ana Paula Rodrigues</span>
                <span className="text-zinc-600">·</span>
                <span className="text-zinc-400">Pilates & Fisioterapia</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Painel Geral do Studio
              </h1>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                Fortalecimento, tratamento recuperatório, reabilitação física, pilates gestacional e terceira idade com acompanhamento especializado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('agenda')}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-teal-300 border border-zinc-700 font-semibold text-xs transition-colors shadow-sm flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>3. Acessar Agenda</span>
            </button>
            <button
              onClick={() => onNavigate('cadastros-alunos')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Gerenciar Alunos</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 INTERACTIVE BALLOONS (As Requested by User) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Balões Interativos de Acesso Rápido (Clique para abrir a raiz das informações)
          </h2>
          <span className="text-[11px] text-teal-700 font-medium">
            5 Indicadores Chave
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* Balão 1: Alunos Ativos */}
          <button
            onClick={() => onNavigate('cadastros-alunos', { status: 'ativo' })}
            className="group relative bg-white hover:bg-teal-50/40 p-4 rounded-2xl border border-zinc-200 hover:border-teal-500 shadow-2xs transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className="font-semibold text-zinc-700">Alunos Ativos</span>
                <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-900 tabular-nums">
                {activeStudents.length}
              </div>
              <p className="text-[11px] text-teal-700 font-medium mt-1">
                Matrículas em andamento
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 group-hover:text-teal-700 font-medium">
              <span>Ver lista completa</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Balão 2: Alunos Inativos */}
          <button
            onClick={() => onNavigate('cadastros-alunos', { status: 'inativo' })}
            className="group relative bg-white hover:bg-zinc-50 p-4 rounded-2xl border border-zinc-200 hover:border-zinc-400 shadow-2xs transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className="font-semibold text-zinc-700">Alunos Inativos</span>
                <div className="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserX className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-zinc-700 tabular-nums">
                {inactiveStudents.length}
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Pausas ou cancelados
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 group-hover:text-zinc-900 font-medium">
              <span>Ver inativos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Balão 3: Aniversariantes do Dia */}
          <button
            onClick={() => setBirthdayModalOpen(true)}
            className="group relative bg-gradient-to-br from-amber-50 to-orange-50/60 hover:from-amber-100/60 hover:to-orange-100/60 p-4 rounded-2xl border border-amber-200 hover:border-amber-400 shadow-2xs transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-amber-900 mb-2">
                <span className="font-semibold">Aniversariantes</span>
                <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Cake className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-amber-950 tabular-nums">
                {birthdayStudents.length}
              </div>
              <p className="text-[11px] text-amber-800 font-medium mt-1">
                {birthdayStudents.length > 0 ? 'Comemorando hoje!' : 'Nenhum hoje'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900 font-semibold">
              <span>Ver detalhes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Balão 4: Mensalidades em Dia */}
          <button
            onClick={() => onNavigate('cadastros-alunos', { paymentStatus: 'em_dia' })}
            className="group relative bg-white hover:bg-emerald-50/40 p-4 rounded-2xl border border-zinc-200 hover:border-emerald-500 shadow-2xs transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className="font-semibold text-zinc-700">Mensalidades em Dia</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-800 tabular-nums">
                {upToDateStudents.length}
              </div>
              <p className="text-[11px] text-emerald-700 font-mono font-medium mt-1">
                R$ {totalUpToDateAmount.toFixed(2)} em dia
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 group-hover:text-emerald-700 font-medium">
              <span>Ver alunos quitados</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Balão 5: Mensalidades em Atraso */}
          <button
            onClick={() => onNavigate('cadastros-alunos', { paymentStatus: 'atrasado' })}
            className="group relative bg-white hover:bg-rose-50/40 p-4 rounded-2xl border border-zinc-200 hover:border-rose-400 shadow-2xs transition-all text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                <span className="font-semibold text-rose-900">Em Atraso</span>
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-mono text-rose-700 tabular-nums">
                {overdueStudents.length}
              </div>
              <p className="text-[11px] text-rose-700 font-mono font-medium mt-1">
                R$ {totalOverdueAmount.toFixed(2)} pendente
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-rose-700 font-medium">
              <span>Cobrança / Detalhes</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

        </div>
      </div>

      {/* Overview Cards & Quick Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Alunos Recentes e Suas Matrículas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-2xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">
                Alunos com Matrícula Ativa no Studio
              </h3>
              <p className="text-xs text-zinc-500">
                Modalidade contratada, frequência semanal e professor responsável
              </p>
            </div>

            <button
              onClick={() => onNavigate('cadastros-alunos')}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Gerenciar todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {students.slice(0, 5).map((student) => {
              const isOverdue = student.enrollment?.paymentStatus === 'atrasado';

              return (
                <div
                  key={student.id}
                  className="p-3.5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectStudentDetail(student)}
                        className="font-bold text-zinc-900 hover:text-teal-700 hover:underline text-left text-sm"
                      >
                        {student.name}
                      </button>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        student.status === 'ativo' ? 'bg-teal-50 text-teal-800 border border-teal-200/60' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {student.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-500 flex flex-wrap items-center gap-2">
                      <span>Profissão: {student.profession || 'Não inf.'}</span>
                      <span>·</span>
                      <span>Tel: {student.phone}</span>
                    </div>

                    {student.enrollment && (
                      <div className="text-[11px] text-zinc-700 font-medium">
                        <strong>Modalidade:</strong> {student.enrollment.modalityName} ({student.enrollment.daysPerWeek}x/sem) · Prof. {student.enrollment.instructorName}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {student.enrollment ? (
                      <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg ${
                        isOverdue ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOverdue ? 'Atrasado' : 'Em Dia'} · R$ {student.enrollment.monthlyFee.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">
                        Sem matrícula ativa
                      </span>
                    )}

                    <button
                      onClick={() => onSelectStudentDetail(student)}
                      className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg transition-colors"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Quick Links & Modalidades Ativas */}
        <div className="space-y-5">
          
          {/* Card: Modalidades de Destaque */}
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-teal-700" />
                <span>Modalidades do Studio</span>
              </h3>
              <button
                onClick={() => onNavigate('cadastros-modalidades')}
                className="text-xs text-teal-700 hover:underline font-medium"
              >
                Configurar
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 block">Pilates Aparelhos 2x/sem</span>
                  <span className="text-[11px] text-zinc-500">Reformer, Cadillac, Chair</span>
                </div>
                <span className="font-mono font-bold text-teal-800">R$ 380,00</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 block">Pilates Aparelhos 3x/sem</span>
                  <span className="text-[11px] text-zinc-500">Fortalecimento intensivo</span>
                </div>
                <span className="font-mono font-bold text-teal-800">R$ 490,00</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 block">Pilates Gestacional 2x/sem</span>
                  <span className="text-[11px] text-zinc-500">Pélvico & Lombar</span>
                </div>
                <span className="font-mono font-bold text-teal-800">R$ 420,00</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-zinc-900 block">Fisioterapia Ortopédica</span>
                  <span className="text-[11px] text-zinc-500">Tratamento recuperatório</span>
                </div>
                <span className="font-mono font-bold text-teal-800">R$ 520,00</span>
              </div>
            </div>
          </div>

          {/* Card: Atalhos de Cadastros */}
          <div className="bg-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Acesso Rápido aos Cadastros
            </h4>
            
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => onNavigate('cadastros-alunos')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors text-left"
              >
                <span>+ Novo Cadastro de Aluno</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigate('cadastros-professores')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors text-left"
              >
                <span>+ Cadastrar Professor / Fisioterapeuta</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigate('cadastros-modalidades')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors text-left"
              >
                <span>+ Cadastrar Nova Modalidade</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>

              <button
                onClick={() => onNavigate('cadastros-usuarios')}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 transition-colors text-left"
              >
                <span>+ Permissões & Usuários de Acesso</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modal: Aniversariantes do Dia */}
      {birthdayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-zinc-100">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">
                  Aniversariantes do Dia
                </h3>
                <p className="text-xs text-zinc-500">
                  Data de hoje: {today.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              {birthdayStudents.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4 italic">
                  Nenhum aluno comemorando aniversário no dia de hoje.
                </p>
              ) : (
                birthdayStudents.map((bStudent) => (
                  <div key={bStudent.id} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-zinc-900">{bStudent.name}</h4>
                      <p className="text-[11px] text-zinc-500">
                        Nasc.: {bStudent.birthDate} · Tel: {bStudent.phone}
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/55${bStudent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${bStudent.name.split(' ')[0]}! O Studio Ana Paula Rodrigues te deseja um Feliz Aniversário! Muita saúde, energia e movimento no seu novo ciclo!`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Parabenizar</span>
                    </a>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex justify-end">
              <button
                onClick={() => setBirthdayModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
