const {
  buildExerciseForWorkout,
  exerciseDefinitionsByGroup,
} = require('./exerciseLibrary');

const getMuscleGroupsForDays = (availableDays, objective) => {
  const days = availableDays.length || 3;

  const splits = {
    1: [['peito', 'costas', 'ombros', 'biceps', 'triceps', 'pernas', 'abdomen']],
    2: [['peito', 'triceps', 'ombros'], ['costas', 'biceps', 'pernas', 'abdomen']],
    3: [['peito', 'triceps', 'ombros'], ['costas', 'biceps'], ['pernas', 'abdomen']],
    4: [['peito', 'triceps'], ['costas', 'biceps'], ['pernas'], ['ombros', 'abdomen']],
    5: [['peito', 'triceps'], ['costas', 'biceps'], ['pernas'], ['ombros'], ['abdomen', 'cardio']],
    6: [['peito'], ['costas'], ['pernas'], ['ombros', 'triceps'], ['biceps', 'abdomen'], ['cardio']],
  };

  let split = splits[Math.min(days, 6)] || splits[3];

  if (objective === 'emagrecer' || objective === 'condicionamento') {
    split = split.map((day) => (day.includes('cardio') ? day : [...day, 'cardio']));
  }

  return split;
};

const getWorkoutName = (muscleGroups, index) => {
  const labels = {
    peito: 'Peito',
    costas: 'Costas',
    ombros: 'Ombros',
    biceps: 'Biceps',
    triceps: 'Triceps',
    pernas: 'Pernas',
    abdomen: 'Abdomen',
    cardio: 'Cardio',
  };

  const primary = labels[muscleGroups[0]] || 'Treino';
  const secondary = muscleGroups[1] ? ` + ${labels[muscleGroups[1]]}` : '';
  return `Treino ${String.fromCharCode(65 + index)} - ${primary}${secondary}`;
};

function getExercisePool(group, level) {
  const exercises = exerciseDefinitionsByGroup[group] || [];

  return exercises.filter((exercise) => {
    if (level === 'iniciante') return exercise.difficulty === 'iniciante';
    if (level === 'intermediario') return exercise.difficulty !== 'avancado';
    return true;
  });
}

function prioritizeFocusedExercises(exercises, group, focusMuscles = []) {
  if (!focusMuscles.includes(group) || exercises.length <= 1) return exercises;
  return [exercises[0], ...exercises, exercises[1] || exercises[0]];
}

const generateWorkouts = (questionnaire = {}) => {
  const {
    objective = 'saude',
    level = 'iniciante',
    availableDays = [1, 3, 5],
    timePerWorkout = 60,
    focusMuscles = [],
  } = questionnaire;

  const split = getMuscleGroupsForDays(availableDays, objective);
  const daysToAssign = availableDays.length ? availableDays : [1, 3, 5];

  return split.map((muscleGroups, workoutIndex) => {
    const exercises = [];
    const maxExercisesPerGroup = timePerWorkout >= 60 ? 3 : 2;

    muscleGroups.forEach((group) => {
      const prioritized = prioritizeFocusedExercises(getExercisePool(group, level), group, focusMuscles);
      const picked = prioritized.slice(0, group === 'cardio' ? 1 : maxExercisesPerGroup);

      picked.forEach((exercise) => {
        const built = buildExerciseForWorkout(exercise, {
          objective,
          level,
          order: exercises.length,
        });

        if (built) exercises.push(built);
      });
    });

    return {
      name: getWorkoutName(muscleGroups, workoutIndex),
      weekDay: daysToAssign[workoutIndex] ?? null,
      exercises,
      objective,
      estimatedDuration: timePerWorkout,
      description: `Plano demo para ${objective.replace('_', ' ')} com foco em ${muscleGroups.join(', ')}.`,
      generatedBy: 'ai',
    };
  });
};

module.exports = { generateWorkouts };
