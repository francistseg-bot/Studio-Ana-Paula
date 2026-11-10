import { PrescribedExercise } from '../types/pilates';

export interface ExerciseLibraryItem {
  id: string;
  name: string;
  apparatus: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  springSuggestion: string;
  targetMuscles: string[];
  contraindications: string[];
  benefits: string;
}

export const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    id: 'ex-1',
    name: 'Footwork (Toes, Arches, Heels)',
    apparatus: 'Reformer',
    level: 'Iniciante',
    springSuggestion: '3 a 4 molas (2 Vermelhas + 1 Azul ou 3 Vermelhas)',
    targetMuscles: ['Quadríceps', 'Gastrocnêmio', 'Isquiotibiais', 'Estabilizadores do Core'],
    contraindications: ['Fase aguda de tendinopatia patelar', 'Gonalgia severa em flexão máxima'],
    benefits: 'Aquecimento do membro inferior, alinhamento biomecânico e ativação do Powerhouse.'
  },
  {
    id: 'ex-2',
    name: 'The Hundred (Adaptação com pernas na mesa/90°)',
    apparatus: 'Reformer / Mat',
    level: 'Iniciante',
    springSuggestion: '1 Vermelha + 1 Azul (Reformer) ou Peso corporal (Mat)',
    targetMuscles: ['Reto abdominal', 'Transverso do abdômen', 'Flexores de quadril'],
    contraindications: ['Hérnia de disco cervical aguda', 'Diástase abdominal não reabilitada > 3cm'],
    benefits: 'Estimulação cardiorrespiratória, aquecimento da circulação e resistência do core.'
  },
  {
    id: 'ex-3',
    name: 'Bridging / Pelvic Curl',
    apparatus: 'Reformer / Solo',
    level: 'Iniciante',
    springSuggestion: '2 Vermelhas + 1 Azul',
    targetMuscles: ['Glúteo máximo', 'Isquiotibiais', 'Eretores da espinha'],
    contraindications: ['Espondilolistese de alto grau com dor em extensão'],
    benefits: 'Mobilização segmentar da coluna vertebral e fortalecimento da cadeia posterior.'
  },
  {
    id: 'ex-4',
    name: 'Elephant (Elefante Clássico)',
    apparatus: 'Reformer',
    level: 'Intermediário',
    springSuggestion: '2 Vermelhas',
    targetMuscles: ['Cadeia posterior profunda', 'Transverso abdominal', 'Deltóides'],
    contraindications: ['Encurtamento isquiotibial severo sem flexão de joelho', 'Instabilidade no ombro'],
    benefits: 'Alongamento ativo de cadeia posterior e fortalecimento do powerhouse em flexão.'
  },
  {
    id: 'ex-5',
    name: 'Short Box Series (Round Back & Flat Back)',
    apparatus: 'Reformer',
    level: 'Intermediário',
    springSuggestion: 'Todas as molas travadas para segurança (4 molas)',
    targetMuscles: ['Abdominais profundos', 'Psoas maior', 'Eretores da coluna'],
    contraindications: ['Hérnia discal lombar extrusa (evitar Round Back profundo)'],
    benefits: 'Consciência da pelve neutra, alongamento axial e controle postural.'
  },
  {
    id: 'ex-6',
    name: 'Chest Expansion',
    apparatus: 'Cadillac / Reformer',
    level: 'Iniciante',
    springSuggestion: 'Mola média com alças no Cadillac ou 1 Vermelha no Reformer',
    targetMuscles: ['Romboide', 'Trapézio médio e inferior', 'Tríceps braquial', 'Latíssimo do dorso'],
    contraindications: ['Instabilidade anterior de ombro em retração máxima'],
    benefits: 'Abertura de caixa torácica, correção de ombros protusos e mobilidade cervical.'
  },
  {
    id: 'ex-7',
    name: 'Teaser (Preparatório com barra torre)',
    apparatus: 'Cadillac',
    level: 'Intermediário',
    springSuggestion: '1 Mola vindo de cima com barra de empurre (Push-thru bar)',
    targetMuscles: ['Reto e oblíquos do abdômen', 'Iliopsoas', 'Estabilizadores escapulares'],
    contraindications: ['Instabilidade sacroilíaca aguda', 'Lombalgia aguda'],
    benefits: 'Equilíbrio, força central profunda e sinergia neuromuscular.'
  },
  {
    id: 'ex-8',
    name: 'Swan Dive / Cisne',
    apparatus: 'Ladder Barrel / Cadillac',
    level: 'Intermediário',
    springSuggestion: 'Mola leve de segurança no Cadillac',
    targetMuscles: ['Eretores da espinha', 'Multífidos', 'Glúteos'],
    contraindications: ['Estenose do canal vertebral', 'Espondilólise'],
    benefits: 'Extensão torácica, melhora da postura hipercifótica e descompressão anterior.'
  },
  {
    id: 'ex-9',
    name: 'Mermaid (Sereia Lateral)',
    apparatus: 'Wunda Chair / Reformer',
    level: 'Iniciante',
    springSuggestion: '1 Mola no step 3 (Chair) ou 1 Vermelha / 1 Azul (Reformer)',
    targetMuscles: ['Quadrado lombar', 'Oblíquos internos e externos', 'Intercostais'],
    contraindications: ['Dor facetária lombar ipsilateral'],
    benefits: 'Flexão lateral pura da coluna, abertura intercostal e alívio do encurtamento lateral.'
  },
  {
    id: 'ex-10',
    name: 'Footwork na Wunda Chair (Pumps & Pedaço de calcanhar)',
    apparatus: 'Wunda Chair',
    level: 'Iniciante',
    springSuggestion: '2 Molas pretas (ou nível médio superior)',
    targetMuscles: ['Gastrocnêmio e sóleo', 'Tibial anterior', 'Quadríceps'],
    contraindications: ['Fascite plantar em crise aguda'],
    benefits: 'Estabilidade de tornozelo, propriocepção em apoio bipodal e alinhamento do joelho.'
  }
];

export function generateFallbackPrescription(
  studentName: string,
  complaint: string,
  apparatusFocus: string,
  targetObjective: string
): {
  title: string;
  duration: string;
  studentName: string;
  focus: string;
  warmup: PrescribedExercise[];
  mainRepertoire: PrescribedExercise[];
  cooldown: PrescribedExercise[];
  clinicalObservations: string;
} {
  return {
    title: `Sessão Personalizada de Pilates Clínico - Foco: ${targetObjective}`,
    duration: '50 minutos',
    studentName,
    focus: `${targetObjective} | Atenção a: ${complaint}`,
    warmup: [
      {
        name: 'Respiração Costo-Diafragmática & Ativação de Powerhouse',
        apparatus: 'Mat / Reformer',
        springTension: 'Sem carga (Respiração e báscula de pelve)',
        repetitions: '8 a 10 ciclos respiratórios lentos',
        objective: 'Ativação do transverso do abdômen e assoalho pélvico sem compensação lombar.',
        precautions: 'Manter a coluna neutra e relaxar os ombros.'
      },
      {
        name: 'Footwork (Posição Neutra e Arcos)',
        apparatus: 'Reformer',
        springTension: '2 Vermelhas + 1 Azul',
        repetitions: '10 a 12 repetições por variação',
        objective: 'Aquecimento articular de joelhos, tornozelos e estabilização de pelve.',
        precautions: 'Evitar hiperextensão de joelhos no retorno e manter o sacro apoiado.'
      }
    ],
    mainRepertoire: [
      {
        name: 'Bridging com Apoio dos Pés na Barra',
        apparatus: 'Reformer',
        springTension: '2 Vermelhas',
        repetitions: '8 a 10 repetições articuladas',
        objective: 'Mobilização vértebra por vértebra e ativação dos glúteos para alívio lombar.',
        precautions: 'Interromper na altura das escápulas; não sobrecarregar a região cervical.'
      },
      {
        name: 'Arm Work / Chest Expansion Ajoelhado',
        apparatus: apparatusFocus.includes('Cadillac') ? 'Cadillac' : 'Reformer',
        springTension: '1 Mola Azul no Reformer ou 1 Mola Amarela com alça no Cadillac',
        repetitions: '8 repetições com isometria de 3 segundos',
        objective: 'Abertura peitoral, retração de escápulas e estabilidade de tronco.',
        precautions: 'Evitar antepulsão da cabeça e hiperlordose na puxada.'
      },
      {
        name: 'Mermaid com Barra Torre ou Carrinho',
        apparatus: apparatusFocus.includes('Cadillac') ? 'Cadillac' : 'Reformer',
        springTension: 'Mola leve vindo de cima (Cadillac) ou 1 Azul (Reformer)',
        repetitions: '6 a 8 repetições para cada hemicorpo',
        objective: 'Alongamento lateral do quadrado lombar e descompressão dos espaços vertebrais.',
        precautions: 'Manter ambos os ísquios firmemente apoiados durante a flexão lateral.'
      },
      {
        name: 'Leg Springs / Círculos de Pernas no Ar',
        apparatus: 'Cadillac / Reformer com alças longas',
        springTension: 'Molas amarelas ou 1 Vermelha no Reformer',
        repetitions: '6 círculos em cada sentido',
        objective: 'Mobilidade coxofemoral com controle abdominal contra resistências assimétricas.',
        precautions: 'Ajustar amplitude para nunca descolar a lombar do carrinho/estofado.'
      }
    ],
    cooldown: [
      {
        name: 'Alongamento Axial na Barra Torre & Respiração Consciente',
        apparatus: 'Cadillac / Mat',
        springTension: 'Barra Push-thru com mola de segurança',
        repetitions: '5 minutos de tração suave e relaxamento',
        objective: 'Descompressão discal da coluna e retorno à calma neuromuscular.',
        precautions: 'Movimento guiado pelo instrutor sem trancos na tração.'
      }
    ],
    clinicalObservations: `Plano estruturado considerando o diagnóstico de ${complaint}. Priorizar controle motor e alinhamento neutro em todos os exercícios, suspendendo qualquer movimento em caso de dor aguda irradiada.`
  };
}
