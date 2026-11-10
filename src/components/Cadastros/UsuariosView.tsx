import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Shield, 
  Key, 
  Mail, 
  Trash2, 
  Check, 
  Lock,
  UserPlus,
  Edit3,
  X
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types/studio';

interface UsuariosViewProps {
  users: UserAccount[];
  onAddUser: (user: UserAccount) => void;
  onUpdateUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
}

const AVAILABLE_PERMISSIONS = [
  'Acesso Total',
  'Gerenciar Alunos',
  'Registrar Matrículas',
  'Agendar Horários',
  'Visualizar Financeiro',
  'Editar Modalidades',
  'Gerenciar Professores',
  'Registrar Evolução Clínica'
];

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  users,
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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'Gerenciar Alunos',
    'Registrar Matrículas'
  ]);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('Recepcionista');
    setSelectedPermissions(['Gerenciar Alunos', 'Registrar Matrículas', 'Agendar Horários']);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPassword(''); // deixa vazio se não for alterar
    setRole(user.role);
    setSelectedPermissions(user.permissions || []);
    setIsModalOpen(true);
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'Administrador') {
      setSelectedPermissions([...AVAILABLE_PERMISSIONS]);
    } else if (newRole === 'Recepcionista') {
      setSelectedPermissions(['Gerenciar Alunos', 'Registrar Matrículas', 'Agendar Horários']);
    } else if (newRole === 'Fisioterapeuta / Instrutor') {
      setSelectedPermissions(['Gerenciar Alunos', 'Agendar Horários', 'Registrar Evolução Clínica']);
    } else if (newRole === 'Financeiro') {
      setSelectedPermissions(['Visualizar Financeiro', 'Registrar Matrículas']);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUser) {
      const updated: UserAccount = {
        ...editingUser,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() ? password.trim() : editingUser.password,
        passwordMasked: '••••••••',
        role,
        permissions: selectedPermissions,
      };
      onUpdateUser(updated);
    } else {
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim() ? password.trim() : '123456',
        passwordMasked: '••••••••',
        role,
        permissions: selectedPermissions,
        status: 'Ativo',
        createdAt: new Date().toISOString().split('T')[0]
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
            <span>2.1 Cadastros / Controle de Acesso</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900">
            Usuários & Permissões da Plataforma
          </h2>
          <p className="text-xs text-zinc-500">
            Cadastre, edite permissões ou exclua colaboradores com acesso ao sistema
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
                <th className="px-4 py-3">Perfil / Função</th>
                <th className="px-4 py-3">Permissões de Acesso</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => (
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
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-800">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 3).map((p, idx) => (
                        <span key={idx} className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded border border-teal-200/50">
                          {p}
                        </span>
                      ))}
                      {user.permissions.length > 3 && (
                        <span className="text-[10px] text-zinc-400">
                          +{user.permissions.length - 3} mais
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cadastrar ou Editar Usuário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150 my-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-zinc-950 text-teal-400">
                  {editingUser ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">
                    {editingUser ? `Editar Usuário: ${editingUser.name}` : 'Cadastrar Usuário com Permissões'}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Defina o login e os módulos autorizados para o colaborador
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

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Permissions Checkbox Grid */}
              <div>
                <label className="text-zinc-700 font-semibold block mb-2">
                  Permissões Granulares:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-200 max-h-36 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm);
                    return (
                      <label key={perm} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm)}
                          className="rounded text-teal-600 focus:ring-teal-500 accent-teal-600"
                        />
                        <span className="text-[11px] text-zinc-700">{perm}</span>
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
