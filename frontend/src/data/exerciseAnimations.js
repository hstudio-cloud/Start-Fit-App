const animationLibrary = {
  supino_reto: { key: 'supino_reto', label: 'Supino reto', family: 'bench', muscleGroup: 'peito', aliases: ['supino reto', 'bench press'] },
  supino_inclinado: { key: 'supino_inclinado', label: 'Supino inclinado', family: 'incline-bench', muscleGroup: 'peito', aliases: ['supino inclinado', 'incline press'] },
  crucifixo: { key: 'crucifixo', label: 'Crucifixo', family: 'fly', muscleGroup: 'peito', aliases: ['crucifixo', 'fly'] },
  flexao: { key: 'flexao', label: 'Flexao', family: 'push-up', muscleGroup: 'peito', aliases: ['flexao', 'push up', 'push-up'] },
  puxada_frontal: { key: 'puxada_frontal', label: 'Puxada frontal', family: 'lat-pulldown', muscleGroup: 'costas', aliases: ['puxada frontal', 'lat pulldown'] },
  remada_baixa: { key: 'remada_baixa', label: 'Remada baixa', family: 'row', muscleGroup: 'costas', aliases: ['remada baixa', 'cabo baixo', 'seated row'] },
  remada_curvada: { key: 'remada_curvada', label: 'Remada curvada', family: 'bent-row', muscleGroup: 'costas', aliases: ['remada curvada', 'bent row'] },
  pulldown: { key: 'pulldown', label: 'Pulldown', family: 'pull-up', muscleGroup: 'costas', aliases: ['pulldown', 'barra fixa', 'pull up', 'pull-up'] },
  agachamento_livre: { key: 'agachamento_livre', label: 'Agachamento livre', family: 'squat', muscleGroup: 'pernas', aliases: ['agachamento livre', 'agachamento'] },
  leg_press: { key: 'leg_press', label: 'Leg press', family: 'leg-press', muscleGroup: 'pernas', aliases: ['leg press'] },
  cadeira_extensora: { key: 'cadeira_extensora', label: 'Cadeira extensora', family: 'leg-extension', muscleGroup: 'pernas', aliases: ['cadeira extensora', 'extensora'] },
  mesa_flexora: { key: 'mesa_flexora', label: 'Mesa flexora', family: 'leg-curl', muscleGroup: 'pernas', aliases: ['mesa flexora', 'cadeira flexora', 'flexora'] },
  afundo: { key: 'afundo', label: 'Afundo', family: 'lunge', muscleGroup: 'pernas', aliases: ['afundo', 'passada', 'lunge'] },
  panturrilha: { key: 'panturrilha', label: 'Panturrilha', family: 'calf', muscleGroup: 'pernas', aliases: ['panturrilha', 'calf raise'] },
  desenvolvimento_ombros: { key: 'desenvolvimento_ombros', label: 'Desenvolvimento', family: 'shoulder-press', muscleGroup: 'ombros', aliases: ['desenvolvimento', 'shoulder press'] },
  elevacao_lateral: { key: 'elevacao_lateral', label: 'Elevacao lateral', family: 'lateral-raise', muscleGroup: 'ombros', aliases: ['elevacao lateral', 'lateral raise'] },
  elevacao_frontal: { key: 'elevacao_frontal', label: 'Elevacao frontal', family: 'front-raise', muscleGroup: 'ombros', aliases: ['elevacao frontal', 'front raise'] },
  rosca_direta: { key: 'rosca_direta', label: 'Rosca direta', family: 'curl', muscleGroup: 'biceps', aliases: ['rosca direta', 'barbell curl'] },
  rosca_alternada: { key: 'rosca_alternada', label: 'Rosca alternada', family: 'alternating-curl', muscleGroup: 'biceps', aliases: ['rosca alternada', 'alternate curl'] },
  rosca_martelo: { key: 'rosca_martelo', label: 'Rosca martelo', family: 'hammer-curl', muscleGroup: 'biceps', aliases: ['rosca martelo', 'hammer curl'] },
  triceps_polia: { key: 'triceps_polia', label: 'Triceps polia', family: 'pushdown', muscleGroup: 'triceps', aliases: ['triceps polia', 'triceps pulley', 'pushdown'] },
  triceps_testa: { key: 'triceps_testa', label: 'Triceps testa', family: 'skull-crusher', muscleGroup: 'triceps', aliases: ['triceps testa', 'skull crusher'] },
  mergulho: { key: 'mergulho', label: 'Mergulho', family: 'dip', muscleGroup: 'triceps', aliases: ['mergulho', 'dip', 'bench dip'] },
  abdominal_crunch: { key: 'abdominal_crunch', label: 'Abdominal crunch', family: 'crunch', muscleGroup: 'abdomen', aliases: ['abdominal crunch', 'crunch'] },
  prancha: { key: 'prancha', label: 'Prancha', family: 'plank', muscleGroup: 'abdomen', aliases: ['prancha', 'plank'] },
  elevacao_pernas: { key: 'elevacao_pernas', label: 'Elevacao de pernas', family: 'leg-raise', muscleGroup: 'abdomen', aliases: ['elevacao de pernas', 'leg raise'] },
  esteira: { key: 'esteira', label: 'Esteira', family: 'treadmill', muscleGroup: 'cardio', aliases: ['esteira', 'treadmill'] },
  bicicleta: { key: 'bicicleta', label: 'Bicicleta', family: 'bike', muscleGroup: 'cardio', aliases: ['bicicleta', 'bike'] },
  eliptico: { key: 'eliptico', label: 'Eliptico', family: 'elliptical', muscleGroup: 'cardio', aliases: ['eliptico', 'elliptical'] },
};

const muscleGroupFallbacks = {
  peito: 'supino_reto',
  costas: 'puxada_frontal',
  pernas: 'agachamento_livre',
  ombros: 'desenvolvimento_ombros',
  biceps: 'rosca_direta',
  triceps: 'triceps_polia',
  abdomen: 'abdominal_crunch',
  cardio: 'esteira',
};

export function normalizeExerciseName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findByNormalizedName(name) {
  const normalized = normalizeExerciseName(name);
  return Object.values(animationLibrary).find((entry) => (
    normalizeExerciseName(entry.label) === normalized ||
    entry.aliases.some((alias) => normalizeExerciseName(alias) === normalized)
  ));
}

function findByPartialName(name) {
  const normalized = normalizeExerciseName(name);
  return Object.values(animationLibrary).find((entry) => (
    entry.aliases.some((alias) => normalized.includes(normalizeExerciseName(alias))) ||
    normalized.includes(normalizeExerciseName(entry.label))
  ));
}

export function resolveExerciseAnimation(exercise = {}) {
  const key = exercise.animationKey && animationLibrary[exercise.animationKey]
    ? exercise.animationKey
    : null;

  const byName = findByNormalizedName(exercise.exerciseName || exercise.name) || findByPartialName(exercise.exerciseName || exercise.name);
  const fallbackKey = muscleGroupFallbacks[exercise.muscleGroup] || 'supino_reto';
  const resolved = animationLibrary[key] || byName || animationLibrary[fallbackKey];

  return {
    ...resolved,
    source: key ? 'animationKey' : byName ? 'name' : 'muscleGroup',
  };
}

export function buildExercisePresentation(exercise = {}) {
  const animation = resolveExerciseAnimation(exercise);
  return {
    ...exercise,
    animation,
    commonMistakes: exercise.commonMistakes?.length ? exercise.commonMistakes : ['Mantenha o controle do movimento', 'Evite compensacoes com impulso', 'Respeite a amplitude segura'],
    tips: exercise.tips?.length ? exercise.tips : ['Respire de forma ritmada', 'Priorize tecnica antes de carga', 'Ajuste a postura antes de iniciar'],
    restSeconds: exercise.restSeconds ?? exercise.restTime ?? 60,
  };
}

export { animationLibrary, muscleGroupFallbacks };
