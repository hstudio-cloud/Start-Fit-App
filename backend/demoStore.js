const { calculateIMC } = require('./services/imcCalculator');
const { generateWorkouts } = require('./services/workoutGenerator');
const { exerciseLibrary } = require('./services/exerciseLibrary');

const isDemoMode = !process.env.MONGODB_URI;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function buildDemoQuestionnaire(overrides = {}) {
  return {
    objective: 'ganhar_massa',
    level: 'iniciante',
    availableDays: [1, 3, 5],
    timePerWorkout: 60,
    focusMuscles: ['peito', 'costas'],
    routine: 'Trabalha em horario comercial e treina no fim da tarde',
    physicalLimitations: 'Nenhuma',
    weight: 75,
    height: 175,
    age: 28,
    gender: 'masculino',
    completedAt: new Date(),
    ...overrides,
  };
}

function createWorkoutRecords(studentId, questionnaire, generatedBy = 'ai', createdAt = new Date()) {
  return generateWorkouts(questionnaire).map((plan) => ({
    _id: '',
    student: studentId,
    generatedBy,
    isActive: true,
    createdAt,
    ...plan,
    exercises: plan.exercises.map((exercise, index) => ({
      ...exercise,
      order: index,
    })),
  }));
}

function buildStore() {
  const now = new Date();
  const joaoQuestionnaire = buildDemoQuestionnaire();
  const mariaQuestionnaire = buildDemoQuestionnaire({
    objective: 'emagrecer',
    level: 'iniciante',
    availableDays: [2, 4, 6],
    focusMuscles: ['pernas', 'abdomen'],
    weight: 67,
    height: 165,
    age: 32,
    gender: 'feminino',
    routine: 'Treina cedo antes do trabalho e prioriza cardio',
  });
  const lucasQuestionnaire = buildDemoQuestionnaire({
    objective: 'condicionamento',
    level: 'intermediario',
    availableDays: [1, 2, 4, 6],
    timePerWorkout: 50,
    focusMuscles: ['costas', 'ombros'],
    weight: 82,
    height: 180,
    age: 26,
    gender: 'masculino',
    routine: 'Joga futebol no fim de semana',
  });

  const joaoIMC = calculateIMC(joaoQuestionnaire.weight, joaoQuestionnaire.height);
  const mariaIMC = calculateIMC(mariaQuestionnaire.weight, mariaQuestionnaire.height);
  const lucasIMC = calculateIMC(lucasQuestionnaire.weight, lucasQuestionnaire.height);

  const store = {
    counters: { user: 6, student: 3, payment: 6, session: 5, progress: 15, workout: 0, diet: 2 },
    exerciseLibrary: clone(exerciseLibrary),
    users: [
      { _id: 'u_admin', name: 'Admin StartFit', email: 'admin@startfit.com', password: '123456', role: 'admin', phone: '(84) 99100-0001', active: true, createdAt: daysAgo(120) },
      { _id: 'u_teacher', name: 'Prof. Carlos Silva', email: 'professor@startfit.com', password: '123456', role: 'teacher', phone: '(84) 99999-1111', active: true, createdAt: daysAgo(150) },
      { _id: 'u_teacher_2', name: 'Ana Beatriz Rocha', email: 'ana.personal@startfit.com', password: '123456', role: 'teacher', phone: '(84) 98888-4444', active: true, createdAt: daysAgo(140) },
      { _id: 'u_student_1', name: 'Joao Paulo Santos', email: 'joao@email.com', password: '123456', role: 'student', phone: '(84) 99999-2222', active: true, createdAt: daysAgo(90) },
      { _id: 'u_student_2', name: 'Maria Fernanda Lima', email: 'maria@email.com', password: '123456', role: 'student', phone: '(84) 99999-3333', active: true, createdAt: daysAgo(60) },
      { _id: 'u_student_3', name: 'Lucas Andrade Costa', email: 'lucas.demo@startfit.com', password: '123456', role: 'student', phone: '(84) 99777-0101', active: true, createdAt: daysAgo(45) },
    ],
    students: [
      {
        _id: 's_1',
        user: 'u_student_1',
        teacher: 'u_teacher',
        questionnaire: clone(joaoQuestionnaire),
        imc: joaoIMC.imc,
        imcCategory: joaoIMC.category,
        questionnaireCompleted: true,
        monthlyFee: 129.9,
        paymentDueDay: 10,
        totalWorkouts: 18,
        lastWorkout: daysAgo(1),
        notes: [
          { text: 'Boa aderencia ao treino e execucao consistente nos movimentos base.', author: 'Prof. Carlos Silva', createdAt: daysAgo(2) },
        ],
        trainerFeedbacks: [
          { text: 'Aumentar a carga do supino em 2 kg se mantiver tecnica.', author: 'Prof. Carlos Silva', createdAt: daysAgo(2) },
        ],
        createdAt: daysAgo(90),
      },
      {
        _id: 's_2',
        user: 'u_student_2',
        teacher: 'u_teacher_2',
        questionnaire: clone(mariaQuestionnaire),
        imc: mariaIMC.imc,
        imcCategory: mariaIMC.category,
        questionnaireCompleted: true,
        monthlyFee: 119.9,
        paymentDueDay: 5,
        totalWorkouts: 9,
        lastWorkout: daysAgo(6),
        notes: [
          { text: 'Boa frequencia nas ultimas semanas, manter foco em cardio e pernas.', author: 'Ana Beatriz Rocha', createdAt: daysAgo(4) },
        ],
        trainerFeedbacks: [
          { text: 'Cardio em intensidade moderada apos o treino de pernas.', author: 'Ana Beatriz Rocha', createdAt: daysAgo(4) },
        ],
        createdAt: daysAgo(60),
      },
      {
        _id: 's_3',
        user: 'u_student_3',
        teacher: 'u_teacher',
        questionnaire: clone(lucasQuestionnaire),
        imc: lucasIMC.imc,
        imcCategory: lucasIMC.category,
        questionnaireCompleted: true,
        monthlyFee: 139.9,
        paymentDueDay: 14,
        totalWorkouts: 5,
        lastWorkout: daysAgo(18),
        notes: [
          { text: 'Aluno em fase de retorno, precisa recuperar rotina semanal.', author: 'Prof. Carlos Silva', createdAt: daysAgo(10) },
        ],
        trainerFeedbacks: [
          { text: 'Reforcar trabalho de mobilidade e costas antes de aumentar volume.', author: 'Prof. Carlos Silva', createdAt: daysAgo(10) },
        ],
        createdAt: daysAgo(45),
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
        title: 'Plano Lean Bulk Premium',
        goal: 'Ganho de massa com energia para treinos de peito e costas',
        hydrationLiters: 3.2,
        caloriesTarget: 2850,
        meals: [
          { title: 'Cafe da manha', time: '07:00', foods: ['4 ovos mexidos', 'Pao integral', 'Banana com aveia'], notes: 'Adicionar cafe sem acucar se desejar.' },
          { title: 'Almoco', time: '12:30', foods: ['Arroz', 'Frango grelhado', 'Feijao', 'Salada variada'], notes: 'Priorizar proteina e legumes.' },
          { title: 'Pre-treino', time: '16:30', foods: ['Iogurte natural', 'Granola', 'Mel'], notes: 'Consumir 60 minutos antes do treino.' },
          { title: 'Jantar', time: '20:30', foods: ['Batata doce', 'Patinho moido', 'Legumes no vapor'], notes: 'Reforcar carboidrato em dias de perna.' },
        ],
        tips: ['Dormir pelo menos 7h30.', 'Beber agua ao longo do dia.', 'Evitar longos periodos em jejum.'],
        notes: 'Plano demonstrativo para apresentacao comercial.',
        active: true,
        createdAt: daysAgo(20),
      },
      {
        _id: 'diet_2',
        student: 's_2',
        teacher: 'u_teacher_2',
        title: 'Plano Definicao Inteligente',
        goal: 'Reducao de gordura com saciedade e aderencia',
        hydrationLiters: 2.8,
        caloriesTarget: 2050,
        meals: [
          { title: 'Cafe da manha', time: '06:15', foods: ['Iogurte proteico', 'Frutas vermelhas', 'Chia'], notes: 'Boa opcao para treinar cedo.' },
          { title: 'Almoco', time: '12:00', foods: ['Arroz integral', 'Tilapia', 'Legumes', 'Folhas verdes'], notes: 'Montar prato colorido.' },
          { title: 'Lanche', time: '16:00', foods: ['Castanhas', 'Queijo branco', 'Maca'], notes: 'Evitar ficar mais de 4 horas sem comer.' },
          { title: 'Jantar', time: '20:00', foods: ['Omelete', 'Salada', 'Abobora assada'], notes: 'Fechar o dia com refeicao leve.' },
        ],
        tips: ['Levar garrafa de agua para o trabalho.', 'Planejar refeicoes com antecedencia.', 'Manter constancia no cardio.'],
        notes: 'Plano com foco em apresentacao de habitos saudaveis.',
        active: true,
        createdAt: daysAgo(12),
      },
    ],
    payments: [
      {
        _id: 'payment_1',
        student: 's_1',
        amount: 129.9,
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
        amount: 129.9,
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
        amount: 119.9,
        referenceMonth: now.getMonth(),
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 5),
        paidDate: null,
        status: 'vencido',
        paymentMethod: '',
        pixCharge: null,
      },
      {
        _id: 'payment_4',
        student: 's_2',
        amount: 119.9,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 5),
        paidDate: null,
        status: 'pendente',
        paymentMethod: '',
        pixCharge: null,
      },
      {
        _id: 'payment_5',
        student: 's_3',
        amount: 139.9,
        referenceMonth: now.getMonth(),
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth(), 14),
        paidDate: null,
        status: 'vencido',
        paymentMethod: '',
        pixCharge: null,
      },
      {
        _id: 'payment_6',
        student: 's_3',
        amount: 139.9,
        referenceMonth: now.getMonth() + 1,
        referenceYear: now.getFullYear(),
        dueDate: new Date(now.getFullYear(), now.getMonth() + 1, 14),
        paidDate: null,
        status: 'pendente',
        paymentMethod: '',
        pixCharge: null,
      },
    ],
  };

  [
    ...createWorkoutRecords('s_1', joaoQuestionnaire, 'ai', daysAgo(25)),
    ...createWorkoutRecords('s_2', mariaQuestionnaire, 'ai', daysAgo(18)),
    ...createWorkoutRecords('s_3', lucasQuestionnaire, 'teacher', daysAgo(10)),
  ].forEach((workout) => {
    store.counters.workout += 1;
    store.workouts.push({
      ...workout,
      _id: `workout_${store.counters.workout}`,
    });
  });

  store.sessions = [
    {
      _id: 'session_1',
      student: 's_1',
      workout: store.workouts.find((entry) => entry.student === 's_1')?._id || null,
      workoutName: store.workouts.find((entry) => entry.student === 's_1')?.name || 'Treino A',
      exercises: clone(store.workouts.find((entry) => entry.student === 's_1')?.exercises || []),
      startTime: daysAgo(7),
      endTime: new Date(daysAgo(7).getTime() + 48 * 60000),
      totalDuration: 48,
      completed: true,
      rating: 5,
      generalNotes: 'Treino fluido e com boa tecnica na parte superior.',
      date: daysAgo(7),
    },
    {
      _id: 'session_2',
      student: 's_1',
      workout: store.workouts.filter((entry) => entry.student === 's_1')[1]?._id || null,
      workoutName: store.workouts.filter((entry) => entry.student === 's_1')[1]?.name || 'Treino B',
      exercises: clone(store.workouts.filter((entry) => entry.student === 's_1')[1]?.exercises || []),
      startTime: daysAgo(3),
      endTime: new Date(daysAgo(3).getTime() + 54 * 60000),
      totalDuration: 54,
      completed: true,
      rating: 4,
      generalNotes: 'Leve fadiga nas ultimas series de pernas.',
      date: daysAgo(3),
    },
    {
      _id: 'session_3',
      student: 's_2',
      workout: store.workouts.find((entry) => entry.student === 's_2')?._id || null,
      workoutName: store.workouts.find((entry) => entry.student === 's_2')?.name || 'Treino A',
      exercises: clone(store.workouts.find((entry) => entry.student === 's_2')?.exercises || []),
      startTime: daysAgo(6),
      endTime: new Date(daysAgo(6).getTime() + 46 * 60000),
      totalDuration: 46,
      completed: true,
      rating: 5,
      generalNotes: 'Excelente ritmo no cardio final.',
      date: daysAgo(6),
    },
    {
      _id: 'session_4',
      student: 's_2',
      workout: store.workouts.filter((entry) => entry.student === 's_2')[1]?._id || null,
      workoutName: store.workouts.filter((entry) => entry.student === 's_2')[1]?.name || 'Treino B',
      exercises: clone(store.workouts.filter((entry) => entry.student === 's_2')[1]?.exercises || []),
      startTime: daysAgo(1),
      endTime: new Date(daysAgo(1).getTime() + 51 * 60000),
      totalDuration: 51,
      completed: true,
      rating: 4,
      generalNotes: 'Boa consistencia em pernas e abdomen.',
      date: daysAgo(1),
    },
    {
      _id: 'session_5',
      student: 's_3',
      workout: store.workouts.find((entry) => entry.student === 's_3')?._id || null,
      workoutName: store.workouts.find((entry) => entry.student === 's_3')?.name || 'Treino A',
      exercises: clone(store.workouts.find((entry) => entry.student === 's_3')?.exercises || []),
      startTime: daysAgo(18),
      endTime: new Date(daysAgo(18).getTime() + 44 * 60000),
      totalDuration: 44,
      completed: true,
      rating: 3,
      generalNotes: 'Retorno gradual, ainda abaixo do ritmo ideal.',
      date: daysAgo(18),
    },
  ];

  store.progress = [
    ...Array.from({ length: 7 }, (_, index) => {
      const weight = 73.4 + index * 0.35;
      return {
        _id: `progress_${index + 1}`,
        student: 's_1',
        date: daysAgo((6 - index) * 28),
        weight,
        height: 175,
        imc: Number((weight / (1.75 * 1.75)).toFixed(2)),
        notes: index === 6 ? 'Melhora de carga no supino e remada.' : '',
      };
    }),
    ...Array.from({ length: 5 }, (_, index) => {
      const weight = 68.8 - index * 0.28;
      return {
        _id: `progress_${index + 8}`,
        student: 's_2',
        date: daysAgo((4 - index) * 21),
        weight,
        height: 165,
        imc: Number((weight / (1.65 * 1.65)).toFixed(2)),
        notes: index === 4 ? 'Melhora na frequencia semanal e no cardio.' : '',
      };
    }),
    ...Array.from({ length: 3 }, (_, index) => {
      const weight = 83.4 - index * 0.5;
      return {
        _id: `progress_${index + 13}`,
        student: 's_3',
        date: daysAgo((2 - index) * 30),
        weight,
        height: 180,
        imc: Number((weight / (1.8 * 1.8)).toFixed(2)),
        notes: index === 2 ? 'Retomada gradual depois de periodo inativo.' : '',
      };
    }),
  ];

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
