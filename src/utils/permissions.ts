import { MainNavigation, UserAccount } from '../types/studio';

export interface PermissionDefinition {
  id: string;
  label: string;
  description: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  {
    id: 'Acesso Total',
    label: 'Acesso Total',
    description: 'Acesso irrestrito a todos os menus e configurações',
  },
  {
    id: 'Visualizar Visão Geral',
    label: '1. Visão Geral (Hub)',
    description: 'Painel inicial do Studio e aniversariantes',
  },
  {
    id: 'Configurar Studio',
    label: '2.1 Empresa & Contrato',
    description: 'Dados da empresa e modelo de contrato',
  },
  {
    id: 'Gerenciar Usuários',
    label: '2.2 Usuários',
    description: 'Cadastrar usuários e controlar permissões',
  },
  {
    id: 'Editar Modalidades',
    label: '2.3 Modalidades',
    description: 'Planos, valores e reajustes',
  },
  {
    id: 'Gerenciar Alunos',
    label: '2.4 Alunos',
    description: 'Cadastro de alunos, fichas e fotos',
  },
  {
    id: 'Registrar Matrículas',
    label: 'Matrículas & Contratos',
    description: 'Vincular matrículas e emitir contratos',
  },
  {
    id: 'Gerenciar Professores',
    label: '2.5 Professores',
    description: 'Cadastro de professores e comissões',
  },
  {
    id: 'Gerenciar Despesas',
    label: '2.6 Despesas & 4.1 Pagar',
    description: 'Categorias de despesas e contas a pagar',
  },
  {
    id: 'Agendar Horários',
    label: '3. Agenda',
    description: 'Agendamentos, presenças e remarcações',
  },
  {
    id: 'Registrar Evolução Clínica',
    label: 'Evolução Clínica',
    description: 'Registrar atendimentos e notas clínicas na agenda',
  },
  {
    id: 'Visualizar Financeiro',
    label: '4. Financeiro (Geral)',
    description: 'Contas a Pagar, Contas a Receber e DRE',
  },
  {
    id: 'Visualizar DRE',
    label: '4.3 DRE',
    description: 'Acesso específico ao demonstrativo DRE',
  },
  {
    id: 'Fechar Comissões',
    label: 'Fechar Comissões',
    description: 'Editar e homologar comissões no DRE',
  },
];

export const ALL_PERMISSION_IDS = AVAILABLE_PERMISSIONS.map((p) => p.id);

export function isMasterAdmin(user?: UserAccount | null): boolean {
  if (!user) return false;
  return user.email?.trim().toLowerCase() === 'admin@studioanapaula.com.br';
}

export function hasFullAccess(user?: UserAccount | null): boolean {
  if (!user || user.status !== 'Ativo') return false;
  if (isMasterAdmin(user)) return true;
  return (user.permissions || []).includes('Acesso Total');
}

export function hasAnyPermission(
  user: UserAccount | null | undefined,
  requiredPermissions: string[]
): boolean {
  if (!user || user.status !== 'Ativo') return false;
  if (hasFullAccess(user)) return true;
  const userPerms = user.permissions || [];
  return requiredPermissions.some((perm) => userPerms.includes(perm));
}

export function canAccessTab(
  user: UserAccount | null | undefined,
  tab: MainNavigation
): boolean {
  if (!user || user.status !== 'Ativo') return false;
  if (hasFullAccess(user)) return true;

  switch (tab) {
    case 'dashboard':
      return hasAnyPermission(user, ['Visualizar Visão Geral']);
    case 'cadastros-empresa':
      return hasAnyPermission(user, ['Configurar Studio']);
    case 'cadastros-usuarios':
      return hasAnyPermission(user, ['Gerenciar Usuários']);
    case 'cadastros-modalidades':
      return hasAnyPermission(user, ['Editar Modalidades', 'Gerenciar Modalidades']);
    case 'cadastros-alunos':
      return hasAnyPermission(user, ['Gerenciar Alunos', 'Registrar Matrículas']);
    case 'cadastros-professores':
      return hasAnyPermission(user, ['Gerenciar Professores']);
    case 'cadastros-despesas':
      return hasAnyPermission(user, ['Gerenciar Despesas']);
    case 'agenda':
      return hasAnyPermission(user, ['Agendar Horários', 'Registrar Evolução Clínica']);
    case 'financeiro-pagar':
      return hasAnyPermission(user, ['Visualizar Financeiro', 'Gerenciar Despesas']);
    case 'financeiro-receber':
      return hasAnyPermission(user, ['Visualizar Financeiro']);
    case 'financeiro-dre':
      return hasAnyPermission(user, ['Visualizar DRE', 'Visualizar Financeiro', 'Fechar Comissões']);
    default:
      return false;
  }
}

const ORDERED_TABS: MainNavigation[] = [
  'dashboard',
  'agenda',
  'cadastros-alunos',
  'financeiro-receber',
  'financeiro-pagar',
  'financeiro-dre',
  'cadastros-modalidades',
  'cadastros-professores',
  'cadastros-despesas',
  'cadastros-empresa',
  'cadastros-usuarios',
];

export function getDefaultTabForUser(user: UserAccount | null | undefined): MainNavigation | null {
  if (!user || user.status !== 'Ativo') return null;
  for (const tab of ORDERED_TABS) {
    if (canAccessTab(user, tab)) {
      return tab;
    }
  }
  return null;
}
