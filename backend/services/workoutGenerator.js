const exerciseDatabase = {
  peito: [
    { name: 'Supino Reto com Barra', equipment: 'barra', restTime: 90, difficulty: 'intermediario', instructions: 'Deite no banco, segure a barra na largura dos ombros, desça até o peito e empurre.' },
    { name: 'Supino Inclinado com Halteres', equipment: 'halter', restTime: 90, difficulty: 'intermediario', instructions: 'No banco inclinado 45°, segure os halteres e empurre para cima e ao centro.' },
    { name: 'Flexão de Braço', equipment: 'nenhum', restTime: 60, difficulty: 'iniciante', instructions: 'Apoie as mãos no chão na largura dos ombros, desça o peito ao chão e suba.' },
    { name: 'Crucifixo com Halteres', equipment: 'halter', restTime: 75, difficulty: 'intermediario', instructions: 'Deitado no banco, com os braços abertos, junte os halteres na parte superior.' },
    { name: 'Supino Declinado', equipment: 'barra', restTime: 90, difficulty: 'avancado', instructions: 'No banco declinado, empurre a barra para cima trabalhando a parte inferior do peito.' },
    { name: 'Crossover no Cabo', equipment: 'cabo', restTime: 75, difficulty: 'intermediario', instructions: 'Com os cabos altos, cruze os braços na altura do peito.' },
  ],
  costas: [
    { name: 'Puxada Frontal', equipment: 'cabo', restTime: 90, difficulty: 'iniciante', instructions: 'Segure a barra larga, puxe até a parte superior do peito, retorne controlado.' },
    { name: 'Remada Curvada com Barra', equipment: 'barra', restTime: 90, difficulty: 'intermediario', instructions: 'Inclinado para frente, puxe a barra em direção ao abdômen.' },
    { name: 'Pull-up (Barra Fixa)', equipment: 'barra', restTime: 120, difficulty: 'avancado', instructions: 'Pendurado na barra, puxe o corpo até o queixo ultrapassar a barra.' },
    { name: 'Remada com Halter', equipment: 'halter', restTime: 75, difficulty: 'iniciante', instructions: 'Apoie um joelho no banco, puxe o halter até a cintura.' },
    { name: 'Levantamento Terra', equipment: 'barra', restTime: 120, difficulty: 'avancado', instructions: 'Pés na largura dos ombros, levante a barra do chão mantendo a coluna reta.' },
    { name: 'Puxada no Cabo Baixo', equipment: 'cabo', restTime: 75, difficulty: 'iniciante', instructions: 'Sentado, puxe o cabo em direção ao abdômen, mantendo as costas retas.' },
  ],
  ombros: [
    { name: 'Desenvolvimento com Halteres', equipment: 'halter', restTime: 90, difficulty: 'intermediario', instructions: 'Sentado, empurre os halteres acima da cabeça.' },
    { name: 'Elevação Lateral', equipment: 'halter', restTime: 60, difficulty: 'iniciante', instructions: 'Em pé, eleve os braços lateralmente até a altura dos ombros.' },
    { name: 'Elevação Frontal', equipment: 'halter', restTime: 60, difficulty: 'iniciante', instructions: 'Em pé, eleve um braço de cada vez à frente até a altura dos ombros.' },
    { name: 'Desenvolvimento com Barra', equipment: 'barra', restTime: 90, difficulty: 'avancado', instructions: 'Em pé ou sentado, empurre a barra acima da cabeça.' },
    { name: 'Crucifixo Invertido', equipment: 'halter', restTime: 60, difficulty: 'intermediario', instructions: 'Inclinado para frente, eleve os halteres lateralmente.' },
  ],
  biceps: [
    { name: 'Rosca Direta com Barra', equipment: 'barra', restTime: 75, difficulty: 'iniciante', instructions: 'Em pé, segure a barra com as palmas para cima, flexione os cotovelos.' },
    { name: 'Rosca Alternada com Halteres', equipment: 'halter', restTime: 60, difficulty: 'iniciante', instructions: 'Alterne a rosca com cada braço, mantendo os cotovelos fixos.' },
    { name: 'Rosca Martelo', equipment: 'halter', restTime: 60, difficulty: 'iniciante', instructions: 'Com as palmas neutras, flexione os cotovelos alternadamente.' },
    { name: 'Rosca Concentrada', equipment: 'halter', restTime: 60, difficulty: 'intermediario', instructions: 'Sentado, apoie o cotovelo na coxa e faça a rosca.' },
    { name: 'Rosca no Cabo', equipment: 'cabo', restTime: 60, difficulty: 'iniciante', instructions: 'Segure o cabo com a palma para cima e flexione o cotovelo.' },
  ],
  triceps: [
    { name: 'Tríceps Testa', equipment: 'barra', restTime: 75, difficulty: 'intermediario', instructions: 'Deitado, desça a barra até a testa dobrando os cotovelos.' },
    { name: 'Tríceps Pulley', equipment: 'cabo', restTime: 60, difficulty: 'iniciante', instructions: 'Empurre o cabo para baixo mantendo os cotovelos fixos.' },
    { name: 'Mergulho no Banco', equipment: 'banco', restTime: 75, difficulty: 'iniciante', instructions: 'Com as mãos no banco, desça o corpo dobrando os cotovelos.' },
    { name: 'Extensão com Halter', equipment: 'halter', restTime: 60, difficulty: 'intermediario', instructions: 'Segure o halter acima da cabeça, desça atrás da cabeça e suba.' },
    { name: 'Tríceps Coice', equipment: 'halter', restTime: 60, difficulty: 'intermediario', instructions: 'Inclinado, estenda o braço para trás com o cotovelo fixo.' },
  ],
  pernas: [
    { name: 'Agachamento Livre', equipment: 'barra', restTime: 120, difficulty: 'intermediario', instructions: 'Com a barra nos ombros, desça como se fosse sentar, joelhos alinhados.' },
    { name: 'Leg Press 45°', equipment: 'maquina', restTime: 90, difficulty: 'iniciante', instructions: 'Sentado na máquina, empurre a plataforma com os pés na largura dos ombros.' },
    { name: 'Afundo com Halteres', equipment: 'halter', restTime: 75, difficulty: 'iniciante', instructions: 'Avance um pé, desça o joelho traseiro ao chão e volte.' },
    { name: 'Cadeira Extensora', equipment: 'maquina', restTime: 75, difficulty: 'iniciante', instructions: 'Sentado, estenda os joelhos contra a resistência da máquina.' },
    { name: 'Cadeira Flexora', equipment: 'maquina', restTime: 75, difficulty: 'iniciante', instructions: 'Deitado, flexione os joelhos puxando o peso.' },
    { name: 'Panturrilha em Pé', equipment: 'maquina', restTime: 60, difficulty: 'iniciante', instructions: 'Eleve os calcanhares ao máximo e desça controlado.' },
    { name: 'Stiff', equipment: 'barra', restTime: 90, difficulty: 'avancado', instructions: 'Com a barra à frente, incline o tronco para frente mantendo as pernas levemente flexionadas.' },
    { name: 'Agachamento Sumô', equipment: 'halter', restTime: 90, difficulty: 'intermediario', instructions: 'Pés abertos e virados para fora, desça com o halter entre as pernas.' },
  ],
  abdomen: [
    { name: 'Prancha', equipment: 'nenhum', restTime: 60, difficulty: 'iniciante', instructions: 'Apoie nos antebraços e pontas dos pés, mantenha o corpo reto.' },
    { name: 'Crunch Abdominal', equipment: 'nenhum', restTime: 45, difficulty: 'iniciante', instructions: 'Deitado, eleve o tronco em direção aos joelhos.' },
    { name: 'Elevação de Pernas', equipment: 'nenhum', restTime: 60, difficulty: 'intermediario', instructions: 'Deitado, eleve as pernas estendidas até 90°.' },
    { name: 'Russian Twist', equipment: 'nenhum', restTime: 45, difficulty: 'intermediario', instructions: 'Sentado, rotacione o tronco de lado a lado.' },
    { name: 'Mountain Climber', equipment: 'nenhum', restTime: 45, difficulty: 'intermediario', instructions: 'Em posição de flexão, alterne puxar os joelhos ao peito.' },
    { name: 'Abdominal na Máquina', equipment: 'maquina', restTime: 60, difficulty: 'iniciante', instructions: 'Sentado, contraia o abdômen contra a resistência.' },
  ],
  cardio: [
    { name: 'Esteira', equipment: 'maquina', restTime: 0, difficulty: 'iniciante', instructions: 'Caminhada ou corrida na esteira.' },
    { name: 'Bicicleta Ergométrica', equipment: 'maquina', restTime: 0, difficulty: 'iniciante', instructions: 'Pedale mantendo cadência constante.' },
    { name: 'Burpee', equipment: 'nenhum', restTime: 60, difficulty: 'intermediario', instructions: 'Agache, apoie as mãos, pule os pés para trás, flexione, pule de volta e salte.' },
    { name: 'Jumping Jacks', equipment: 'nenhum', restTime: 30, difficulty: 'iniciante', instructions: 'Pule abrindo e fechando pernas e braços simultaneamente.' },
    { name: 'Pular Corda', equipment: 'corda', restTime: 45, difficulty: 'iniciante', instructions: 'Pule alternando os pés ou com os dois juntos.' },
    { name: 'Elíptico', equipment: 'maquina', restTime: 0, difficulty: 'iniciante', instructions: 'Movimento elíptico constante mantendo postura ereta.' },
  ],
};

const getSetsByObjective = (objective, level) => {
  const configs = {
    emagrecer: { sets: level === 'iniciante' ? 3 : 4, reps: '15-20', restTime: 45 },
    ganhar_massa: { sets: level === 'avancado' ? 5 : 4, reps: '8-12', restTime: 90 },
    condicionamento: { sets: 3, reps: '12-15', restTime: 60 },
    saude: { sets: 3, reps: '12-15', restTime: 60 },
    força: { sets: level === 'avancado' ? 5 : 4, reps: '4-6', restTime: 120 },
  };
  return configs[objective] || configs.saude;
};

const getMuscleGroupsForDays = (availableDays, focusMuscles, objective) => {
  const days = availableDays.length || 3;

  const splits = {
    1: [['peito', 'costas', 'ombros', 'biceps', 'triceps', 'pernas', 'abdomen']],
    2: [['peito', 'triceps', 'ombros'], ['costas', 'biceps', 'pernas', 'abdomen']],
    3: [['peito', 'triceps', 'ombros'], ['costas', 'biceps'], ['pernas', 'abdomen']],
    4: [['peito', 'triceps'], ['costas', 'biceps'], ['pernas'], ['ombros', 'abdomen']],
    5: [['peito', 'triceps'], ['costas', 'biceps'], ['pernas'], ['ombros'], ['abdomen', 'cardio']],
    6: [['peito'], ['costas'], ['pernas'], ['ombros', 'triceps'], ['biceps', 'abdomen'], ['cardio']],
  };

  const count = Math.min(days, 6);
  let split = splits[count] || splits[3];

  if (objective === 'emagrecer') {
    split = split.map((day) => [...day, 'cardio']);
  }

  return split;
};

const getWorkoutName = (muscleGroups, index) => {
  const names = {
    peito: 'Peito', costas: 'Costas', ombros: 'Ombros',
    biceps: 'Bíceps', triceps: 'Tríceps', pernas: 'Pernas',
    abdomen: 'Abdômen', cardio: 'Cardio',
  };
  const primary = names[muscleGroups[0]] || 'Treino';
  const secondary = muscleGroups[1] ? ` + ${names[muscleGroups[1]]}` : '';
  return `Treino ${String.fromCharCode(65 + index)} – ${primary}${secondary}`;
};

const generateWorkouts = (questionnaire) => {
  const { objective, level, availableDays, timePerWorkout, focusMuscles } = questionnaire;
  const config = getSetsByObjective(objective, level);
  const split = getMuscleGroupsForDays(availableDays, focusMuscles, objective);
  const daysToAssign = availableDays.length > 0 ? availableDays : [1, 3, 5];

  const workouts = split.map((muscleGroups, idx) => {
    const exercises = [];
    const maxExercisesPerGroup = timePerWorkout >= 60 ? 3 : 2;

    muscleGroups.forEach((group) => {
      if (!exerciseDatabase[group]) return;

      let availableExercises = exerciseDatabase[group].filter((ex) => {
        if (level === 'iniciante') return ex.difficulty === 'iniciante';
        if (level === 'intermediario') return ex.difficulty !== 'avancado';
        return true;
      });

      if (focusMuscles && focusMuscles.length > 0 && focusMuscles.includes(group)) {
        availableExercises = [...availableExercises, ...availableExercises.slice(0, 1)];
      }

      const picked = availableExercises.slice(0, group === 'cardio' ? 1 : maxExercisesPerGroup);

      picked.forEach((ex, i) => {
        const isCardio = group === 'cardio';
        exercises.push({
          name: ex.name,
          muscleGroup: group,
          equipment: ex.equipment,
          sets: isCardio ? 1 : config.sets,
          reps: isCardio ? '20-30 min' : config.reps,
          restTime: isCardio ? 0 : config.restTime,
          duration: isCardio ? 1200 : 0,
          difficulty: ex.difficulty,
          instructions: ex.instructions,
          order: exercises.length + i,
        });
      });
    });

    const dayIndex = idx < daysToAssign.length ? daysToAssign[idx] : null;
    return {
      name: getWorkoutName(muscleGroups, idx),
      weekDay: dayIndex,
      exercises,
      objective,
      estimatedDuration: timePerWorkout,
      generatedBy: 'ai',
    };
  });

  return workouts;
};

module.exports = { generateWorkouts, exerciseDatabase };
