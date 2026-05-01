const { exerciseDatabase } = require('./workoutGenerator');

const mediaCatalog = {
  push: {
    label: 'Bench press',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bench_press_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bench_press_-_exercise_demonstration_video.webm',
  },
  pull: {
    label: 'Pull-ups',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pull-ups_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pull-ups_-_exercise_demonstration_video.webm',
  },
  squat: {
    label: 'Squat',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Squat_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm',
  },
  lunge: {
    label: 'Squat',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Squat_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm',
  },
  curl: {
    label: 'Shoulder press',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_press_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm',
  },
  press: {
    label: 'Shoulder press',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Shoulder_press_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Shoulder_press_-_exercise_demonstration_video.webm',
  },
  plank: {
    label: 'Leg raises',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leg_raises_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Leg_raises_-_exercise_demonstration_video.webm',
  },
  crunch: {
    label: 'Leg raises',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leg_raises_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Leg_raises_-_exercise_demonstration_video.webm',
  },
  calf: {
    label: 'Squat',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Squat_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Squat_-_exercise_demonstration_video.webm',
  },
  hinge: {
    label: 'Deadlift',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Deadlift_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Deadlift_-_exercise_demonstration_video.webm',
  },
  generic: {
    label: 'Bent-over row',
    videoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bent-over_row_-_exercise_demonstration_video.webm',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bent-over_row_-_exercise_demonstration_video.webm',
  },
};

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
  const key = inferAnimationKey(name, muscleGroup);
  const media = mediaCatalog[key] || mediaCatalog.generic;
  return {
    animationKey: key,
    videoUrl: media.videoUrl,
    videoSourceUrl: media.sourceUrl,
    videoAttribution: 'Video CC BY 3.0 via Wikimedia Commons / FitnessScape',
    videoLabel: media.label,
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
