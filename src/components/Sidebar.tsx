import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderPlus, 
  Users, 
  Layers, 
  GraduationCap, 
  UserCheck, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Calendar,
  DollarSign,
  XCircle,
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { MainNavigation, UserAccount } from '../types/studio';

interface SidebarProps {
  currentTab: MainNavigation;
  onSelectTab: (tab: MainNavigation) => void;
  activeStudentsCount: number;
  inactiveStudentsCount: number;
  currentUser?: UserAccount | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeStudentsCount,
  inactiveStudentsCount,
  currentUser,
  onLogout,
}) => {
  const [isCadastrosOpen, setIsCadastrosOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCadastrosActive = currentTab.startsWith('cadastros-');

  const handleSelect = (tab: MainNavigation) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
            alt="Logo Studio Ana Paula Rodrigues"
            className="w-9 h-9 rounded-full object-cover bg-white p-0.5"
          />
          <div>
            <h1 className="text-xs font-bold text-teal-400 uppercase tracking-wide">
              Ana Paula Rodrigues
            </h1>
            <p className="text-[10px] text-zinc-400">
              Pilates & Fisioterapia
            </p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-zinc-900 text-zinc-200 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Desktop & Mobile Drawer Sidebar */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Top: Brand Logo & Title */}
        <div>
          <div className="p-5 border-b border-zinc-800/80 flex items-center gap-3 bg-zinc-950">
            <div className="relative shrink-0">
              <img
                src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
                alt="Logo Studio Ana Paula Rodrigues"
                className="w-12 h-12 rounded-full object-cover bg-white p-1 ring-2 ring-teal-500/30 shadow-md"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-500 border-2 border-zinc-950 rounded-full" />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                Ana Paula Rodrigues
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-semibold text-teal-400 tracking-wide uppercase">
                  Pilates & Fisioterapia
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                Gestão Clínica & Operacional
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-xs">
            
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Navegação Principal
            </div>

            {/* 1. Visão Geral (Dashboard) */}
            <button
              onClick={() => handleSelect('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                currentTab === 'dashboard'
                  ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className={`w-4 h-4 ${currentTab === 'dashboard' ? 'text-teal-400' : 'text-zinc-400'}`} />
                <span>1. Visão Geral</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono font-bold bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/40">
                Hub
              </span>
            </button>

            {/* 2. Cadastros (Parent Menu) */}
            <div className="pt-2">
              <button
                onClick={() => setIsCadastrosOpen(!isCadastrosOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  isCadastrosActive
                    ? 'text-white bg-zinc-900/80 font-semibold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FolderPlus className={`w-4 h-4 ${isCadastrosActive ? 'text-teal-400' : 'text-zinc-400'}`} />
                  <span>2. Cadastros</span>
                </div>
                {isCadastrosOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </button>

              {/* Cadastros Sub-items */}
              {isCadastrosOpen && (
                <div className="ml-4 pl-3 border-l border-zinc-800 space-y-1 mt-1.5 py-1">
                  
                  {/* 2.1 Empresa (NO TOPO, NOVO) */}
                  <button
                    onClick={() => handleSelect('cadastros-empresa')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-empresa'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span>2.1 Empresa & Contrato</span>
                    </div>
                  </button>

                  {/* 2.2 Usuários */}
                  <button
                    onClick={() => handleSelect('cadastros-usuarios')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-usuarios'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>2.2 Usuários</span>
                    </div>
                  </button>

                  {/* 2.3 Modalidades */}
                  <button
                    onClick={() => handleSelect('cadastros-modalidades')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-modalidades'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>2.3 Modalidades</span>
                    </div>
                  </button>

                  {/* 2.4 Alunos & Matrícula */}
                  <button
                    onClick={() => handleSelect('cadastros-alunos')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-alunos'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>2.4 Alunos</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 tabular-nums">
                      {activeStudentsCount}
                    </span>
                  </button>

                  {/* 2.5 Professor / Instrutor */}
                  <button
                    onClick={() => handleSelect('cadastros-professores')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-professores'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>2.5 Professores</span>
                    </div>
                  </button>

                  {/* 2.6 Despesas (Centros de Custo) */}
                  <button
                    onClick={() => handleSelect('cadastros-despesas')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      currentTab === 'cadastros-despesas'
                        ? 'bg-teal-500/20 text-teal-300 font-semibold border-l-2 border-teal-400'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>2.6 Despesas</span>
                    </div>
                  </button>

                </div>
              )}
            </div>

            {/* 3. Agenda */}
            <div className="pt-2">
              <button
                onClick={() => handleSelect('agenda')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'agenda'
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className={`w-4 h-4 ${currentTab === 'agenda' ? 'text-teal-400' : 'text-zinc-400'}`} />
                  <span>3. Agenda</span>
                </div>
              </button>
            </div>

            {/* 4. Financeiro (NOVO MENU 4) */}
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-4">
              Financeiro
            </div>
            <div className="space-y-1">
              <button
                onClick={() => handleSelect('financeiro-pagar')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'financeiro-pagar'
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <XCircle className={`w-4 h-4 ${currentTab === 'financeiro-pagar' ? 'text-teal-400' : 'text-zinc-400'}`} />
                  <span>4.1 Contas a Pagar</span>
                </div>
              </button>
              <button
                onClick={() => handleSelect('financeiro-receber')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'financeiro-receber'
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className={`w-4 h-4 ${currentTab === 'financeiro-receber' ? 'text-teal-400' : 'text-zinc-400'}`} />
                  <span>4.2 Contas a Receber</span>
                </div>
              </button>
              <button
                onClick={() => handleSelect('financeiro-dre')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  currentTab === 'financeiro-dre'
                    ? 'bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/30'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className={`w-4 h-4 ${currentTab === 'financeiro-dre' ? 'text-teal-400' : 'text-zinc-400'}`} />
                  <span>4.3 DRE</span>
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Profile / Studio Info */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/80">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-teal-900/60 border border-teal-700/50 flex items-center justify-center font-bold text-xs text-teal-300 shrink-0">
                {currentUser?.name 
                  ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'AP'}
              </div>
              <div className="text-left min-w-0 truncate">
                <span className="text-xs font-semibold text-zinc-200 block leading-tight truncate">
                  {currentUser?.name || 'Dra. Ana Paula'}
                </span>
                <span className="text-[10px] text-teal-400 block truncate">
                  {currentUser?.role || 'Administradora'}
                </span>
              </div>
            </div>
            
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sair do Sistema / Trocar de Usuário"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
