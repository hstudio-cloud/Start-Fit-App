function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const exerciseDefinitionsByGroup = {
  peito: [
    {
      id: 'supino_reto',
      name: 'Supino Reto',
      aliases: ['supino reto com barra', 'bench press', 'supino barra'],
      equipment: 'barra',
      difficulty: 'intermediario',
      animationKey: 'supino_reto',
      defaultSets: 4,
      defaultReps: '8-12',
      restSeconds: 90,
      instructions: 'Deite no banco, mantenha os pes firmes no chao, desca a barra ate a linha media do peito e empurre com controle.',
      commonMistakes: ['Tirar os ombros do banco', 'Descer a barra no pescoco', 'Bater a barra no peito'],
      tips: ['Aperte as escapulas no banco', 'Suba a barra em linha reta', 'Controle a fase de descida'],
    },
    {
      id: 'supino_inclinado',
      name: 'Supino Inclinado',
      aliases: ['supino inclinado com halteres', 'incline press'],
      equipment: 'halter',
      difficulty: 'intermediario',
      animationKey: 'supino_inclinado',
      defaultSets: 4,
      defaultReps: '8-12',
      restSeconds: 90,
      instructions: 'No banco inclinado, desca os halteres alinhados ao peitoral superior e suba sem perder a estabilidade.',
      commonMistakes: ['Abrir demais os cotovelos', 'Deixar o punho quebrar', 'Perder contato lombar com o banco'],
      tips: ['Mantenha o peito alto', 'Suba aproximando os halteres', 'Use amplitude confortavel'],
    },
    {
      id: 'crucifixo',
      name: 'Crucifixo',
      aliases: ['crucifixo com halteres', 'fly', 'dumbbell fly'],
      equipment: 'halter',
      difficulty: 'intermediario',
      animationKey: 'crucifixo',
      defaultSets: 3,
      defaultReps: '10-15',
      restSeconds: 75,
      instructions: 'Com cotovelos levemente flexionados, abra os bracos em arco e volte comprimindo o peito.',
      commonMistakes: ['Transformar o movimento em supino', 'Descer demais e forcar o ombro', 'Flexionar demais os cotovelos'],
      tips: ['Pense em abracar o tronco', 'Controle o arco do movimento', 'Mantenha o peitoral tensionado'],
    },
    {
      id: 'flexao',
      name: 'Flexao',
      aliases: ['flexao de braco', 'push up', 'push-up'],
      equipment: 'peso corporal',
      difficulty: 'iniciante',
      animationKey: 'flexao',
      defaultSets: 3,
      defaultReps: '12-20',
      restSeconds: 60,
      instructions: 'Mantenha o corpo alinhado, desca o peito entre as maos e empurre sem deixar o quadril cair.',
      commonMistakes: ['Quadril afundar', 'Cotovelos muito abertos', 'Descer pouco'],
      tips: ['Ative abdomen e gluteos', 'Olhe para o chao', 'Empurre o solo com forca'],
    },
  ],
  costas: [
    {
      id: 'puxada_frontal',
      name: 'Puxada Frontal',
      aliases: ['lat pulldown', 'puxada alta'],
      equipment: 'cabo',
      difficulty: 'iniciante',
      animationKey: 'puxada_frontal',
      defaultSets: 4,
      defaultReps: '10-12',
      restSeconds: 75,
      instructions: 'Puxe a barra em direcao ao peito alto, conduzindo o movimento com cotovelos para baixo.',
      commonMistakes: ['Jogar o tronco para tras', 'Puxar com o biceps apenas', 'Subir rapido demais'],
      tips: ['Mantenha o peito aberto', 'Segure um segundo embaixo', 'Retorne alongando as costas'],
    },
    {
      id: 'remada_baixa',
      name: 'Remada Baixa',
      aliases: ['puxada no cabo baixo', 'seated row', 'remada sentado'],
      equipment: 'cabo',
      difficulty: 'iniciante',
      animationKey: 'remada_baixa',
      defaultSets: 4,
      defaultReps: '10-12',
      restSeconds: 75,
      instructions: 'Puxe o triangulo ate a linha do abdomen com peito aberto e escapulas aproximando no final.',
      commonMistakes: ['Curvar a lombar', 'Jogar o tronco para frente e para tras', 'Encolher os ombros'],
      tips: ['Puxe com os cotovelos', 'Segure o abdomen firme', 'Retorne de forma controlada'],
    },
    {
      id: 'remada_curvada',
      name: 'Remada Curvada',
      aliases: ['remada curvada com barra', 'bent over row'],
      equipment: 'barra',
      difficulty: 'intermediario',
      animationKey: 'remada_curvada',
      defaultSets: 4,
      defaultReps: '8-10',
      restSeconds: 90,
      instructions: 'Incline o tronco com coluna neutra e puxe a barra para a linha do umbigo.',
      commonMistakes: ['Arredondar a lombar', 'Usar impulso excessivo', 'Puxar para o peito'],
      tips: ['Trave o abdomen', 'Mantenha o pescoco neutro', 'Aproxime as escapulas no topo'],
    },
    {
      id: 'pulldown',
      name: 'Pulldown',
      aliases: ['pull-up', 'barra fixa', 'pulldown'],
      equipment: 'peso corporal',
      difficulty: 'avancado',
      animationKey: 'pulldown',
      defaultSets: 3,
      defaultReps: '6-10',
      restSeconds: 120,
      instructions: 'Parta da suspensao completa e puxe o peito em direcao a barra com controle.',
      commonMistakes: ['Subir encolhendo os ombros', 'Balancar o corpo', 'Nao completar a extensao'],
      tips: ['Ative as escapulas antes de subir', 'Pense em levar o cotovelo para baixo', 'Desca controlando'],
    },
  ],
  pernas: [
    {
      id: 'agachamento_livre',
      name: 'Agachamento Livre',
      aliases: ['agachamento com barra', 'back squat'],
      equipment: 'barra',
      difficulty: 'intermediario',
      animationKey: 'agachamento_livre',
      defaultSets: 4,
      defaultReps: '8-12',
      restSeconds: 120,
      instructions: 'Inicie com a barra apoiada nos trapzios, quadril para tras e joelhos acompanhando a ponta dos pes.',
      commonMistakes: ['Joelhos fechando para dentro', 'Perder a curvatura da lombar', 'Subir jogando o quadril primeiro'],
      tips: ['Respire e trave o abdomen', 'Distribua o peso no medio do pe', 'Desca ate amplitude segura'],
    },
    {
      id: 'leg_press',
      name: 'Leg Press',
      aliases: ['leg press 45', 'leg press 45 graus'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'leg_press',
      defaultSets: 4,
      defaultReps: '10-15',
      restSeconds: 90,
      instructions: 'Posicione os pes na largura dos ombros e empurre a plataforma sem travar totalmente os joelhos.',
      commonMistakes: ['Descer demais e tirar o quadril do banco', 'Fechar os joelhos', 'Travamento brusco no topo'],
      tips: ['Mantenha lombar apoiada', 'Controle o retorno', 'Empurre pela sola inteira dos pes'],
    },
    {
      id: 'cadeira_extensora',
      name: 'Cadeira Extensora',
      aliases: ['leg extension'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'cadeira_extensora',
      defaultSets: 3,
      defaultReps: '12-15',
      restSeconds: 60,
      instructions: 'Ajuste o eixo da maquina ao joelho e estenda as pernas ate contrair bem o quadriceps.',
      commonMistakes: ['Tirar o quadril do assento', 'Bater o peso na descida', 'Usar carga excessiva'],
      tips: ['Segure um instante no topo', 'Desca em dois tempos', 'Mantenha o tronco apoiado'],
    },
    {
      id: 'mesa_flexora',
      name: 'Mesa Flexora',
      aliases: ['cadeira flexora', 'leg curl'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'mesa_flexora',
      defaultSets: 3,
      defaultReps: '10-15',
      restSeconds: 60,
      instructions: 'Flexione os joelhos puxando o rolo com controle ate contrair os posteriores.',
      commonMistakes: ['Tirar o quadril do apoio', 'Roubar com a lombar', 'Voltar rapido demais'],
      tips: ['Ajuste o joelho no eixo da maquina', 'Segure a contracao por um segundo', 'Controle a descida'],
    },
    {
      id: 'afundo',
      name: 'Afundo',
      aliases: ['afundo com halteres', 'passada', 'lunge'],
      equipment: 'halter',
      difficulty: 'iniciante',
      animationKey: 'afundo',
      defaultSets: 3,
      defaultReps: '10-12 por perna',
      restSeconds: 75,
      instructions: 'Dê um passo a frente, desca em linha reta e suba empurrando o chao com a perna da frente.',
      commonMistakes: ['Passo muito curto', 'Inclinar demais o tronco', 'Joelho da frente colapsar'],
      tips: ['Mantenha o peito aberto', 'Desca ate quase tocar o joelho atras', 'Suba com equilibrio'],
    },
    {
      id: 'panturrilha',
      name: 'Panturrilha',
      aliases: ['panturrilha em pe', 'calf raise'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'panturrilha',
      defaultSets: 4,
      defaultReps: '15-20',
      restSeconds: 45,
      instructions: 'Eleve os calcanhares ao maximo, segure o pico de contracao e retorne alongando bem.',
      commonMistakes: ['Fazer rebote', 'Usar pouca amplitude', 'Mover os joelhos'],
      tips: ['Suba em um tempo e desca em dois', 'Segure na ponta dos pes', 'Respire continuamente'],
    },
  ],
  ombros: [
    {
      id: 'desenvolvimento_ombros',
      name: 'Desenvolvimento',
      aliases: ['desenvolvimento com halteres', 'desenvolvimento com barra', 'shoulder press'],
      equipment: 'halter',
      difficulty: 'intermediario',
      animationKey: 'desenvolvimento_ombros',
      defaultSets: 4,
      defaultReps: '8-12',
      restSeconds: 75,
      instructions: 'Empurre a carga acima da cabeca mantendo o tronco firme e os antebracos alinhados.',
      commonMistakes: ['Arquear a lombar', 'Descer com cotovelos atras demais', 'Perder o alinhamento do punho'],
      tips: ['Contraia gluteos e abdomen', 'Suba sem bater a carga', 'Desca com controle'],
    },
    {
      id: 'elevacao_lateral',
      name: 'Elevacao Lateral',
      aliases: ['lateral raise'],
      equipment: 'halter',
      difficulty: 'iniciante',
      animationKey: 'elevacao_lateral',
      defaultSets: 3,
      defaultReps: '12-15',
      restSeconds: 60,
      instructions: 'Eleve os bracos lateralmente ate a altura dos ombros, sem balancar o tronco.',
      commonMistakes: ['Subir acima da linha do ombro', 'Roubar com impulso', 'Punhos muito acima dos cotovelos'],
      tips: ['Lidere com os cotovelos', 'Use carga moderada', 'Desca devagar'],
    },
    {
      id: 'elevacao_frontal',
      name: 'Elevacao Frontal',
      aliases: ['front raise'],
      equipment: 'halter',
      difficulty: 'iniciante',
      animationKey: 'elevacao_frontal',
      defaultSets: 3,
      defaultReps: '10-15',
      restSeconds: 60,
      instructions: 'Eleve os halteres a frente ate a linha dos ombros mantendo o tronco neutro.',
      commonMistakes: ['Jogar o corpo para tras', 'Subir acima do necessario', 'Punhos soltos'],
      tips: ['Suba sem embalo', 'Mantenha cotovelos levemente flexionados', 'Controle a descida'],
    },
  ],
  biceps: [
    {
      id: 'rosca_direta',
      name: 'Rosca Direta',
      aliases: ['rosca direta com barra', 'barbell curl'],
      equipment: 'barra',
      difficulty: 'iniciante',
      animationKey: 'rosca_direta',
      defaultSets: 3,
      defaultReps: '8-12',
      restSeconds: 60,
      instructions: 'Flexione os cotovelos sem mover o ombro e leve a barra ate proximo dos ombros.',
      commonMistakes: ['Balancar o tronco', 'Abrir os cotovelos', 'Descer rapido demais'],
      tips: ['Fixe os cotovelos', 'Suba em um tempo', 'Volte em dois tempos'],
    },
    {
      id: 'rosca_alternada',
      name: 'Rosca Alternada',
      aliases: ['alternate curl', 'rosca alternada com halteres'],
      equipment: 'halter',
      difficulty: 'iniciante',
      animationKey: 'rosca_alternada',
      defaultSets: 3,
      defaultReps: '10-12 por braco',
      restSeconds: 60,
      instructions: 'Alterne os lados girando a palma para cima durante a subida.',
      commonMistakes: ['Mover o ombro para frente', 'Roubar com o quadril', 'Nao completar a extensao'],
      tips: ['Supine a mao ao subir', 'Controle cada lado isoladamente', 'Evite pressa'],
    },
    {
      id: 'rosca_martelo',
      name: 'Rosca Martelo',
      aliases: ['hammer curl'],
      equipment: 'halter',
      difficulty: 'iniciante',
      animationKey: 'rosca_martelo',
      defaultSets: 3,
      defaultReps: '10-12',
      restSeconds: 60,
      instructions: 'Com pegada neutra, flexione os cotovelos mantendo os halteres paralelos ao corpo.',
      commonMistakes: ['Abrir os cotovelos', 'Perder a pegada neutra', 'Usar impulso'],
      tips: ['Suba com controle', 'Mantenha o punho firme', 'Desca ate quase estender'],
    },
  ],
  triceps: [
    {
      id: 'triceps_polia',
      name: 'Triceps Polia',
      aliases: ['triceps pulley', 'pushdown', 'triceps corda'],
      equipment: 'cabo',
      difficulty: 'iniciante',
      animationKey: 'triceps_polia',
      defaultSets: 3,
      defaultReps: '10-15',
      restSeconds: 60,
      instructions: 'Empurre a barra ou corda para baixo mantendo os cotovelos fixos ao lado do tronco.',
      commonMistakes: ['Abrir os cotovelos', 'Usar o tronco para empurrar', 'Nao estender totalmente'],
      tips: ['Trave o ombro', 'Segure a extensao final', 'Retorne controlando a carga'],
    },
    {
      id: 'triceps_testa',
      name: 'Triceps Testa',
      aliases: ['skull crusher', 'triceps testa com barra'],
      equipment: 'barra',
      difficulty: 'intermediario',
      animationKey: 'triceps_testa',
      defaultSets: 3,
      defaultReps: '8-12',
      restSeconds: 75,
      instructions: 'Deitado no banco, flexione apenas os cotovelos e leve a barra proximo a testa antes de estender.',
      commonMistakes: ['Descer muito aberto', 'Mover o ombro junto', 'Perder controle na fase negativa'],
      tips: ['Cotovelos apontando para cima', 'Use carga que permita controle', 'Expire na subida'],
    },
    {
      id: 'mergulho',
      name: 'Mergulho',
      aliases: ['mergulho no banco', 'bench dip', 'dip'],
      equipment: 'banco',
      difficulty: 'iniciante',
      animationKey: 'mergulho',
      defaultSets: 3,
      defaultReps: '10-15',
      restSeconds: 60,
      instructions: 'Apoie as maos no banco, desca o corpo dobrando os cotovelos e suba estendendo os bracos.',
      commonMistakes: ['Descer demais e forcar o ombro', 'Afastar muito o quadril do banco', 'Movimento curto'],
      tips: ['Mantenha os ombros para tras', 'Cotovelos apontando para tras', 'Use amplitude confortavel'],
    },
  ],
  abdomen: [
    {
      id: 'abdominal_crunch',
      name: 'Abdominal Crunch',
      aliases: ['crunch abdominal', 'crunch'],
      equipment: 'peso corporal',
      difficulty: 'iniciante',
      animationKey: 'abdominal_crunch',
      defaultSets: 3,
      defaultReps: '15-20',
      restSeconds: 45,
      instructions: 'Eleve o tronco tirando as escapulas do chao e retorne sem relaxar totalmente o abdomen.',
      commonMistakes: ['Puxar o pescoco', 'Subir demais e usar o quadril', 'Perder a respiracao'],
      tips: ['Olhe para o teto', 'Expire ao subir', 'Mantenha lombar estavel'],
    },
    {
      id: 'prancha',
      name: 'Prancha',
      aliases: ['plank'],
      equipment: 'peso corporal',
      difficulty: 'iniciante',
      animationKey: 'prancha',
      defaultSets: 3,
      defaultReps: '30-45 s',
      restSeconds: 45,
      instructions: 'Apoie antebracos e pontas dos pes, mantendo o corpo alinhado e o abdomen firme.',
      commonMistakes: ['Quadril alto demais', 'Quadril caido', 'Segurar a respiracao'],
      tips: ['Contraia gluteos', 'Empurre o chao com os antebracos', 'Respire curto e continuo'],
    },
    {
      id: 'elevacao_pernas',
      name: 'Elevacao de Pernas',
      aliases: ['leg raise', 'elevacao de pernas'],
      equipment: 'peso corporal',
      difficulty: 'intermediario',
      animationKey: 'elevacao_pernas',
      defaultSets: 3,
      defaultReps: '12-15',
      restSeconds: 60,
      instructions: 'Eleve as pernas estendidas sem tirar a lombar do apoio e desca controlando.',
      commonMistakes: ['Arquear a lombar', 'Embalar as pernas', 'Descer rapido demais'],
      tips: ['Pressione a lombar contra o solo', 'Suba ate onde mantiver controle', 'Use as maos de apoio se preciso'],
    },
  ],
  cardio: [
    {
      id: 'esteira',
      name: 'Esteira',
      aliases: ['treadmill'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'esteira',
      defaultSets: 1,
      defaultReps: '20-30 min',
      restSeconds: 0,
      durationSeconds: 1200,
      instructions: 'Caminhe ou corra mantendo o tronco ereto, passada estavel e ritmo continuo.',
      commonMistakes: ['Segurar nas barras o tempo todo', 'Passadas muito longas', 'Olhar para baixo'],
      tips: ['Ajuste a velocidade gradualmente', 'Pouse o pe abaixo do quadril', 'Respire com cadencia'],
    },
    {
      id: 'bicicleta',
      name: 'Bicicleta',
      aliases: ['bicicleta ergonometrica', 'bike', 'cycling'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'bicicleta',
      defaultSets: 1,
      defaultReps: '20-30 min',
      restSeconds: 0,
      durationSeconds: 1200,
      instructions: 'Pedale com postura alta, joelho alinhado e cadencia constante.',
      commonMistakes: ['Banco desajustado', 'Pedalar com ombros tensos', 'Ritmo irregular'],
      tips: ['Ajuste altura do banco', 'Empurre e puxe o pedal', 'Mantenha respiracao ritmada'],
    },
    {
      id: 'eliptico',
      name: 'Eliptico',
      aliases: ['elliptical'],
      equipment: 'maquina',
      difficulty: 'iniciante',
      animationKey: 'eliptico',
      defaultSets: 1,
      defaultReps: '15-25 min',
      restSeconds: 0,
      durationSeconds: 900,
      instructions: 'Mantenha o movimento continuo usando pernas e bracos de forma sincronizada.',
      commonMistakes: ['Dar passos curtos demais', 'Projetar o tronco para frente', 'Prender a respiracao'],
      tips: ['Apoie o medio do pe', 'Use os bracos para dar ritmo', 'Aumente resistencia progressivamente'],
    },
  ],
};

const muscleGroupDefaults = {
  peito: 'supino_reto',
  costas: 'puxada_frontal',
  pernas: 'agachamento_livre',
  ombros: 'desenvolvimento_ombros',
  biceps: 'rosca_direta',
  triceps: 'triceps_polia',
  abdomen: 'abdominal_crunch',
  cardio: 'esteira',
};

const flatDefinitions = Object.values(exerciseDefinitionsByGroup).flat();
const byId = new Map(flatDefinitions.map((exercise) => [exercise.id, exercise]));

function getDefaultExerciseConfig(objective, level, muscleGroup) {
  const configs = {
    emagrecer: { sets: level === 'iniciante' ? 3 : 4, reps: '15-20', restSeconds: 45 },
    ganhar_massa: { sets: level === 'avancado' ? 5 : 4, reps: '8-12', restSeconds: 90 },
    condicionamento: { sets: 3, reps: '12-15', restSeconds: 60 },
    saude: { sets: 3, reps: '12-15', restSeconds: 60 },
    forca: { sets: level === 'avancado' ? 5 : 4, reps: '4-6', restSeconds: 120 },
  };

  if (muscleGroup === 'cardio') {
    return { sets: 1, reps: '20-30 min', restSeconds: 0 };
  }

  return configs[objective] || configs.saude;
}

function matchesExerciseName(definition, normalizedName) {
  if (normalizeText(definition.name) === normalizedName) return true;
  return (definition.aliases || []).some((alias) => normalizeText(alias) === normalizedName);
}

function findExerciseById(id) {
  return byId.get(String(id || '').trim()) || null;
}

function findExerciseByName(name) {
  const normalizedName = normalizeText(name);
  return flatDefinitions.find((definition) => matchesExerciseName(definition, normalizedName)) || null;
}

function inferAnimationKey(name, muscleGroup) {
  const normalizedName = normalizeText(name);
  const exactMatch = findExerciseByName(normalizedName) || findExerciseByName(name);
  if (exactMatch?.animationKey) return exactMatch.animationKey;

  if (normalizedName.includes('supino reto')) return 'supino_reto';
  if (normalizedName.includes('supino inclinado')) return 'supino_inclinado';
  if (normalizedName.includes('crucifixo')) return 'crucifixo';
  if (normalizedName.includes('flexao')) return 'flexao';
  if (normalizedName.includes('puxada frontal')) return 'puxada_frontal';
  if (normalizedName.includes('remada baixa') || normalizedName.includes('cabo baixo')) return 'remada_baixa';
  if (normalizedName.includes('remada curvada')) return 'remada_curvada';
  if (normalizedName.includes('pull up') || normalizedName.includes('barra fixa') || normalizedName.includes('pulldown')) return 'pulldown';
  if (normalizedName.includes('agachamento')) return 'agachamento_livre';
  if (normalizedName.includes('leg press')) return 'leg_press';
  if (normalizedName.includes('extensora')) return 'cadeira_extensora';
  if (normalizedName.includes('flexora')) return 'mesa_flexora';
  if (normalizedName.includes('afundo') || normalizedName.includes('passada')) return 'afundo';
  if (normalizedName.includes('panturrilha')) return 'panturrilha';
  if (normalizedName.includes('desenvolvimento')) return 'desenvolvimento_ombros';
  if (normalizedName.includes('lateral')) return 'elevacao_lateral';
  if (normalizedName.includes('frontal')) return 'elevacao_frontal';
  if (normalizedName.includes('rosca direta')) return 'rosca_direta';
  if (normalizedName.includes('rosca alternada')) return 'rosca_alternada';
  if (normalizedName.includes('rosca martelo')) return 'rosca_martelo';
  if (normalizedName.includes('triceps polia') || normalizedName.includes('pulley') || normalizedName.includes('pushdown')) return 'triceps_polia';
  if (normalizedName.includes('triceps testa')) return 'triceps_testa';
  if (normalizedName.includes('mergulho')) return 'mergulho';
  if (normalizedName.includes('prancha')) return 'prancha';
  if (normalizedName.includes('crunch') || normalizedName.includes('abdominal')) return 'abdominal_crunch';
  if (normalizedName.includes('elevacao de pernas')) return 'elevacao_pernas';
  if (normalizedName.includes('esteira')) return 'esteira';
  if (normalizedName.includes('bicicleta')) return 'bicicleta';
  if (normalizedName.includes('eliptico')) return 'eliptico';

  return muscleGroupDefaults[muscleGroup] || 'supino_reto';
}

function buildExerciseForWorkout(exercise, overrides = {}) {
  const base = typeof exercise === 'string'
    ? findExerciseById(exercise) || findExerciseByName(exercise)
    : exercise;

  if (!base) return null;

  const objective = overrides.objective || '';
  const level = overrides.level || 'iniciante';
  const defaultConfig = getDefaultExerciseConfig(objective, level, base.muscleGroup);
  const reps = overrides.reps || base.defaultReps || defaultConfig.reps;
  const sets = overrides.sets ?? base.defaultSets ?? defaultConfig.sets;
  const restSeconds = overrides.restSeconds ?? overrides.restTime ?? base.restSeconds ?? defaultConfig.restSeconds;

  return {
    exerciseId: base.id,
    id: base.id,
    name: base.name,
    muscleGroup: base.muscleGroup,
    equipment: base.equipment,
    difficulty: base.difficulty,
    animationKey: overrides.animationKey || base.animationKey || inferAnimationKey(base.name, base.muscleGroup),
    instructions: base.instructions,
    commonMistakes: [...(base.commonMistakes || [])],
    tips: [...(base.tips || [])],
    sets,
    reps,
    restSeconds,
    restTime: restSeconds,
    duration: overrides.duration ?? base.durationSeconds ?? 0,
    order: overrides.order ?? 0,
  };
}

const exerciseLibrary = flatDefinitions.map((exercise) => buildExerciseForWorkout(exercise, {
  sets: exercise.defaultSets,
  reps: exercise.defaultReps,
  restSeconds: exercise.restSeconds,
}));

module.exports = {
  exerciseDefinitionsByGroup,
  exerciseLibrary,
  normalizeText,
  findExerciseById,
  findExerciseByName,
  inferAnimationKey,
  buildExerciseForWorkout,
  getDefaultExerciseConfig,
};
