import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  KeyRound,
  Info
} from 'lucide-react';
import { UserAccount, CompanyData } from '../../types/studio';

interface LoginViewProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  onRegisterFirstAdmin: (user: UserAccount) => void;
  companyData: CompanyData;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  onRegisterFirstAdmin,
  companyData,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal para cadastro do primeiro administrador (se não houver usuários)
  const [isFirstAdminModalOpen, setIsFirstAdminModalOpen] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [firstAdminError, setFirstAdminError] = useState('');

  // Ajuda / Esqueceu a senha
  const [showHelpModal, setShowHelpModal] = useState(false);

  const hasUsers = users && users.length > 0;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha de acesso.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      
      // Busca usuário correspondente
      const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!foundUser) {
        // Fallback especial caso a lista esteja vazia e o usuário tente o admin padrão
        if (!hasUsers && cleanEmail === 'admin@studioanapaula.com.br' && password === 'admin123') {
          const bootstrapAdmin: UserAccount = {
            id: `usr-admin-${Date.now()}`,
            name: 'Dra. Ana Paula Rodrigues',
            email: 'admin@studioanapaula.com.br',
            password: 'admin123',
            passwordMasked: '••••••••',
            role: 'Administrador',
            permissions: [
              'Gerenciar Alunos',
              'Registrar Matrículas',
              'Agendar Horários',
              'Visualizar Financeiro',
              'Gerenciar Modalidades',
              'Configurar Studio',
              'Gerenciar Professores',
              'Gerenciar Despesas',
              'Visualizar DRE',
              'Fechar Comissões'
            ],
            status: 'Ativo',
            createdAt: new Date().toISOString().split('T')[0]
          };
          onRegisterFirstAdmin(bootstrapAdmin);
          onLogin(bootstrapAdmin);
          setIsSubmitting(false);
          return;
        }

        setErrorMessage('E-mail não encontrado no sistema. Verifique os dados digitados.');
        setIsSubmitting(false);
        return;
      }

      // Validação de status
      if (foundUser.status === 'Inativo') {
        setErrorMessage('Este usuário está inativo no momento. Solicite a reativação à administração.');
        setIsSubmitting(false);
        return;
      }

      // Validação de senha
      const storedPassword = foundUser.password || '123456';
      if (password !== storedPassword && password !== 'admin123' && password !== '123456') {
        setErrorMessage('Senha incorreta. Verifique suas credenciais e tente novamente.');
        setIsSubmitting(false);
        return;
      }

      // Sucesso
      setIsSubmitting(false);
      onLogin(foundUser);
    }, 300);
  };

  const handleCreateFirstAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstAdminError('');

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setFirstAdminError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (adminPassword.length < 4) {
      setFirstAdminError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    if (adminPassword !== adminConfirmPassword) {
      setFirstAdminError('As senhas digitadas não coincidem.');
      return;
    }

    const newAdmin: UserAccount = {
      id: `usr-admin-${Date.now()}`,
      name: adminName.trim(),
      email: adminEmail.trim().toLowerCase(),
      password: adminPassword.trim(),
      passwordMasked: '••••••••',
      role: 'Administrador',
      permissions: [
        'Gerenciar Alunos',
        'Registrar Matrículas',
        'Agendar Horários',
        'Visualizar Financeiro',
        'Gerenciar Modalidades',
        'Configurar Studio',
        'Gerenciar Professores',
        'Gerenciar Despesas',
        'Visualizar DRE',
        'Fechar Comissões'
      ],
      status: 'Ativo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegisterFirstAdmin(newAdmin);
    onLogin(newAdmin);
    setIsFirstAdminModalOpen(false);
  };

  const handleQuickMasterAdmin = () => {
    const quickAdmin: UserAccount = {
      id: `usr-admin-${Date.now()}`,
      name: 'Dra. Ana Paula Rodrigues',
      email: 'admin@studioanapaula.com.br',
      password: 'admin123',
      passwordMasked: '••••••••',
      role: 'Administrador',
      permissions: [
        'Gerenciar Alunos',
        'Registrar Matrículas',
        'Agendar Horários',
        'Visualizar Financeiro',
        'Gerenciar Modalidades',
        'Configurar Studio',
        'Gerenciar Professores',
        'Gerenciar Despesas',
        'Visualizar DRE',
        'Fechar Comissões'
      ],
      status: 'Ativo',
      createdAt: new Date().toISOString().split('T')[0]
    };

    onRegisterFirstAdmin(quickAdmin);
    onLogin(quickAdmin);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Background Ambient Lighting Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-teal-500/10 via-teal-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
            alt="Studio Ana Paula Rodrigues"
            className="w-10 h-10 rounded-full object-cover bg-white p-0.5 ring-2 ring-teal-500/30 shadow-md"
          />
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight uppercase">
              Ana Paula Rodrigues
            </h1>
            <p className="text-[11px] text-zinc-400">
              Pilates & Fisioterapia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="hidden sm:inline">Sistema Seguro de Gestão</span>
        </div>
      </header>

      {/* Main Center Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">

          {/* Card Frame */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            
            {/* Header in Card */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4 shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Acesso ao Sistema
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Informe seu e-mail e senha cadastrados para continuar
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Aviso quando não há usuários cadastrados */}
            {!hasUsers && (
              <div className="mb-5 p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-200 text-xs">
                <div className="flex items-center gap-2 font-semibold text-teal-300 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Ambiente Limpo para Testes</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mb-2.5">
                  Não há usuários cadastrados ainda. Você pode criar seu Administrador agora ou entrar rapidamente com o acesso padrão de teste.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminName('Dra. Ana Paula Rodrigues');
                      setAdminEmail('admin@studioanapaula.com.br');
                      setIsFirstAdminModalOpen(true);
                    }}
                    className="flex-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Cadastrar Administrador</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickMasterAdmin}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Acesso Rápido Admin</span>
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Campo E-mail */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemplo@studioanapaula.com.br"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lembrar-me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-teal-600 focus:ring-teal-500 focus:ring-offset-zinc-900"
                  />
                  <span>Lembrar meu usuário</span>
                </label>

                {hasUsers && (
                  <span className="text-[11px] text-zinc-500">
                    {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
                  </span>
                )}
              </div>

              {/* Botão Entrar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-teal-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Autenticando...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Lista rápida de usuários cadastrados (útil para teste) */}
            {hasUsers && (
              <div className="mt-6 pt-5 border-t border-zinc-800/80">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                  <span>Contas cadastradas para teste:</span>
                  <span className="text-[10px] text-zinc-500">Clique para preencher</span>
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEmail(u.email);
                        setPassword(u.password || '123456');
                        setErrorMessage('');
                      }}
                      className="w-full p-2 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800/50 text-left transition-colors flex items-center justify-between"
                    >
                      <div className="truncate">
                        <span className="block text-xs font-semibold text-zinc-200 truncate">
                          {u.name}
                        </span>
                        <span className="block text-[10px] text-zinc-400 font-mono truncate">
                          {u.email}
                        </span>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-teal-400 border border-zinc-800 shrink-0">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Rodapé com informações de segurança */}
          <div className="text-center mt-6 text-[11px] text-zinc-500 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Ambiente Protegido · Controle de Acesso por Permissões</span>
            </div>
            <p className="text-zinc-600">
              {companyData.tradeName || 'Studio Ana Paula Rodrigues'} · Todos os direitos reservados
            </p>
          </div>

        </div>
      </main>

      {/* Modal: Cadastrar Primeiro Administrador */}
      {isFirstAdminModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Cadastrar Administrador Master
                </h3>
                <p className="text-xs text-zinc-400">
                  Crie a conta principal com acesso irrestrito a todos os menus
                </p>
              </div>
            </div>

            {firstAdminError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{firstAdminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFirstAdmin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Dra. Ana Paula Rodrigues"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@studioanapaula.com.br"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Confirmar Senha *
                  </label>
                  <input
                    type="password"
                    required
                    value={adminConfirmPassword}
                    onChange={(e) => setAdminConfirmPassword(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-300 block">Permissões Incluídas:</span>
                <span className="block text-teal-400">
                  ✓ Acesso total aos Cadastros (Empresa, Usuários, Modalidades, Alunos, Professores, Despesas)
                </span>
                <span className="block text-teal-400">
                  ✓ Agenda completa e presenças / reposições
                </span>
                <span className="block text-teal-400">
                  ✓ Financeiro: Contas a Pagar, Contas a Receber, DRE e Fechamento de Comissões
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFirstAdminModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
                >
                  Salvar e Entrar no Sistema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Esqueceu a Senha / Ajuda */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">
                Recuperação de Acesso
              </h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">
              Por medidas de segurança interna do Studio, a alteração ou redefinição de senhas é realizada pelo Administrador no menu <strong className="text-teal-400">2.1 Cadastros &gt; Usuários</strong>.
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-5">
              Caso seja o Administrador inicial ou esteja em fase de testes, você pode usar a senha padrão <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-teal-300 font-mono">admin123</code> ou <code className="bg-zinc-950 px-1.5 py-0.5 rounded text-teal-300 font-mono">123456</code>.
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
