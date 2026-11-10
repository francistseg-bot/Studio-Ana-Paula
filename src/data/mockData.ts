import {
  Student,
  Instructor,
  Equipment,
  ScheduledSession,
  FinancialTransaction,
  MembershipPlan
} from '../types/pilates';

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Dra. Camila Soares',
    title: 'Fisioterapeuta Especialista em Pilates & Coluna',
    crefito_cref: 'CREFITO-3 214589-F',
    phone: '(11) 98765-4321',
    email: 'camila.soares@pilatescore.com.br',
    specialties: ['Reabilitação de Coluna', 'Hérnia Discal', 'Pilates Clínico', 'Pós-operatório'],
    color: '#0D9488'
  },
  {
    id: 'inst-2',
    name: 'Prof. Lucas Mendonça',
    title: 'Educador Físico & Certificação Pilates Clássico',
    crefito_cref: 'CREF 049812-G/SP',
    phone: '(11) 97654-3210',
    email: 'lucas.mendonca@pilatescore.com.br',
    specialties: ['Condicionamento Físico', 'Atletas de Corrida', 'Pilates Avançado', 'Reformer Jumpboard'],
    color: '#D97706'
  },
  {
    id: 'inst-3',
    name: 'Dra. Beatriz Fontana',
    title: 'Fisioterapeuta em Saúde da Mulher & Gestantes',
    crefito_cref: 'CREFITO-3 198745-F',
    phone: '(11) 96543-2109',
    email: 'beatriz.fontana@pilatescore.com.br',
    specialties: ['Pilates Gestacional', 'Pós-parto & Diástase', 'Terceira Idade', 'Osteoporose'],
    color: '#7C3AED'
  }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
  {
    id: 'eq-1',
    name: 'Reformer 01 (Madeira Nobre)',
    type: 'reformer',
    condition: 'excellent',
    springsCount: { yellow: 1, blue: 1, red: 2, green: 1 },
    lastMaintenance: '2026-10-15',
    nextMaintenance: '2027-01-15',
    notes: 'Carrinho com rolamento silencioso, estofado novo e correias em couro higienizadas.'
  },
  {
    id: 'eq-2',
    name: 'Reformer 02 (Madeira Nobre)',
    type: 'reformer',
    condition: 'excellent',
    springsCount: { yellow: 1, blue: 1, red: 2, green: 1 },
    lastMaintenance: '2026-10-15',
    nextMaintenance: '2027-01-15',
    notes: 'Barra de pés ajustável com 4 posições. Caixa média inclusa.'
  },
  {
    id: 'eq-3',
    name: 'Reformer 03 (Clássico)',
    type: 'reformer',
    condition: 'good',
    springsCount: { yellow: 1, blue: 1, red: 2, green: 1 },
    lastMaintenance: '2026-09-10',
    nextMaintenance: '2026-12-10',
    notes: 'Mola vermelha central trocada no último mês. Em perfeito estado.'
  },
  {
    id: 'eq-4',
    name: 'Cadillac Trapeze Table',
    type: 'cadillac',
    condition: 'excellent',
    springsCount: { yellow: 2, blue: 2, red: 2, green: 2 },
    lastMaintenance: '2026-10-01',
    nextMaintenance: '2027-01-01',
    notes: 'Barra torre com trava de segurança de mosquetão duplo, alças de suspensão felpudas.'
  },
  {
    id: 'eq-5',
    name: 'Wunda Chair Pro',
    type: 'chair',
    condition: 'excellent',
    springsCount: { yellow: 0, blue: 2, red: 2, green: 0 },
    lastMaintenance: '2026-10-20',
    nextMaintenance: '2027-01-20',
    notes: 'Pedaís bipartidos funcionando perfeitamente com bastão de união rápido.'
  },
  {
    id: 'eq-6',
    name: 'Ladder Barrel & Spine Corrector',
    type: 'barrel',
    condition: 'excellent',
    springsCount: { yellow: 0, blue: 0, red: 0, green: 0 },
    lastMaintenance: '2026-10-25',
    nextMaintenance: '2027-02-25',
    notes: 'Estrutura reforçada de madeira maciça com ajuste de distância no trilho.'
  }
];

export const INITIAL_PLANS: MembershipPlan[] = [
  {
    id: 'plan-1',
    name: 'Duo Studio - 2x por semana',
    frequencyPerWeek: 2,
    monthlyPrice: 390.00,
    description: 'Aulas em dupla nos aparelhos com atendimento semi-individualizado.',
    activeStudentsCount: 14
  },
  {
    id: 'plan-2',
    name: 'Trio Studio - 2x por semana',
    frequencyPerWeek: 2,
    monthlyPrice: 320.00,
    description: 'Máximo de 3 alunos por horário, ideal para condicionamento e continuidade.',
    activeStudentsCount: 18
  },
  {
    id: 'plan-3',
    name: 'VIP Individual - 2x por semana',
    frequencyPerWeek: 2,
    monthlyPrice: 690.00,
    description: 'Atendimento exclusivo 1:1 focado em reabilitação específica ou atletas.',
    activeStudentsCount: 6
  },
  {
    id: 'plan-4',
    name: 'Pacote 10 Aulas Avulsas',
    frequencyPerWeek: 0,
    monthlyPrice: 550.00,
    description: 'Flexibilidade de horários, válido por 90 dias com agendamento livre.',
    activeStudentsCount: 5
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-1',
    name: 'Mariana Duarte Ramos',
    email: 'mariana.duarte@email.com',
    phone: '(11) 98123-4567',
    cpf: '345.678.901-22',
    birthDate: '1988-04-12',
    emergencyContact: {
      name: 'Carlos Ramos (Esposo)',
      phone: '(11) 98123-9999',
      kinship: 'Cônjuge'
    },
    planId: 'plan-1',
    planName: 'Duo Studio - 2x por semana',
    status: 'active',
    sessionsRemaining: 6,
    totalSessions: 8,
    planExpiry: '2026-11-28',
    startDate: '2025-06-10',
    assessment: {
      lastEvaluationDate: '2026-09-14',
      evaPainScale: 4,
      mainComplaints: 'Dor lombar crônica irradiada para glúteo esquerdo (Hérnia discal L5-S1 confirmada por RM).',
      posturalDiagnosis: 'Hiperlordose lombar compensatória com anteversão pélvica e encurtamento de flexores de quadril.',
      restrictions: [
        'Evitar flexão de tronco descontrolada sob carga',
        'Cuidado em torções bruscas de coluna',
        'Suspender exercícios se houver parestesia distal no pé'
      ],
      goals: [
        'Estabilização lombar profunda (Transverso e Multífidos)',
        'Alongamento de isquiotibiais e iliopsoas',
        'Descompressão axial da coluna no Cadillac'
      ],
      physicalActivityLevel: 'moderate',
      clinicalNotes: 'Paciente relata alívio significativo das dores após o início do trabalho de ponte articulada e descompressão com mola no Cadillac. Ótima aderência aos comandos verbais.'
    },
    evolutionNotes: [
      {
        id: 'evo-1',
        date: '2026-11-04',
        instructorName: 'Dra. Camila Soares',
        apparatusUsed: ['Reformer', 'Cadillac'],
        exercisesPerformed: ['Footwork 3 molas', 'Bridging articulado', 'Leg Springs no Cadillac com alça longa'],
        studentFeedback: 'Sentiu a lombar muito mais solta ao final da aula, sem pontadas.',
        painLevelAfter: 2
      },
      {
        id: 'evo-2',
        date: '2026-10-30',
        instructorName: 'Dra. Camila Soares',
        apparatusUsed: ['Cadillac', 'Ladder Barrel'],
        exercisesPerformed: ['Mermaid na barra torre', 'Swan suave', 'Respiração diafragmática'],
        studentFeedback: 'Boa mobilidade lateral, sem irradiação para o membro inferior.',
        painLevelAfter: 3
      }
    ],
    attendanceCount: 42,
    consecutiveAbsences: 0
  },
  {
    id: 'std-2',
    name: 'Rodrigo Santoro Silveira',
    email: 'rodrigo.silveira@email.com',
    phone: '(11) 99234-5678',
    cpf: '213.567.890-44',
    birthDate: '1982-11-03',
    emergencyContact: {
      name: 'Patrícia Silveira (Irmã)',
      phone: '(11) 99234-1111',
      kinship: 'Irmã'
    },
    planId: 'plan-3',
    planName: 'VIP Individual - 2x por semana',
    status: 'active',
    sessionsRemaining: 4,
    totalSessions: 8,
    planExpiry: '2026-11-20',
    startDate: '2025-01-15',
    assessment: {
      lastEvaluationDate: '2026-10-02',
      evaPainScale: 2,
      mainComplaints: 'Pós-operatório tardio de ligamento cruzado anterior (LCA) direito e tensão cervical por trabalho em home office.',
      posturalDiagnosis: 'Anteriorização da cabeça, elevação e protusão de escápula direita, leve assimetria de quadril.',
      restrictions: [
        'Evitar impacto e pivô no joelho direito',
        'Controle fino do valgo dinâmico no Footwork'
      ],
      goals: [
        'Propriocepção e fortalecimento excêntrico de quadríceps',
        'Retração e depressão escapular',
        'Condicionamento do Powerhouse para esportes'
      ],
      physicalActivityLevel: 'active',
      clinicalNotes: 'Excelente evolução da força do quadríceps. Ganho notável de estabilidade no apoio unipodal na Wunda Chair.'
    },
    evolutionNotes: [
      {
        id: 'evo-3',
        date: '2026-11-06',
        instructorName: 'Prof. Lucas Mendonça',
        apparatusUsed: ['Wunda Chair', 'Reformer'],
        exercisesPerformed: ['Footwork unilateral', 'Pumping na Chair', 'Chest Expansion'],
        studentFeedback: 'Sentiu estabilidade sólida no joelho durante o apoio.',
        painLevelAfter: 1
      }
    ],
    attendanceCount: 68,
    consecutiveAbsences: 0
  },
  {
    id: 'std-3',
    name: 'Helena Carvalho Nogueira',
    email: 'helena.nogueira@email.com',
    phone: '(11) 97345-6789',
    cpf: '456.789.012-33',
    birthDate: '1992-08-25',
    emergencyContact: {
      name: 'Fernando Nogueira',
      phone: '(11) 97345-0000',
      kinship: 'Esposo'
    },
    planId: 'plan-1',
    planName: 'Duo Studio - 2x por semana',
    status: 'active',
    sessionsRemaining: 7,
    totalSessions: 8,
    planExpiry: '2026-12-05',
    startDate: '2026-02-01',
    assessment: {
      lastEvaluationDate: '2026-10-10',
      evaPainScale: 3,
      mainComplaints: 'Gestante (26ª semana) com dor na articulação sacroilíaca e cansaço nas pernas.',
      posturalDiagnosis: 'Aumento da lordose fisiológica gestacional com rotação externa de pés.',
      restrictions: [
        'Não realizar decúbito dorsal prolongado após 20ª semana (síndrome da veia cava)',
        'Evitar estiramento excessivo devido à relaxina',
        'Sem exercícios com manobra de Valsalva'
      ],
      goals: [
        'Fortalecimento suave do assoalho pélvico e transverso',
        'Drenagem postural e alívio de peso em membros inferiores',
        'Mobilidade de pelve para preparação do parto'
      ],
      physicalActivityLevel: 'moderate',
      clinicalNotes: 'Acompanhamento com liberação do obstetra. Priorizar decúbito lateral com apoio de almofada e exercícios sentada na bola e no Reformer com cabeceira elevada.'
    },
    evolutionNotes: [
      {
        id: 'evo-4',
        date: '2026-11-05',
        instructorName: 'Dra. Beatriz Fontana',
        apparatusUsed: ['Cadillac', 'Mat'],
        exercisesPerformed: ['Mermaid sentada', 'Arm Springs leve', 'Báscula de pelve na bola suíça'],
        studentFeedback: 'Alívio grande no peso do quadril e costas.',
        painLevelAfter: 1
      }
    ],
    attendanceCount: 30,
    consecutiveAbsences: 0
  },
  {
    id: 'std-4',
    name: 'Antônio Carlos Guimarães',
    email: 'antonio.guimaraes@email.com',
    phone: '(11) 96456-7890',
    cpf: '123.456.789-00',
    birthDate: '1955-03-18',
    emergencyContact: {
      name: 'Juliana Guimarães (Filha)',
      phone: '(11) 96456-8888',
      kinship: 'Filha'
    },
    planId: 'plan-2',
    planName: 'Trio Studio - 2x por semana',
    status: 'active',
    sessionsRemaining: 2,
    totalSessions: 8,
    planExpiry: '2026-11-12',
    startDate: '2024-11-01',
    assessment: {
      lastEvaluationDate: '2026-08-20',
      evaPainScale: 3,
      mainComplaints: 'Osteoartrose de quadril bilateral e rigidez matinal generalizada.',
      posturalDiagnosis: 'Hipercifose senil com retificação cervical compensatória.',
      restrictions: [
        'Evitar rotação interna forçada de quadril',
        'Cuidado com transições rápidas de decúbito (hipotensão postural)',
        'Ajustar molas para suporte de sustentação'
      ],
      goals: [
        'Manutenção da autonomia e equilíbrio dinâmico',
        'Fortalecimento periarticular de quadril e joelho',
        'Melhora da expansão torácica na respiração'
      ],
      physicalActivityLevel: 'sedentary',
      clinicalNotes: 'Aluno muito dedicado. Apresenta melhora substancial na marcha e menor uso de analgésicos.'
    },
    evolutionNotes: [
      {
        id: 'evo-5',
        date: '2026-11-03',
        instructorName: 'Dra. Beatriz Fontana',
        apparatusUsed: ['Reformer', 'Cadillac'],
        exercisesPerformed: ['Footwork com foco em tornozelos', 'Arm Springs sentada', 'Alongamento suave'],
        studentFeedback: 'Sentiu-se mais firme para caminhar na volta para casa.',
        painLevelAfter: 2
      }
    ],
    attendanceCount: 94,
    consecutiveAbsences: 0
  },
  {
    id: 'std-5',
    name: 'Letícia Almeida Prado',
    email: 'leticia.prado@email.com',
    phone: '(11) 95567-8901',
    cpf: '567.890.123-55',
    birthDate: '1995-12-07',
    emergencyContact: {
      name: 'Renata Prado (Mãe)',
      phone: '(11) 95567-2222',
      kinship: 'Mãe'
    },
    planId: 'plan-1',
    planName: 'Duo Studio - 2x por semana',
    status: 'active',
    sessionsRemaining: 5,
    totalSessions: 8,
    planExpiry: '2026-11-25',
    startDate: '2026-04-18',
    assessment: {
      lastEvaluationDate: '2026-09-05',
      evaPainScale: 5,
      mainComplaints: 'Escoliose idiopática toracolombar em "S" com dor em queimação paravertebral direita.',
      posturalDiagnosis: 'Giba costal posterior direita visível no teste de Adams, assimetria de triângulo de Tales.',
      restrictions: [
        'Não realizar flexão lateral indiscriminada para o lado da concavidade',
        'Manter sempre a tração axial ativa'
      ],
      goals: [
        'Desrotacionamento e alongamento da concavidade torácica',
        'Fortalecimento isométrico do lado convexo',
        'Consciência proprioceptiva do alinhamento tridimensional'
      ],
      physicalActivityLevel: 'moderate',
      clinicalNotes: 'Trabalho focado no método Schroth adaptado ao Pilates (Reformer e Ladder Barrel).'
    },
    evolutionNotes: [],
    attendanceCount: 28,
    consecutiveAbsences: 0
  },
  {
    id: 'std-6',
    name: 'Carlos Eduardo Meireles',
    email: 'carlos.meireles@email.com',
    phone: '(11) 94678-9012',
    cpf: '678.901.234-66',
    birthDate: '1979-06-30',
    emergencyContact: {
      name: 'Flávia Meireles',
      phone: '(11) 94678-3333',
      kinship: 'Esposa'
    },
    planId: 'plan-4',
    planName: 'Pacote 10 Aulas Avulsas',
    status: 'active',
    sessionsRemaining: 3,
    totalSessions: 10,
    planExpiry: '2026-12-15',
    startDate: '2026-07-02',
    assessment: {
      lastEvaluationDate: '2026-07-05',
      evaPainScale: 1,
      mainComplaints: 'Condicionamento físico geral e alívio do estresse executivo.',
      posturalDiagnosis: 'Encurtamento leve de cadeia posterior e peitoral.',
      restrictions: ['Nenhuma restrição articular ou clínica prévia.'],
      goals: ['Hipertrofia funcional', 'Resistência de Core', 'Mobilidade de ombros'],
      physicalActivityLevel: 'active',
      clinicalNotes: 'Perfil atlético, responde muito bem a repertório avançado (Long Stretch, Teaser no Reformer).'
    },
    evolutionNotes: [],
    attendanceCount: 17,
    consecutiveAbsences: 0
  },
  {
    id: 'std-7',
    name: 'Tatiana Barbosa Rezende',
    email: 'tatiana.rezende@email.com',
    phone: '(11) 93789-0123',
    cpf: '789.012.345-77',
    birthDate: '1985-09-14',
    emergencyContact: {
      name: 'Mauro Rezende',
      phone: '(11) 93789-4444',
      kinship: 'Irmão'
    },
    planId: 'plan-2',
    planName: 'Trio Studio - 2x por semana',
    status: 'medical_leave',
    sessionsRemaining: 4,
    totalSessions: 8,
    planExpiry: '2026-12-30',
    startDate: '2025-08-10',
    assessment: {
      lastEvaluationDate: '2026-08-12',
      evaPainScale: 6,
      mainComplaints: 'Tendinite no manguito rotador esquerdo (supraespinhal) e bursite subacromial.',
      posturalDiagnosis: 'Discinesia escapular tipo 1 à esquerda com hiperatividade de trapézio superior.',
      restrictions: [
        'Evitar abdução do braço acima de 90° com rotação interna',
        'Suspender exercícios que comprimam o espaço subacromial'
      ],
      goals: [
        'Fortalecimento de rotadores externos e serrátil anterior',
        'Ritmo escapuloumeral normalizado',
        'Alívio da dor noturna'
      ],
      physicalActivityLevel: 'moderate',
      clinicalNotes: 'Afastamento temporário de 15 dias solicitado pela fisioterapeuta após infiltração médica. Retorno previsto para semana que vem.'
    },
    evolutionNotes: [],
    attendanceCount: 45,
    consecutiveAbsences: 2
  }
];

export const INITIAL_SESSIONS: ScheduledSession[] = [
  {
    id: 'sess-1',
    date: '2026-11-08',
    time: '08:00',
    durationMinutes: 50,
    equipmentId: 'eq-1',
    equipmentName: 'Reformer 01 & 02',
    instructorId: 'inst-1',
    instructorName: 'Dra. Camila Soares',
    type: 'duo',
    studentIds: ['std-1', 'std-5'],
    status: 'completed',
    notes: 'Mariana Duarte e Letícia Almeida. Aula focada em alinhamento de coluna e descompressão.'
  },
  {
    id: 'sess-2',
    date: '2026-11-08',
    time: '09:00',
    durationMinutes: 50,
    equipmentId: 'eq-4',
    equipmentName: 'Cadillac Trapeze Table',
    instructorId: 'inst-2',
    instructorName: 'Prof. Lucas Mendonça',
    type: 'individual',
    studentIds: ['std-2'],
    status: 'completed',
    notes: 'Rodrigo Silveira. Treino proprioceptivo de joelho e estabilidade escapular.'
  },
  {
    id: 'sess-3',
    date: '2026-11-08',
    time: '10:00',
    durationMinutes: 50,
    equipmentId: 'eq-1',
    equipmentName: 'Reformer & Chair',
    instructorId: 'inst-3',
    instructorName: 'Dra. Beatriz Fontana',
    type: 'duo',
    studentIds: ['std-3', 'std-4'],
    status: 'scheduled',
    notes: 'Helena Carvalho (gestante) e Antônio Carlos (terceira idade). Cuidado especial com apoios confortáveis.'
  },
  {
    id: 'sess-4',
    date: '2026-11-08',
    time: '14:00',
    durationMinutes: 50,
    equipmentId: 'eq-1',
    equipmentName: 'Reformer 01',
    instructorId: 'inst-2',
    instructorName: 'Prof. Lucas Mendonça',
    type: 'individual',
    studentIds: ['std-6'],
    status: 'scheduled',
    notes: 'Carlos Meireles. Treino avançado de força no Reformer.'
  },
  {
    id: 'sess-5',
    date: '2026-11-08',
    time: '16:00',
    durationMinutes: 50,
    equipmentId: 'eq-2',
    equipmentName: 'Reformer 02 & 03',
    instructorId: 'inst-1',
    instructorName: 'Dra. Camila Soares',
    type: 'duo',
    studentIds: ['std-1'],
    status: 'scheduled',
    notes: 'Mariana Duarte (reposição da semana anterior).'
  },
  {
    id: 'sess-6',
    date: '2026-11-09',
    time: '08:00',
    durationMinutes: 50,
    equipmentId: 'eq-1',
    equipmentName: 'Reformer 01 & 02',
    instructorId: 'inst-1',
    instructorName: 'Dra. Camila Soares',
    type: 'duo',
    studentIds: ['std-5', 'std-1'],
    status: 'scheduled',
    notes: 'Sessão regular de terça-feira.'
  },
  {
    id: 'sess-7',
    date: '2026-11-09',
    time: '10:00',
    durationMinutes: 50,
    equipmentId: 'eq-4',
    equipmentName: 'Cadillac & Chair',
    instructorId: 'inst-3',
    instructorName: 'Dra. Beatriz Fontana',
    type: 'individual',
    studentIds: ['std-3'],
    status: 'scheduled',
    notes: 'Helena Carvalho. Pilates gestacional específico.'
  }
];

export const INITIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1',
    description: 'Mensalidade Novembro - Mariana Duarte',
    studentId: 'std-1',
    studentName: 'Mariana Duarte Ramos',
    category: 'mensalidade',
    type: 'income',
    amount: 390.00,
    date: '2026-11-02',
    dueDate: '2026-11-05',
    status: 'paid',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-2',
    description: 'Plano VIP Individual - Rodrigo Santoro',
    studentId: 'std-2',
    studentName: 'Rodrigo Santoro Silveira',
    category: 'mensalidade',
    type: 'income',
    amount: 690.00,
    date: '2026-11-03',
    dueDate: '2026-11-05',
    status: 'paid',
    paymentMethod: 'credit_card'
  },
  {
    id: 'tx-3',
    description: 'Mensalidade Novembro - Helena Carvalho',
    studentId: 'std-3',
    studentName: 'Helena Carvalho Nogueira',
    category: 'mensalidade',
    type: 'income',
    amount: 390.00,
    date: '2026-11-05',
    dueDate: '2026-11-08',
    status: 'paid',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-4',
    description: 'Mensalidade Novembro - Antônio Carlos',
    studentId: 'std-4',
    studentName: 'Antônio Carlos Guimarães',
    category: 'mensalidade',
    type: 'income',
    amount: 320.00,
    date: '2026-11-07',
    dueDate: '2026-11-10',
    status: 'pending',
    paymentMethod: 'transfer'
  },
  {
    id: 'tx-5',
    description: 'Mensalidade Novembro - Letícia Almeida',
    studentId: 'std-5',
    studentName: 'Letícia Almeida Prado',
    category: 'mensalidade',
    type: 'income',
    amount: 390.00,
    date: '2026-11-08',
    dueDate: '2026-11-10',
    status: 'pending',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-6',
    description: 'Substituição de Molas Amarelas e Vermelhas (Reformer 01)',
    category: 'manutencao_aparelhos',
    type: 'expense',
    amount: 280.00,
    date: '2026-11-01',
    dueDate: '2026-11-01',
    status: 'paid',
    paymentMethod: 'pix'
  },
  {
    id: 'tx-7',
    description: 'Higienização e Álcool Isopropílico para Estofados',
    category: 'aluguel_despesas',
    type: 'expense',
    amount: 145.00,
    date: '2026-11-04',
    dueDate: '2026-11-04',
    status: 'paid',
    paymentMethod: 'debit_card'
  },
  {
    id: 'tx-8',
    description: 'Venda de Meias Antiderrapantes Pilates (4 pares)',
    category: 'produtos',
    type: 'income',
    amount: 180.00,
    date: '2026-11-06',
    dueDate: '2026-11-06',
    status: 'paid',
    paymentMethod: 'pix'
  }
];

// LocalStorage helpers to persist modifications made during tests
const STORAGE_PREFIX = 'pilatescore_';

export function getStoredData<T>(key: string, initialData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return initialData;
    return JSON.parse(raw);
  } catch {
    return initialData;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}
