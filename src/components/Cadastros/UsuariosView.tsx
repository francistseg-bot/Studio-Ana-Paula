import React, { useState } from 'react';
import { 
  Shield, 
  Trash2, 
  Lock,
  UserPlus,
  Edit3,
  X,
  Calendar,
  Eye
} from 'lucide-react';
import { Instructor, UserAccount, UserRole } from '../../types/studio';
import {
  AVAILABLE_PERMISSIONS,
  ALL_PERMISSION_IDS,
  canViewMultipleAgendas,
  hasFullAccess,
  resolveUserInstructor,
} from '../../utils/permissions';

interface UsuariosViewProps {
  users: UserAccount[];
  instructors?: Instructor[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  users,
  instructors = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onToggleUserStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Recepcionista');
  const [linkedInstructorId, setLinkedInstructorId] = useState<string>('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Visualizar Visão Geral',
    'Gerenciar Alunos',
    'Registrar Matrículas',
    'Agendar Horários',
    'Visualizar Múltiplas Agendas',
  ]);

  const isMultiAgendaEnabled =
    selectedPermissions.includes('Acesso Total') ||
    selectedPermissions.includes('Visualizar Múltiplas Agendas');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Recepcionista');
    setLinkedInstructorId('');
    setSelectedPermissions([
      'Visualizar Visão Geral',
      'Gerenciar Alunos',
      'Registrar Matrículas',
      'Agendar Horários',
      'Visualizar Múltiplas Agendas',
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // deixa vazio se não for alterar
    setRole(user.role);
    setLinkedInstructorId(user.instructorId || '');
    const normalizedPerms = (user.permissions || []).map((p) =>
      p === 'Gerenciar Modalidades' ? 'Editar Modalidades' : p
    );
    // Para perfis não-instrutores legados sem vínculo e sem a flag explícita, preserva visão múltipla no editor até que seja alterada
    const shouldPrefillMulti =
      !normalizedPerms.includes('Visualizar Múltiplas Agendas') &&
      !normalizedPerms.includes('Restringir à Própria Agenda') &&
      user.role !== 'Fisioterapeuta / Instrutor' &&
      !user.instructorId;

    const finalPerms = shouldPrefillMulti
      ? [...normalizedPerms, 'Visualizar Múltiplas Agendas']
      : normalizedPerms;

    setSelectedPermissions(Array.from(new Set(finalPerms)));
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    if (permId === 'Acesso Total') {
      if (selectedPermissions.includes('Acesso Total')) {
        setSelectedPermissions([]);
      } else {
        setSelectedPermissions([...ALL_PERMISSION_IDS]);
      }
      return;
    }

    if (selectedPermissions.includes(permId)) {
      const next = selectedPermissions.filter(
        (p) => p !== permId && p !== 'Acesso Total'
      );
      if (permId === 'Visualizar Múltiplas Agendas' && role !== 'Fisioterapeuta / Instrutor' && !linkedInstructorId) {
        if (!next.includes('Restringir à Própria Agenda')) {
          next.push('Restringir à Própria Agenda');
        }
      }
      setSelectedPermissions(next);
    } else {
      const next = selectedPermissions.filter((p) => p !== 'Restringir à Própria Agenda');
      setSelectedPermissions([...next, permId]);
    }
  };

  const setAgendaScope = (allowMultiple: boolean) => {
    if (allowMultiple) {
      setSelectedPermissions((prev) => {
        const cleaned = prev.filter((p) => p !== 'Restringir à Própria Agenda');
        return cleaned.includes('Visualizar Múltiplas Agendas')
          ? cleaned
          : [...cleaned, 'Visualizar Múltiplas Agendas'];
      });
    } else {
      setSelectedPermissions((prev) => {
        const cleaned = prev.filter(
          (p) => p !== 'Visualizar Múltiplas Agendas' && p !== 'Acesso Total'
        );
        if (role !== 'Fisioterapeuta / Instrutor' && !linkedInstructorId) {
          return cleaned.includes('Restringir à Própria Agenda')
            ? cleaned
            : [...cleaned, 'Restringir à Própria Agenda'];
        }
        return cleaned;
      });
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'Administrador') {
      setSelectedPermissions([...ALL_PERMISSION_IDS]);
      setLinkedInstructorId('');
    } else if (newRole === 'Recepcionista') {
      setSelectedPermissions([
        'Visualizar Visão Geral',
        'Gerenciar Alunos',
        'Registrar Matrículas',
        'Agendar Horários',
        'Visualizar Múltiplas Agendas',
      ]);
      setLinkedInstructorId('');
    } else if (newRole === 'Fisioterapeuta / Instrutor') {
      // Por padrão, instrutor visualiza apenas a própria agenda (sem Múltiplas Agendas)
      setSelectedPermissions([
        'Gerenciar Alunos',
        'Agendar Horários',
        'Registrar Evolução Clínica',
      ]);
      // Sugere vínculo automático se encontrar professor por e-mail/nome
      const matched = resolveUserInstructor(
        {
          id: 'tmp',
          name,
          email,
          role: newRole,
          permissions: [],
          status: 'Ativo',
          createdAt: '',
        },
        instructors
      );
      if (matched) {
        setLinkedInstructorId(matched.id);
      }
    } else if (newRole === 'Financeiro') {
      setSelectedPermissions([
        'Visualizar Visão Geral',
        'Visualizar Financeiro',
        'Gerenciar Despesas',
        'Visualizar DRE',
        'Fechar Comissões',
        'Registrar Matrículas',
        'Visualizar Múltiplas Agendas',
      ]);
      setLinkedInstructorId('');
    }
  };

  const autoMatchedInstructor = resolveUserInstructor(
    {
      id: editingUser?.id || 'tmp',
      name,
      email,
      role,
      permissions: selectedPermissions,
      instructorId: linkedInstructorId || undefined,
      status: 'Ativo',
      createdAt: '',
    },
    instructors
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Limpa flag auxiliar caso já seja instrutor ou tenha instructorId vinculado
    const cleanedPermissions = selectedPermissions.filter((p) => {
      if (p === 'Restringir à Própria Agenda') {
        return !isMultiAgendaEnabled && role !== 'Fisioterapeuta / Instrutor' && !linkedInstructorId;
      }
      return true;
    });

    if (editingUser) {
      const updated: UserAccount = {
        ...editingUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() ? password.trim() : editingUser.password,
        passwordMasked: '••••••••',
        role,
        permissions: cleanedPermissions,
        instructorId: linkedInstructorId || undefined,
      };
      onUpdateUser(updated);
    } else {
      if (!password.trim()) return;
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        passwordMasked: '••••••••',
        role,
        permissions: cleanedPermissions,
        instructorId: linkedInstructorId || undefined,
        status: 'Ativo',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddUser(newUser);
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1">
            <Shield className="w-4 h-4" />
            <span>2.2 Cadastros / Controle de Acesso</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Usuários & Permissões da Plataforma
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre, edite permissões, restrinja agenda por instrutor ou exclua colaboradores com acesso ao sistema
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs transition-colors shadow-2xs"
        >
          <UserPlus className="w-4 h-4 text-teal-400" />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-semibold text-zinc-800">
            {users.length} usuários cadastrados
          </span>
          <span>Acesso individual seguro por perfil</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-50/80 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <th className="px-4 py-3">Usuário / Nome</th>
                <th className="px-4 py-3">E-mail de Login</th>
                <th className="px-4 py-3">Perfil / Escopo de Agenda</th>
                <th className="px-4 py-3">Permissões de Acesso</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => {
                const isOwnAgendaOnly = !canViewMultipleAgendas(user);
                const resolvedInst = resolveUserInstructor(user, instructors);
                const visiblePerms = (user.permissions || []).filter(
                  (p) => p !== 'Restringir à Própria Agenda'
                );

                return (
                  <tr key={user.id} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-900 flex items-center justify-center font-bold text-xs">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-zinc-600">
                      {user.email}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800">
                          {user.role}
                        </span>
                        {!hasFullAccess(user) && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {isOwnAgendaOnly ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                                <Lock className="w-2.5 h-2.5" />
                                <span>
                                  Apenas própria agenda
                                  {resolvedInst ? ` (${resolvedInst.name.split(' ')[0]})` : ''}
                                </span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                                <Eye className="w-2.5 h-2.5 text-teal-600" />
                                <span>Múltiplas agendas</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {visiblePerms.slice(0, 3).map((p, idx) => (
                          <span key={idx} className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200/50">
                            {p}
                          </span>
                        ))}
                        {visiblePerms.length > 3 && (
                          <span className="text-[10px] text-zinc-400">
                            +{visiblePerms.length - 3} mais
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        user.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Botão de Edição */}
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-zinc-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          title="Editar Usuário e Permissões"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Botão de Toggle Status */}
                        <button
                          onClick={() => onToggleUserStatus(user.id)}
                          className="text-[11px] font-medium px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                        >
                          {user.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                        </button>

                        {/* Botão de Exclusão */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja realmente excluir o usuário ${user.name}?`)) {
                              onDeleteUser(user.id);
                            }
                          }}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar ou Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
                  {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingUser ? `Editar Usuário: ${editingUser.name}` : 'Cadastrar Usuário com Permissões'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Defina o login, vínculo de instrutor e os módulos autorizados para o colaborador
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Costa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    E-mail de Login *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@studiopilates.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="text-zinc-700 font-semibold block mb-1">
                    {editingUser ? 'Nova Senha (opcional)' : 'Senha de Acesso *'}
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-700 font-semibold block mb-1">
                  Perfil de Acesso
                </label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="Administrador">Administrador (Acesso Irrestrito)</option>
                  <option value="Recepcionista">Recepcionista (Alunos, Matrículas e Agenda)</option>
                  <option value="Fisioterapeuta / Instrutor">Fisioterapeuta / Instrutor (Alunos e Evolução Clínica)</option>
                  <option value="Financeiro">Financeiro (Mensalidades e Relatórios)</option>
                </select>
              </div>

              {/* Escopo de Visualização da Agenda do Instrutor / Restrição de Outros Professores */}
              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-xs">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>Visualização de Agendas & Dados de Professores</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isMultiAgendaEnabled
                      ? 'bg-teal-100 text-teal-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isMultiAgendaEnabled ? 'Múltiplas Agendas' : 'Apenas Própria Agenda'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAgendaScope(false)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      !isMultiAgendaEnabled
                        ? 'bg-amber-50 border-amber-400 text-amber-950 shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Apenas a Própria Agenda</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                      Restringe agendas, horários e alunos de outros professores/instrutores.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAgendaScope(true)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isMultiAgendaEnabled
                        ? 'bg-teal-50 border-teal-400 text-teal-950 shadow-2xs'
                        : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-teal-700" />
                      <span>Múltiplas Agendas (Todos)</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight">
                      Permite visualizar e alternar entre as agendas de todos os professores.
                    </p>
                  </button>
                </div>

                {(role === 'Fisioterapeuta / Instrutor' || !isMultiAgendaEnabled || Boolean(linkedInstructorId)) && (
                  <div className="pt-2 border-t border-zinc-200/80">
                    <label className="text-zinc-700 font-semibold block mb-1 text-[11px]">
                      Professor / Instrutor Vinculado (Cadastro 2.5 Professores)
                    </label>
                    <select
                      value={linkedInstructorId}
                      onChange={(e) => setLinkedInstructorId(e.target.value)}
                      className="w-full bg-white border border-zinc-200 rounded-lg p-2 text-zinc-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    >
                      <option value="">
                        Identificar automaticamente por e-mail ou nome
                      </option>
                      {instructors.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.councilNumber}) — {inst.status}
                        </option>
                      ))}
                    </select>
                    {!linkedInstructorId && !isMultiAgendaEnabled && (
                      <p className={`text-[10px] mt-1 ${autoMatchedInstructor ? 'text-teal-700' : 'text-amber-700'}`}>
                        {autoMatchedInstructor
                          ? `Vínculo automático identificado: ${autoMatchedInstructor.name}`
                          : 'Dica: selecione o professor acima para garantir o vínculo exato com a agenda dele.'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Permissions Checkbox Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-zinc-700 font-semibold">
                    Permissões Granulares (Menus e Ações):
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {selectedPermissions.filter((p) => p !== 'Restringir à Própria Agenda').length} selecionada(s)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 max-h-52 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2 cursor-pointer select-none p-2 rounded-lg border transition-colors ${
                          isChecked
                            ? 'bg-teal-50/70 border-teal-200'
                            : 'bg-white border-zinc-200/70 hover:bg-zinc-100/60'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600 mt-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[11px] font-semibold text-zinc-800 block leading-tight">
                            {perm.label}
                          </span>
                          <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5">
                            {perm.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
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
                  {editingUser ? 'Salvar Alterações' : 'Salvar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
