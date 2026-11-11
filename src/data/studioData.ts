import { 
  UserAccount, 
  Modality, 
  Student, 
  Instructor,
  CompanyData,
  StudioOperatingConfig,
  DayScheduleHours,
  AgendaClassSession,
  ClassStudentSlot,
  Expense,
  ExpenseCategory
} from '../types/studio';

export const INITIAL_COMPANY_DATA: CompanyData = {
  corporateName: 'Studio Ana Paula Rodrigues Pilates e Fisioterapia LTDA',
  tradeName: 'Studio Ana Paula Rodrigues',
  cnpj: '38.452.190/0001-82',
  address: 'Av. Paulista, 1842 - Conjunto 74 - Bela Vista, São Paulo - SP, CEP 01310-200',
  phone: '(11) 98765-1234',
  email: 'contato@studiopilates.com.br',
  businessHours: 'Segunda a Sexta das 07:00 às 20:00 | Sábados das 08:00 às 12:00',
  contractTemplate: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PILATES E FISIOTERAPIA

Pelo presente instrumento particular, de um lado:

CONTRATADA:
{{EMPRESA_RAZAO_SOCIAL}}, inscrita no CNPJ sob o nº {{EMPRESA_CNPJ}}, com sede em {{EMPRESA_ENDERECO}}, telefone {{EMPRESA_TELEFONE}}, doravante denominada simplesmente CONTRATADA;

E de outro lado:

CONTRATANTE / ALUNO(A):
Nome: {{NOME_ALUNO}}
CPF: {{CPF_ALUNO}}
Data de Nascimento: {{DATA_NASCIMENTO}}
Endereço: {{ENDERECO_ALUNO}}
Telefone / WhatsApp: {{TELEFONE_ALUNO}}
E-mail: {{EMAIL_ALUNO}}
Profissão: {{PROFISSAO_ALUNO}}
Contato de Emergência: {{CONTATO_EMERGENCIA}} (Tel: {{TEL_EMERGENCIA}})
doravante denominado(a) simplesmente CONTRATANTE.

Têm entre si, justo e contratado, o que se segue:

CLÁUSULA PRIMEIRA - DO OBJETO
1.1. O presente contrato tem por objeto a prestação de serviços de Pilates e/ou Fisioterapia, na modalidade "{{MODALIDADE_NOME}}", com frequência de {{DIAS_SEMANA}} vezes por semana, nos horários: {{HORARIO_AULA}} (dias: {{DIAS_ESCOLHIDOS}}), sob orientação do(a) profissional {{PROFESSOR_RESPONSAVEL}}.

CLÁUSULA SEGUNDA - DO VALOR E FORMA DE PAGAMENTO
2.1. Pela prestação dos serviços acima ajustados, o(a) CONTRATANTE pagará à CONTRATADA a mensalidade no valor de R$ {{VALOR_MENSALIDADE}} ({{VALOR_EXTENSO}}).
2.2. A referida mensalidade terá vencimento estipulado para todo dia {{DIA_VENCIMENTO}} de cada mês subsequente, através de PIX, cartão ou boleto.

CLÁUSULA TERCEIRA - DAS AULAS, REPOSIÇÕES E AUSÊNCIAS
3.1. As sessões têm duração de 50 (cinquenta) minutos, iniciando pontualmente no horário agendado.
3.2. As ausências comunicadas com antecedência mínima de 2 (duas) horas poderão ser repostas dentro do mesmo ciclo mensal, conforme disponibilidade de agenda da CONTRATADA.
3.3. O não comparecimento sem aviso prévio ensejará a perda da sessão, sem direito a desconto ou crédito.

CLÁUSULA QUARTA - DAS CONDIÇÕES DE SAÚDE E ANAMNESE
4.1. O(A) CONTRATANTE declara ter preenchido com veracidade sua ficha de anamnese e avaliação postural, informando eventuais patologias prévias: "{{OBSERVACOES_CLINICAS}}".

CLÁUSULA QUINTA - DOS CONSENTIMENTOS E TERMOS FIRMADOS
5.1. AUTORIZAÇÃO DE USO DE IMAGEM EM REDES SOCIAIS:
{{TERMO_USO_IMAGEM}}

5.2. APRESENTAÇÃO ANUAL DE ATESTADO DE APTIDÃO FÍSICA:
{{TERMO_ATESTADO_MEDICO}}

CLÁUSULA SEXTA - DA RESCISÃO
6.1. O presente contrato poderá ser rescindido por qualquer das partes mediante comunicação prévia por escrito com antecedência mínima de 30 (trinta) dias.

Por estarem justos e contratados, firmam o presente instrumento em duas vias de igual teor.

São Paulo, {{DATA_ATUAL}}.

_____________________________________________
{{EMPRESA_RAZAO_SOCIAL}}
CONTRATADA

_____________________________________________
{{NOME_ALUNO}}
CONTRATANTE`
};

// MODALIDADES MANTIDAS PARA O USUÁRIO APROVEITAR AS INFORMAÇÕES
export const INITIAL_MODALITIES: Modality[] = [
  {
    id: 'mod-1',
    name: 'Pilates em Aparelhos (2x na semana)',
    billingType: 'mensalidade',
    daysPerWeek: 2,
    price: 380.00,
    description: 'Atendimento com até 4 alunos por horário nos aparelhos Reformer, Cadillac e Chair.',
    active: true
  },
  {
    id: 'mod-2',
    name: 'Pilates em Aparelhos (3x na semana)',
    billingType: 'mensalidade',
    daysPerWeek: 3,
    price: 490.00,
    description: 'Maior frequência para fortalecimento intensivo e alívio de dores crônicas.',
    active: true
  },
  {
    id: 'mod-3',
    name: 'Pilates Gestacional & Pós-Parto (2x na semana)',
    billingType: 'mensalidade',
    daysPerWeek: 2,
    price: 420.00,
    description: 'Exercícios seguros com fisioterapeuta com foco em assoalho pélvico e coluna.',
    active: true
  },
  {
    id: 'mod-4',
    name: 'Fisioterapia Traumato-Ortopédica / Reabilitação (2x/sem)',
    billingType: 'mensalidade',
    daysPerWeek: 2,
    price: 520.00,
    description: 'Tratamento recuperatório individualizado com avaliação cinesiológica.',
    active: true
  },
  {
    id: 'mod-5',
    name: 'Pilates em Aparelhos (1x na semana)',
    billingType: 'mensalidade',
    daysPerWeek: 1,
    price: 250.00,
    description: 'Manutenção semanal para alunos com rotina corrida.',
    active: true
  },
  {
    id: 'mod-6',
    name: 'Sessão de Pilates / Fisioterapia Avulsa',
    billingType: 'aula_avulsa',
    daysPerWeek: 0,
    price: 130.00,
    description: 'Atendimento pontual com agendamento livre conforme disponibilidade.',
    active: true
  },
  {
    id: 'mod-7',
    name: 'Aula de Reposição (Outro Professor)',
    billingType: 'reposicao',
    daysPerWeek: 0,
    price: 0.00,
    additionalTeacherFee: 35.00,
    description: 'Aula avulsa de reposição para alunos com falta com aviso prévio quando realizada por outro professor.',
    active: true
  },
  {
    id: 'mod-8',
    name: 'Pacote 10 Aulas / Atendimentos',
    billingType: 'pacote',
    daysPerWeek: 0,
    packageClasses: 10,
    price: 1100.00,
    description: 'Pacote fechado com 10 atendimentos de Pilates ou Fisioterapia para utilizar com agendamentos flexíveis.',
    active: true
  }
];

// DEMAIS CADASTROS ZERADOS PARA TESTE DO USUÁRIO
export const INITIAL_INSTRUCTORS: Instructor[] = [];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-master',
    name: 'Dra. Ana Paula Rodrigues',
    email: 'admin@studioanapaula.com.br',
    password: 'admin',
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
    createdAt: '2026-01-01'
  }
];

export const INITIAL_STUDENTS: Student[] = [];

export const INITIAL_AGENDA_SESSIONS: AgendaClassSession[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'cat-1', name: 'Aluguel do Imóvel & Condomínio' },
  { id: 'cat-2', name: 'Pró-Labore & Folha' },
  { id: 'cat-3', name: 'Energia Elétrica & Água' },
  { id: 'cat-4', name: 'Internet, Telefonia & Software' },
  { id: 'cat-5', name: 'Manutenção de Aparelhos de Pilates' },
  { id: 'cat-6', name: 'Materiais de Higiene & Descartáveis' },
  { id: 'cat-7', name: 'Marketing & Redes Sociais' },
  { id: 'cat-8', name: 'Contabilidade & Impostos' }
];

export const INITIAL_OPERATING_CONFIG: StudioOperatingConfig = {
  defaultCapacity: 4, // Até 4 alunos por horário com o mesmo professor
  studioHours: [
    { dayOfWeek: 1, dayName: 'Segunda-feira', enabled: true, startTime: '07:00', endTime: '20:00' },
    { dayOfWeek: 2, dayName: 'Terça-feira', enabled: true, startTime: '07:00', endTime: '20:00' },
    { dayOfWeek: 3, dayName: 'Quarta-feira', enabled: true, startTime: '07:00', endTime: '20:00' },
    { dayOfWeek: 4, dayName: 'Quinta-feira', enabled: true, startTime: '07:00', endTime: '20:00' },
    { dayOfWeek: 5, dayName: 'Sexta-feira', enabled: true, startTime: '07:00', endTime: '20:00' },
    { dayOfWeek: 6, dayName: 'Sábado', enabled: true, startTime: '08:00', endTime: '13:00' },
    { dayOfWeek: 0, dayName: 'Domingo', enabled: false, startTime: '08:00', endTime: '12:00' },
  ],
  instructorCustomHours: {}
};

// STORAGE KEY COM PREFIXO V2 PARA LIMPAR DADOS PREVIAMENTE SALVOS NO NAVEGADOR
const STORAGE_KEY = 'studio_anapaula_v2_';

export function getStudioData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

export function setStudioData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_KEY + key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage error:', e);
  }
}
