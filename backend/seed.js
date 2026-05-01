const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Payment = require('./models/Payment');
const Workout = require('./models/Workout');
const Progress = require('./models/Progress');
const { generateWorkouts } = require('./services/workoutGenerator');
const { calculateIMC } = require('./services/imcCalculator');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/startfit');
    console.log('✅ MongoDB conectado');

    await User.deleteMany({});
    await Student.deleteMany({});
    await Payment.deleteMany({});
    await Workout.deleteMany({});
    await Progress.deleteMany({});

    // Admin
    const admin = await User.create({ name: 'Admin StartFit', email: 'admin@startfit.com', password: '123456', role: 'admin' });

    // Teacher
    const teacher = await User.create({ name: 'Prof. Carlos Silva', email: 'professor@startfit.com', password: '123456', role: 'teacher', phone: '(84) 99999-1111' });

    // Students
    const questionnaire = {
      objective: 'ganhar_massa', level: 'iniciante', availableDays: [1, 3, 5],
      timePerWorkout: 60, focusMuscles: ['peito', 'costas'],
      routine: 'Trabalho de 8h às 17h', physicalLimitations: 'Nenhuma',
      weight: 75, height: 175, age: 28, gender: 'masculino', completedAt: new Date(),
    };
    const { imc, category } = calculateIMC(75, 175);

    const studentUser1 = await User.create({ name: 'João Paulo Santos', email: 'joao@email.com', password: '123456', role: 'student', phone: '(84) 99999-2222' });
    const student1 = await Student.create({
      user: studentUser1._id, teacher: teacher._id,
      questionnaire, imc, imcCategory: category,
      questionnaireCompleted: true, monthlyFee: 120,
      paymentDueDay: 10, totalWorkouts: 8,
      lastWorkout: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const workoutPlans = generateWorkouts(questionnaire);
    for (const plan of workoutPlans) {
      await Workout.create({ student: student1._id, ...plan });
    }

    const now = new Date();
    await Payment.create({ student: student1._id, amount: 120, referenceMonth: now.getMonth(), referenceYear: now.getFullYear(), dueDate: new Date(now.getFullYear(), now.getMonth() - 1, 10), paidDate: new Date(now.getFullYear(), now.getMonth() - 1, 8), status: 'pago' });
    await Payment.create({ student: student1._id, amount: 120, referenceMonth: now.getMonth() + 1, referenceYear: now.getFullYear(), dueDate: new Date(now.getFullYear(), now.getMonth(), 10), status: 'pendente' });

    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
      await Progress.create({ student: student1._id, date: d, weight: 75 - i * 0.3, height: 175, imc: parseFloat(((75 - i * 0.3) / (1.75 * 1.75)).toFixed(2)) });
    }

    // Student 2 (inactive, overdue)
    const studentUser2 = await User.create({ name: 'Maria Fernanda Lima', email: 'maria@email.com', password: '123456', role: 'student', phone: '(84) 99999-3333' });
    const student2 = await Student.create({
      user: studentUser2._id, monthlyFee: 100, paymentDueDay: 5,
      questionnaireCompleted: false, totalWorkouts: 0,
    });
    await Payment.create({ student: student2._id, amount: 100, referenceMonth: now.getMonth(), referenceYear: now.getFullYear(), dueDate: new Date(now.getFullYear(), now.getMonth(), 5), status: 'vencido' });

    console.log('\n🌱 Seed concluído com sucesso!\n');
    console.log('📧 Usuários criados:');
    console.log('   Admin   → admin@startfit.com / 123456');
    console.log('   Teacher → professor@startfit.com / 123456');
    console.log('   Aluno   → joao@email.com / 123456');
    console.log('   Aluno   → maria@email.com / 123456\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no seed:', err);
    process.exit(1);
  }
};

seed();
