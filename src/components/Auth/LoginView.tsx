import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Info
} from 'lucide-react';
import { UserAccount, CompanyData } from '../../types/studio';

interface LoginViewProps {
  users: UserAccount[];
  onLogin: (user: UserAccount) => void;
  companyData: CompanyData;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  onLogin,
  companyData,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de ajuda / Esqueceu a senha
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Validação estrita de credenciais com compatibilidade web e mobile
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Por favor, informe seu e-mail e senha de acesso.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Garantia oficial do Administrador Master (Web e Mobile)
      if (cleanEmail === 'admin@studioanapaula.com.br') {
        if (cleanPassword === 'admin' || cleanPassword === 'admin123') {
          const masterUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail) || {
            id: 'usr-admin-master',
            name: 'Dra. Ana Paula Rodrigues',
            email: 'admin@studioanapaula.com.br',
            password: 'admin',
            passwordMasked: '••••••••',
            role: 'Administrador' as const,
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
            status: 'Ativo' as const,
            createdAt: '2026-01-01'
          };
          setIsSubmitting(false);
          onLogin(masterUser);
          return;
        } else {
          setErrorMessage('Senha incorreta para o Administrador Master.');
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Validação para os demais usuários cadastrados no menu 2.2 Usuários
      const foundUser = users.find(u => u.email.trim().toLowerCase() === cleanEmail);

      if (!foundUser) {
        setErrorMessage('Acesso não autorizado: Usuário não cadastrado no sistema.');
        setIsSubmitting(false);
        return;
      }

      // Validação de status ativo
      if (foundUser.status !== 'Ativo') {
        setErrorMessage('Acesso bloqueado: Este usuário está inativo ou suspenso pela administração.');
        setIsSubmitting(false);
        return;
      }

      // Validação de senha cadastrada (suporta digitação com ou sem espaços acidentais de teclado mobile)
      const userPassword = foundUser.password || '';
      if (!userPassword || (password !== userPassword && cleanPassword !== userPassword)) {
        setErrorMessage('Senha incorreta. Verifique suas credenciais e tente novamente.');
        setIsSubmitting(false);
        return;
      }

      // Acesso concedido
      setIsSubmitting(false);
      onLogin(foundUser);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Background Ambient Lighting Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-teal-500/10 via-teal-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Simple Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/46419_453e5190b728e5f80b8f1cbecbd7b75d-19_02_2026__16_16_41_d3f20382.jpg"
            alt="Studio Ana Paula Rodrigues"
            className="w-10 h-10 rounded-full object-cover bg-white p-0.5 ring-2 ring-teal-500/30 shadow-md shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-white tracking-tight uppercase truncate">
              Ana Paula Rodrigues
            </h1>
            <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
              Pilates & Fisioterapia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
          <span className="hidden sm:inline">Acesso Restrito ao Studio</span>
        </div>
      </header>

      {/* Main Center Login Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">

          {/* Card Frame */}
          <div className="bg-zinc-900/95 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            
            {/* Cabeçalho do Card de Login */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mb-3.5 shadow-inner">
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
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Formulário Estrito de Login (Otimizado para Mobile e Web) */}
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
                    placeholder="admin@studioanapaula.com.br"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all touch-manipulation"
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
                    className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors py-1"
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
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono transition-all touch-manipulation"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 w-12 flex items-center justify-center text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Lembrar-me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-zinc-400 hover:text-zinc-300 select-none py-1">
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
                className="w-full mt-2 py-3.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-teal-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer touch-manipulation min-h-[48px]"
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

          </div>

          {/* Rodapé com informações de segurança */}
          <div className="text-center mt-6 text-[11px] text-zinc-500 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>Acesso Restrito a Usuários Autorizados · Sigilo Total</span>
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
              Por medidas de segurança e sigilo do Studio, o cadastro e o gerenciamento de senhas são realizados exclusivamente pela administração no menu <strong className="text-teal-400">2.2 Cadastros &gt; Usuários</strong>.
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-5">
              Caso tenha esquecido sua senha ou não possua acesso, contate a administração do Studio para atualizar suas credenciais ou ativar seu cadastro.
            </p>
            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
