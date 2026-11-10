import React from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Dumbbell, 
  Sparkles, 
  LayoutDashboard,
  Plus
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'schedule' | 'students' | 'financial' | 'equipment' | 'ai-prescriber';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewSession: () => void;
  onOpenNewStudent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewSession,
  onOpenNewStudent,
}) => {
  const currentDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand title, one line */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold text-base shadow-sm group-hover:bg-emerald-900 transition-colors">
                PC
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap block leading-tight">
                  PilatesCore
                </span>
                <span className="text-[11px] font-medium text-stone-500 whitespace-nowrap block">
                  Studio & Gestão Clínica
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation tabs with single-line labels */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </button>

            <button
              onClick={() => onSelectTab('schedule')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agenda & Aparelhos</span>
            </button>

            <button
              onClick={() => onSelectTab('students')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'students'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Alunos & Anamnese</span>
            </button>

            <button
              onClick={() => onSelectTab('financial')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'financial'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Financeiro & Planos</span>
            </button>

            <button
              onClick={() => onSelectTab('equipment')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === 'equipment'
                  ? 'bg-stone-100 text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Aparelhos & Molas</span>
            </button>

            <button
              onClick={() => onSelectTab('ai-prescriber')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'ai-prescriber'
                  ? 'bg-emerald-900 text-white'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Prescritor IA</span>
            </button>
          </nav>

          {/* Zone 3: Primary Action & Date */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden sm:inline-block text-xs font-medium text-stone-500 capitalize pr-2 border-r border-stone-200">
              {currentDate}
            </span>

            <button
              onClick={onOpenNewSession}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aula</span>
              <span className="sm:hidden">Agendar</span>
            </button>

            <button
              onClick={onOpenNewStudent}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Novo Aluno</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto gap-1 py-2 border-t border-stone-100 no-scrollbar">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => onSelectTab('schedule')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'schedule' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => onSelectTab('students')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'students' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Alunos & Anamnese
          </button>
          <button
            onClick={() => onSelectTab('financial')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'financial' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Financeiro
          </button>
          <button
            onClick={() => onSelectTab('equipment')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'equipment' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            Aparelhos
          </button>
          <button
            onClick={() => onSelectTab('ai-prescriber')}
            className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
              activeTab === 'ai-prescriber' ? 'bg-emerald-900 text-white' : 'text-emerald-800 bg-emerald-50'
            }`}
          >
            Prescritor IA
          </button>
        </div>
      </div>
    </header>
  );
};
