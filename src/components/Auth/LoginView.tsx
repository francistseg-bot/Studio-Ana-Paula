import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  UserCheck,
  UserPlus,
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

  // Estados para configuração do primeiro administrador (se banco estiver zerado)
  const [firstAdminName, setFirstAdminName] = useState('Dra. Ana Paula Rodrigues');
  const [firstAdminEmail, setFirstAdminEmail] = useState('');
  const [firstAdminPassword, setFirstAdminPassword] = useState('');
  const [firstAdminConfirmPassword, setFirstAdminConfirmPassword] = useState('');

  // Modal de ajuda / Esqueceu a senha
  const [showHelpModal, setShowHelpModal] = useState(false);

  const hasUsers = users && users.length > 0;

  // Validação estrita de credenciais contra as contas cadastradas em 2.2 Usuários
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
      
      // Busca usuário correspondente estritamente cadastrado em 2.2 Usuários
      const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!foundUser) {
        setErrorMessage('Acesso não autorizado: Usuário não possui cadastro ativo no sistema.');
        setIsSubmitting(false);
        return;
      }

      // Validação de status do usuário (somente usuários 'Ativo' podem acessar)
      if (foundUser.status !== 'Ativo') {
        setErrorMessage('Acesso bloqueado: Este usuário está inativo ou suspenso pela administração.');
        setIsSubmitting(false);
        return;
      }

      // Validação estrita de senha (sem atalhos ou senhas genéricas)
      if (!foundUser.password || password !== foundUser.password) {
        setErrorMessage('Credenciais inválidas: Senha incorreta. Verifique suas informações.');
        setIsSubmitting(false);
        return;
      }

      // Acesso autorizado
      setIsSubmitting(false);
      onLogin(foundUser);
    }, 250);
  };

  // Criação do Administrador Master para inicializar o sistema caso a base esteja zerada
  const handleFirstAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!firstAdminName.trim() || !firstAdminEmail.trim() || !firstAdminPassword) {
      setErrorMessage('Preencha todos os campos obrigatórios para criar o Administrador.');
      return;
    }

    if (firstAdminPassword.length < 4) {
      setErrorMessage('A senha de acesso deve ter pelo menos 4 caracteres.');
      return;
    }

    if (firstAdminPassword !== firstAdminConfirmPassword) {
      setErrorMessage('A confirmação da senha não coincide.');
      return;
    }

    const masterAdmin: UserAccount = {
      id: `usr-master-${Date.now()}`,
      name: firstAdminName.trim(),
      email: firstAdminEmail.trim().toLowerCase(),
      password: firstAdminPassword.trim(),
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

    onRegisterFirstAdmin(masterAdmin);
    onLogin(masterAdmin);
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
          <span className="hidden sm:inline">Ambiente Seguro & Sigiloso</span>
        </div>
      </header>

      {/* Main Center Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">

          {/* Card Frame */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            
            {hasUsers ? (
              <>
                {/* Cabeçalho do Card para Usuários Cadastrados */}
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

                {/* Mensagem de Erro de Validação */}
                {errorMessage && (
                  <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Formulário Estrito de Login */}
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
                        placeholder="seuemail@exemplo.com.br"
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
              </>
            ) : (
              /* Configuração Inicial de Segurança caso nenhum usuário exista no sistema */
              <div>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-4 shadow-inner">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Configuração Inicial de Segurança
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Defina a conta do Administrador Master para inicializar o controle de acesso com sigilo total
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleFirstAdminSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstAdminName}
                      onChange={(e) => setFirstAdminName(e.target.value)}
                      placeholder="Dra. Ana Paula Rodrigues"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      E-mail de Login *
                    </label>
                    <input
                      type="email"
                      required
                      value={firstAdminEmail}
                      onChange={(e) => setFirstAdminEmail(e.target.value)}
                      placeholder="admin@studioanapaula.com.br"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">
                        Senha de Acesso *
                      </label>
                      <input
                        type="password"
                        required
                        value={firstAdminPassword}
                        onChange={(e) => setFirstAdminPassword(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1">
                        Confirmar Senha *
                      </label>
                      <input
                        type="password"
                        required
                        value={firstAdminConfirmPassword}
                        onChange={(e) => setFirstAdminConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-500 pt-1">
                    Esta conta terá acesso total e poderá cadastrar outros usuários (professores, recepcionistas) no menu 2.2 Usuários.
                  </p>

                  <button
                    type="submit"
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Criar Administrador e Iniciar Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Rodapé com informações de segurança */}
          <div className="text-center mt-6 text-[11px] text-zinc-500 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              <span>Acesso Restrito a Usuários Autorizados · Sigilo e Segurança</span>
            </div>
            <p className="text-zinc-600">
              {companyData.tradeName || 'Studio Ana Paula Rodrigues'} · Todos os direitos reservados
            </p>
          </div>

        </div>
      </main>

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
              Por medidas de segurança interna e sigilo do Studio, o gerenciamento de credenciais e senhas é controlado exclusivamente pela administração no menu <strong className="text-teal-400">2.2 Cadastros &gt; Usuários</strong>.
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-5">
              Caso tenha esquecido sua senha ou não possua acesso, contate a administração do Studio para redefinir suas credenciais ou ativar seu cadastro.
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
