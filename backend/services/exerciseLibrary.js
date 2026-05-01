const { exerciseDatabase } = require('./workoutGenerator');

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

const exerciseLibrary = Object.entries(exerciseDatabase).flatMap(([muscleGroup, exercises]) =>
  exercises.map((exercise, index) => ({
    id: `${muscleGroup}_${index + 1}`,
    name: exercise.name,
    muscleGroup,
    equipment: exercise.equipment,
    restTime: exercise.restTime,
    difficulty: exercise.difficulty,
    instructions: exercise.instructions,
    animationKey: inferAnimationKey(exercise.name, muscleGroup),
    videoUrl: exercise.videoUrl || '',
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
    sets: overrides.sets ?? 4,
    reps: overrides.reps ?? '8-12',
    duration: overrides.duration ?? 0,
    order: overrides.order ?? 0,
  };
}

module.exports = { exerciseLibrary, findExerciseByName, buildExerciseForWorkout, inferAnimationKey };
