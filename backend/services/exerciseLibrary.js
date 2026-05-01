const { exerciseDatabase } = require('./workoutGenerator');

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function commonsAsset(kind, label, fileName, sourcePage, attribution) {
  return {
    mediaKind: kind,
    videoUrl: `https://commons.wikimedia.org/wiki/Special:FilePath/${fileName}`,
    videoSourceUrl: sourcePage,
    videoAttribution: attribution,
    videoLabel: label,
  };
}

const mediaByExercise = {
  'supino reto com barra': commonsAsset(
    'video',
    'Bench press',
    'Bench_press_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Bench_press_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'supino inclinado com halteres': commonsAsset(
    'video',
    'Incline press',
    'Incline_press_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Incline_press_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'flexao de braco': commonsAsset(
    'video',
    'Push-up drill',
    'Conditioning_Drill-_Eight_Count_T_Push-Up.webm',
    'https://commons.wikimedia.org/wiki/File:Conditioning_Drill-_Eight_Count_T_Push-Up.webm',
    'Video via Wikimedia Commons'
  ),
  'crucifixo com halteres': commonsAsset(
    'image',
    'Dumbbell flye',
    'DumbbellFlye.gif',
    'https://commons.wikimedia.org/wiki/Category:Chest_fly',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'supino declinado': commonsAsset(
    'video',
    'Bench press',
    'Bench_press_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Bench_press_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'crossover no cabo': commonsAsset(
    'image',
    'Cable crossover',
    'Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
    'https://commons.wikimedia.org/wiki/File:Chest_flies_with_cable_machine_-_cable_crossover_flies.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons'
  ),
  'puxada frontal': commonsAsset(
    'image',
    'Lat pulldown',
    'Girl_doing_lat_pulldown_exercise.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_doing_lat_pulldown_exercise.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'remada curvada com barra': commonsAsset(
    'video',
    'Bent-over row',
    'Bent-over_row_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Bent-over_row_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'pull-up (barra fixa)': commonsAsset(
    'video',
    'Pull-ups',
    'Pull-ups_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Pull-ups_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'remada com halter': commonsAsset(
    'image',
    'Dumbbell row',
    'DumbbellBentOverRow.JPG',
    'https://commons.wikimedia.org/wiki/File:DumbbellBentOverRow.JPG',
    'Image CC BY-SA 3.0 via Wikimedia Commons'
  ),
  'levantamento terra': commonsAsset(
    'video',
    'Deadlift',
    'Deadlift_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'puxada no cabo baixo': commonsAsset(
    'image',
    'Cable row reference',
    'Girl_doing_lat_pulldown_exercise.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_doing_lat_pulldown_exercise.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'desenvolvimento com halteres': commonsAsset(
    'image',
    'Dumbbell shoulder press',
    'Girl_doing_dumbbell_shoulder_press_02.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_doing_dumbbell_shoulder_press_02.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'elevacao lateral': commonsAsset(
    'image',
    'Lateral raise',
    'DumbbellLateralRaise.JPG',
    'https://commons.wikimedia.org/wiki/File:DumbbellLateralRaise.JPG',
    'Image CC BY-SA 3.0 via Wikimedia Commons'
  ),
  'elevacao frontal': commonsAsset(
    'image',
    'Front dumbbell raise',
    'Girl_exercising_with_front_dumbbell_raises.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_exercising_with_front_dumbbell_raises.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / PTPioneer'
  ),
  'desenvolvimento com barra': commonsAsset(
    'video',
    'Shoulder press',
    'Shoulder_press_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'crucifixo invertido': commonsAsset(
    'image',
    'Shoulder rear-delt reference',
    'Girl_exercising_shoulders.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_exercising_shoulders.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'rosca direta com barra': commonsAsset(
    'image',
    'Standing barbell curl',
    'Wide-grip-standing-biceps-curl-1.gif',
    'https://commons.wikimedia.org/wiki/File:Wide-grip-standing-biceps-curl-1.gif',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'rosca alternada com halteres': commonsAsset(
    'image',
    'Alternate biceps curl',
    'Alternate-bicep-curl-1.gif',
    'https://commons.wikimedia.org/wiki/File:Alternate-bicep-curl-1.png',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'rosca martelo': commonsAsset(
    'image',
    'Hammer curl',
    'Hammer-curls-with-rope-1.gif',
    'https://commons.wikimedia.org/wiki/File:Hammer-curls-with-rope-1.gif',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'rosca concentrada': commonsAsset(
    'image',
    'Concentration curl',
    'Seated-close-grip-concentration-curls-1.gif',
    'https://commons.wikimedia.org/wiki/File:Seated-close-grip-concentration-curls-1.gif',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'rosca no cabo': commonsAsset(
    'image',
    'Cable bicep curl',
    'Girl_doing_cable_bicep_curl_exercise.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_doing_cable_bicep_curl_exercise.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'triceps testa': commonsAsset(
    'image',
    'Dumbbell triceps extension',
    'DumbbellTricepsExtension.JPG',
    'https://commons.wikimedia.org/wiki/File:DumbbellTricepsExtension.JPG',
    'Image CC BY-SA 3.0 via Wikimedia Commons'
  ),
  'triceps pulley': commonsAsset(
    'image',
    'Cable triceps extension',
    'Cable_overhead_biceps_extension,_blonde_girl_is_exercising_in_the_gym.jpg',
    'https://commons.wikimedia.org/wiki/File:Cable_overhead_biceps_extension,_blonde_girl_is_exercising_in_the_gym.jpg',
    'Photo via Wikimedia Commons'
  ),
  'mergulho no banco': commonsAsset(
    'image',
    'Bench dips',
    'Bench-dips-1.gif',
    'https://commons.wikimedia.org/wiki/File:Bench-dips-1.png',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'extensao com halter': commonsAsset(
    'image',
    'Dumbbell triceps extension',
    'DumbbellTricepsExtension.JPG',
    'https://commons.wikimedia.org/wiki/File:DumbbellTricepsExtension.JPG',
    'Image CC BY-SA 3.0 via Wikimedia Commons'
  ),
  'triceps coice': commonsAsset(
    'image',
    'Triceps kickback',
    'Triceps-kickback-1.gif',
    'https://commons.wikimedia.org/wiki/File:Triceps-kickback-1.gif',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  'agachamento livre': commonsAsset(
    'video',
    'Squat',
    'Squat_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'leg press 45°': commonsAsset(
    'image',
    'Leg press',
    'Leg_press.jpg',
    'https://commons.wikimedia.org/wiki/File:Leg_press.jpg',
    'Photo via Wikimedia Commons'
  ),
  'afundo com halteres': commonsAsset(
    'image',
    'Dumbbell lunge',
    'Dumbbell_lunges.jpg',
    'https://commons.wikimedia.org/wiki/File:Dumbbell_lunges.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / PTPioneer'
  ),
  'cadeira extensora': commonsAsset(
    'video',
    'Leg extension',
    'Muscle_Strengthening_at_the_Gym_-_Leg_Extension.webm',
    'https://commons.wikimedia.org/wiki/File:Muscle_Strengthening_at_the_Gym_-_Leg_Extension.webm',
    'Video via Wikimedia Commons / CDC'
  ),
  'cadeira flexora': commonsAsset(
    'video',
    'Leg curl',
    'Muscle_Strengthening_at_the_Gym_-_Leg_Curl.webm',
    'https://commons.wikimedia.org/wiki/Category:Leg_curls',
    'Video via Wikimedia Commons'
  ),
  'panturrilha em pe': commonsAsset(
    'image',
    'Standing calf raise',
    'Standing-calf-raises-1.gif',
    'https://commons.wikimedia.org/wiki/File:Standing-calf-raises-1.gif',
    'Animation CC BY-SA via Wikimedia Commons / Everkinetic'
  ),
  stiff: commonsAsset(
    'video',
    'Deadlift',
    'Deadlift_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'agachamento sumo': commonsAsset(
    'video',
    'Squat',
    'Squat_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  prancha: commonsAsset(
    'image',
    'Plank',
    'Girl_exercising_doing_a_plank.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_exercising_doing_a_plank.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'crunch abdominal': commonsAsset(
    'image',
    'Crunch',
    'Crunch.JPG',
    'https://commons.wikimedia.org/wiki/Category:Crunches',
    'Photo via Wikimedia Commons'
  ),
  'elevacao de pernas': commonsAsset(
    'video',
    'Leg raises',
    'Leg_raises_-_exercise_demonstration_video.webm',
    'https://commons.wikimedia.org/wiki/File:Leg_raises_-_exercise_demonstration_video.webm',
    'Video CC BY 3.0 via Wikimedia Commons / FitnessScape'
  ),
  'russian twist': commonsAsset(
    'image',
    'Abdominal reference',
    'Crunch.JPG',
    'https://commons.wikimedia.org/wiki/Category:Crunches',
    'Photo via Wikimedia Commons'
  ),
  'mountain climber': commonsAsset(
    'image',
    'Core floor reference',
    'Girl_exercising_doing_a_plank.jpg',
    'https://commons.wikimedia.org/wiki/File:Girl_exercising_doing_a_plank.jpg',
    'Photo CC BY 2.0 via Wikimedia Commons / Tyler Read'
  ),
  'abdominal na maquina': commonsAsset(
    'image',
    'Crunch reference',
    'Crunch.JPG',
    'https://commons.wikimedia.org/wiki/Category:Crunches',
    'Photo via Wikimedia Commons'
  ),
  esteira: commonsAsset(
    'image',
    'Cardio treadmill',
    'Girl_walking_on_treadmill.jpg',
    'https://commons.wikimedia.org/wiki/Category:Women_exercising',
    'Photo via Wikimedia Commons'
  ),
  'bicicleta ergometrica': commonsAsset(
    'image',
    'Exercise bike',
    'Girl_exercising_on_spin_bike.jpg',
    'https://commons.wikimedia.org/wiki/Category:Women_exercising',
    'Photo via Wikimedia Commons'
  ),
  burpee: commonsAsset(
    'video',
    'Push-up drill reference',
    'Conditioning_Drill-_Eight_Count_T_Push-Up.webm',
    'https://commons.wikimedia.org/wiki/File:Conditioning_Drill-_Eight_Count_T_Push-Up.webm',
    'Video via Wikimedia Commons'
  ),
  'jumping jacks': commonsAsset(
    'image',
    'Cardio reference',
    'Jumping-jack-1.gif',
    'https://commons.wikimedia.org/wiki/Category:Jumping_jacks',
    'Animation via Wikimedia Commons'
  ),
  'pular corda': commonsAsset(
    'image',
    'Jump rope',
    'Skipping-rope-1.gif',
    'https://commons.wikimedia.org/wiki/Category:Skipping_rope',
    'Animation via Wikimedia Commons'
  ),
  eliptico: commonsAsset(
    'image',
    'Elliptical cardio',
    'Girl_doing_elliptical_cardio_exercise.jpg',
    'https://commons.wikimedia.org/wiki/Category:Women_exercising',
    'Photo via Wikimedia Commons'
  ),
};

const fallbackMediaByAnimation = {
  push: mediaByExercise['supino reto com barra'],
  pull: mediaByExercise['remada curvada com barra'],
  squat: mediaByExercise['agachamento livre'],
  lunge: mediaByExercise['afundo com halteres'],
  curl: mediaByExercise['rosca alternada com halteres'],
  press: mediaByExercise['desenvolvimento com barra'],
  plank: mediaByExercise.prancha,
  crunch: mediaByExercise['crunch abdominal'],
  calf: mediaByExercise['panturrilha em pe'],
  hinge: mediaByExercise.stiff,
  generic: mediaByExercise['remada curvada com barra'],
};

const exerciseMediaMatchers = [
  { terms: ['supino reto'], media: mediaByExercise['supino reto com barra'] },
  { terms: ['supino inclinado'], media: mediaByExercise['supino inclinado com halteres'] },
  { terms: ['flex'], media: mediaByExercise['flexao de braco'] },
  { terms: ['crucifixo com'], media: mediaByExercise['crucifixo com halteres'] },
  { terms: ['supino declinado'], media: mediaByExercise['supino declinado'] },
  { terms: ['crossover'], media: mediaByExercise['crossover no cabo'] },
  { terms: ['puxada frontal'], media: mediaByExercise['puxada frontal'] },
  { terms: ['remada curvada'], media: mediaByExercise['remada curvada com barra'] },
  { terms: ['pull-up', 'barra fixa'], media: mediaByExercise['pull-up (barra fixa)'] },
  { terms: ['remada com halter'], media: mediaByExercise['remada com halter'] },
  { terms: ['levantamento terra'], media: mediaByExercise['levantamento terra'] },
  { terms: ['cabo baixo'], media: mediaByExercise['puxada no cabo baixo'] },
  { terms: ['desenvolvimento com halteres'], media: mediaByExercise['desenvolvimento com halteres'] },
  { terms: ['eleva', 'lateral'], media: mediaByExercise['elevacao lateral'] },
  { terms: ['eleva', 'frontal'], media: mediaByExercise['elevacao frontal'] },
  { terms: ['desenvolvimento com barra'], media: mediaByExercise['desenvolvimento com barra'] },
  { terms: ['crucifixo invertido'], media: mediaByExercise['crucifixo invertido'] },
  { terms: ['rosca direta'], media: mediaByExercise['rosca direta com barra'] },
  { terms: ['rosca alternada'], media: mediaByExercise['rosca alternada com halteres'] },
  { terms: ['rosca martelo'], media: mediaByExercise['rosca martelo'] },
  { terms: ['rosca concentrada'], media: mediaByExercise['rosca concentrada'] },
  { terms: ['rosca no cabo'], media: mediaByExercise['rosca no cabo'] },
  { terms: ['triceps testa'], media: mediaByExercise['triceps testa'] },
  { terms: ['triceps pulley'], media: mediaByExercise['triceps pulley'] },
  { terms: ['mergulho'], media: mediaByExercise['mergulho no banco'] },
  { terms: ['extensao com halter'], media: mediaByExercise['extensao com halter'] },
  { terms: ['triceps coice'], media: mediaByExercise['triceps coice'] },
  { terms: ['agachamento livre'], media: mediaByExercise['agachamento livre'] },
  { terms: ['leg press'], media: mediaByExercise['leg press 45Â°'] },
  { terms: ['afundo'], media: mediaByExercise['afundo com halteres'] },
  { terms: ['cadeira extensora'], media: mediaByExercise['cadeira extensora'] },
  { terms: ['cadeira flexora'], media: mediaByExercise['cadeira flexora'] },
  { terms: ['panturrilha'], media: mediaByExercise['panturrilha em pe'] },
  { terms: ['stiff'], media: mediaByExercise.stiff },
  { terms: ['sumo'], media: mediaByExercise['agachamento sumo'] },
  { terms: ['prancha'], media: mediaByExercise.prancha },
  { terms: ['crunch'], media: mediaByExercise['crunch abdominal'] },
  { terms: ['elevacao de pernas'], media: mediaByExercise['elevacao de pernas'] },
  { terms: ['russian twist'], media: mediaByExercise['russian twist'] },
  { terms: ['mountain climber'], media: mediaByExercise['mountain climber'] },
  { terms: ['abdominal na'], media: mediaByExercise['abdominal na maquina'] },
  { terms: ['esteira'], media: mediaByExercise.esteira },
  { terms: ['bicicleta'], media: mediaByExercise['bicicleta ergometrica'] },
  { terms: ['burpee'], media: mediaByExercise.burpee },
  { terms: ['jumping jacks'], media: mediaByExercise['jumping jacks'] },
  { terms: ['corda'], media: mediaByExercise['pular corda'] },
  { terms: ['eliptico'], media: mediaByExercise.eliptico },
];

function inferAnimationKey(name, muscleGroup) {
  const lower = `${name} ${muscleGroup}`.toLowerCase();
  if (lower.includes('supino') || lower.includes('flex')) return 'push';
  if (lower.includes('remada') || lower.includes('puxada') || lower.includes('pull-up')) return 'pull';
  if (lower.includes('agach') || lower.includes('leg press')) return 'squat';
  if (lower.includes('afundo')) return 'lunge';
  if (lower.includes('rosca')) return 'curl';
  if (lower.includes('desenvolvimento')) return 'press';
  if (lower.includes('prancha')) return 'plank';
  if (lower.includes('abdominal') || lower.includes('crunch')) return 'crunch';
  if (lower.includes('panturrilha')) return 'calf';
  if (lower.includes('terra') || lower.includes('stiff')) return 'hinge';
  return 'generic';
}

function resolveExerciseMedia(name, muscleGroup) {
  const animationKey = inferAnimationKey(name, muscleGroup);
  const normalizedName = normalizeText(name);
  const exact = mediaByExercise[normalizedName];
  const matched = exerciseMediaMatchers.find((entry) => entry.terms.every((term) => normalizedName.includes(term)));
  const media = exact || matched?.media || fallbackMediaByAnimation[animationKey] || fallbackMediaByAnimation.generic;

  return {
    animationKey,
    mediaKind: media.mediaKind,
    videoUrl: media.videoUrl,
    videoSourceUrl: media.videoSourceUrl,
    videoAttribution: media.videoAttribution,
    videoLabel: media.videoLabel,
  };
}

const exerciseLibrary = Object.entries(exerciseDatabase).flatMap(([muscleGroup, exercises]) =>
  exercises.map((exercise, index) => ({
    ...resolveExerciseMedia(exercise.name, muscleGroup),
    id: `${muscleGroup}_${index + 1}`,
    name: exercise.name,
    muscleGroup,
    equipment: exercise.equipment,
    restTime: exercise.restTime,
    difficulty: exercise.difficulty,
    instructions: exercise.instructions,
  }))
);

function findExerciseByName(name) {
  return exerciseLibrary.find((exercise) => exercise.name === name) || null;
}

function buildExerciseForWorkout(exercise, overrides = {}) {
  const base = typeof exercise === 'string' ? findExerciseByName(exercise) : exercise;
  if (!base) return null;
  return {
    exerciseId: base.id,
    name: base.name,
    muscleGroup: base.muscleGroup,
    equipment: base.equipment,
    restTime: base.restTime,
    difficulty: base.difficulty,
    instructions: base.instructions,
    animationKey: base.animationKey,
    mediaKind: base.mediaKind,
    videoUrl: base.videoUrl,
    videoSourceUrl: base.videoSourceUrl,
    videoAttribution: base.videoAttribution,
    videoLabel: base.videoLabel,
    sets: overrides.sets ?? 4,
    reps: overrides.reps ?? '8-12',
    duration: overrides.duration ?? 0,
    order: overrides.order ?? 0,
  };
}

module.exports = { exerciseLibrary, findExerciseByName, buildExerciseForWorkout, inferAnimationKey, resolveExerciseMedia };
