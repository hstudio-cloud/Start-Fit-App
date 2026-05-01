const { calculateIMC } = require('./services/imcCalculator');
const { generateWorkouts } = require('./services/workoutGenerator');
const { exerciseLibrary, findExerciseByName, inferAnimationKey } = require('./services/exerciseLibrary');

const isDemoMode = !process.env.MONGODB_URI;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildStore() {
  const now = new Date();
  const questionnaire = {
    objective: 'ganhar_massa',
    level: 'iniciante',
    availableDays: [1, 3, 5],
    timePerWorkout: 60,
    focusMuscles: ['peito', 'costas'],
    routine: 'Trabalho de 8h as 17h',
    physicalLimitations: 'Nenhuma',
    weight: 75,
    height: 175,
    age: 28,
    gender: 'masculino',
    completedAt: now,
  };
  const { imc, category } = calculateIMC(questionnaire.weight, questionnaire.height);

  const store = {
    counters: { user: 4, student: 2, payment: 3, session: 2, progress: 7, workout: 0, diet: 1 },
    exerciseLibrary: clone(exerciseLibrary),
    users: [
      { _id: 'u_admin', name: 'Admin StartFit', email: 'admin@startfit.com', password: '123456', role: 'admin', phone: '', active: true, createdAt: now },
      { _id: 'u_teacher', name: 'Prof. Carlos Silva', email: 'professor@startfit.com', password: '123456', role: 'teacher', phone: '(84) 99999-1111', active: true, createdAt: now },
      { _id: 'u_teacher_2', name: 'Ana Beatriz Rocha', email: 'ana.personal@startfit.com', password: '123456', role: 'teacher', phone: '(84) 98888-4444', active: true, createdAt: now },
      { _id: 'u_student_1', name: 'Joao Paulo Santos', email: 'joao@email.com', password: '123456', role: 'student', phone: '(84) 99999-2222', active: true, createdAt: now },
      { _id: 'u_student_2', name: 'Maria Fernanda Lima', email: 'maria@email.com', password: '123456', role: 'student', phone: '(84) 99999-3333', active: true, createdAt: now },
    ],
    students: [
      {
        _id: 's_1',
        user: 'u_student_1',
        teacher: 'u_teacher',
        questionnaire: clone(questionnaire),
        imc,
        imcCategory: category,
        questionnaireCompleted: true,
        monthlyFee: 120,
        paymentDueDay: 10,
        totalWorkouts: 8,
        lastWorkout: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        notes: [{ text: 'Bom progresso no treino.', author: 'Prof. Carlos Silva', createdAt: now }],
        trainerFeedbacks: [{ text: 'Aumentar carga no supino na proxima semana.', author: 'Prof. Carlos Silva', createdAt: now }],
        createdAt: now,
      },
      {
        _id: 's_2',
        user: 'u_student_2',
        teacher: null,
        questionnaire: {},
        imc: null,
        imcCategory: '',
        questionnaireCompleted: false,
        monthlyFee: 100,
        paymentDueDay: 5,
        totalWorkouts: 0,
        lastWorkout: null,
        notes: [],
        trainerFeedbacks: [],
        createdAt: now,
      },
    ],
    workouts: [],
    sessions: [],
    progress: [],
    diets: [
      {
        _id: 'diet_1',
        student: 's_1',
        teacher: 'u_teacher',
        title: 'Plano Lean Bulk',
        goal: 'Ganho de massa com foco em energia para treino',
        hydrationLiters: 3,
        caloriesTarget: 2800,
        meals: [
          { title: 'Cafe da manha', time: '07:00', foods: ['4 ovos mexidos', '2 fatias de pao integral', '1 banana'], notes: 'Adicionar cafe sem acucar se quiser.' },
          { title: 'Almoco', time: '12:30', foods: ['150g arroz', '180g frango', 'salada verde', 'feijao'], notes: 'Priorizar legumes no prato.' },
          { title: 'Pre-treino', time: '16:30', foods: ['Iogurte', 'Aveia', '1 fruta'], notes: 'Consumir 60 min antes do treino.' },
          { title: 'Jantar', time: '20:30', foods: ['Batata doce', 'Patinho moido', 'Legumes'], notes: 'Se treino for muito intenso, repetir carboidrato.' },
        ],
        tips: ['Dormir pelo menos 7h30.', 'Beber agua ao longo do dia.', 'Evitar longos periodos em jejum.'],
        notes: 'Plano inicial montado pelo personal.',
        active: true,
        createdAt: now,
      },
    ],
    payments: [
      {
        _id: 'payment_1',
        student: 's_1',
        amount: 120,
        referenceMonth: now.getMonth(),
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10),
        paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 8),
        status: 'pago',
        paymentMethod: 'pix',
      },
      {
        _id: 'payment_2',
        student: 's_1',
        amount: 120,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 10),
        paidDate: null,
        status: 'pendente',
        paymentMethod: '',
        pixCharge: null,
      },
      {
        _id: 'payment_3',
        student: 's_2',
        amount: 100,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        paidDate: null,
        status: 'vencido',
        paymentMethod: '',
        pixCharge: null,
      },
    ],
  };

  generateWorkouts(questionnaire).forEach((plan) => {
    store.counters.workout += 1;
    store.workouts.push({
      _id: `workout_${store.counters.workout}`,
      student: 's_1',
      generatedBy: 'ai',
      isActive: true,
      createdAt: now,
      ...plan,
      exercises: plan.exercises.map((exercise, exerciseIndex) => {
        const match = findExerciseByName(exercise.name);
        return {
          ...exercise,
          exerciseId: match?.id || '',
          animationKey: match?.animationKey || inferAnimationKey(exercise.name, exercise.muscleGroup),
          videoUrl: match?.videoUrl || '',
          videoSourceUrl: match?.videoSourceUrl || '',
          videoAttribution: match?.videoAttribution || '',
          videoLabel: match?.videoLabel || '',
          order: exerciseIndex,
        };
      }),
    });
  });

  store.sessions = [
    {
      _id: 'session_1',
      student: 's_1',
      workout: store.workouts[0]?._id || null,
      workoutName: store.workouts[0]?.name || 'Treino A',
      exercises: clone(store.workouts[0]?.exercises || []),
      startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 48 * 60000),
      totalDuration: 48,
      completed: true,
      rating: 5,
      generalNotes: 'Treino concluido com boa performance.',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: 'session_2',
      student: 's_1',
      workout: store.workouts[1]?._id || null,
      workoutName: store.workouts[1]?.name || 'Treino B',
      exercises: clone(store.workouts[1]?.exercises || []),
      startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 52 * 60000),
      totalDuration: 52,
      completed: true,
      rating: 4,
      generalNotes: 'Evolucao consistente.',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ];

  store.progress = Array.from({ length: 7 }, (_, index) => {
    const weight = 73.2 + index * 0.3;
    return {
      _id: `progress_${index + 1}`,
      student: 's_1',
      date: new Date(Date.now() - (6 - index) * 30 * 24 * 60 * 60 * 1000),
      weight,
      height: 175,
      imc: Number((weight / (1.75 * 1.75)).toFixed(2)),
      notes: '',
    };
  });

  return store;
}

let store = global.startFitDemoStore;
if (!store) {
  store = global.startFitDemoStore = buildStore();
}

function nextId(type) {
  store.counters[type] = (store.counters[type] || 0) + 1;
  return `${type}_${store.counters[type]}`;
}

module.exports = { isDemoMode, store, clone, nextId };
