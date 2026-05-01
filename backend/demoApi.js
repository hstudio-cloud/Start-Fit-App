const express = require('express');
const jwt = require('jsonwebtoken');
const { calculateIMC } = require('./services/imcCalculator');
const { generateWorkouts } = require('./services/workoutGenerator');
const { store, clone, nextId } = require('./demoStore');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'startfit_demo_secret';

function publicUser(user) {
  const data = clone(user);
  delete data.password;
  return data;
}

function findUserById(id) {
  return store.users.find((user) => user._id === id) || null;
}

function findUserByEmail(email) {
  return store.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase()) || null;
}

function findStudentByUserId(userId) {
  return store.students.find((student) => student.user === userId) || null;
}

function findStudentById(id) {
  return store.students.find((student) => student._id === id) || null;
}

function enrichStudent(student) {
  if (!student) return null;
  return {
    ...clone(student),
    user: publicUser(findUserById(student.user)),
    teacher: student.teacher ? publicUser(findUserById(student.teacher)) : null,
  };
}

function enrichPayment(payment) {
  return {
    ...clone(payment),
    student: enrichStudent(findStudentById(payment.student)),
  };
}

function auth(req, res, roles = null) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ success: false, message: 'Nao autorizado. Token ausente.' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);
    if (!user || !user.active) {
      res.status(401).json({ success: false, message: 'Usuario nao encontrado ou inativo.' });
      return null;
    }
    if (roles && !roles.includes(user.role)) {
      res.status(403).json({ success: false, message: 'Acesso negado.' });
      return null;
    }
    return user;
  } catch {
    res.status(401).json({ success: false, message: 'Token invalido ou expirado.' });
    return null;
  }
}

function addRoute(method, path, handler) {
  router[method](path, handler);
  router[method](`/api${path}`, handler);
}

addRoute('post', '/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: 'Credenciais invalidas.' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
  res.json({ success: true, token, user: publicUser(user) });
});

addRoute('post', '/auth/register', (req, res) => {
  const { name, email, password, role = 'student', phone } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Nome, email e senha sao obrigatorios.' });
  }
  if (findUserByEmail(email)) {
    return res.status(400).json({ success: false, message: 'Email ja cadastrado.' });
  }

  const user = {
    _id: nextId('user'),
    name,
    email,
    password,
    role: role === 'admin' ? 'student' : role,
    phone: phone || '',
    active: true,
    createdAt: new Date(),
  };
  store.users.push(user);
  if (user.role === 'student') {
    store.students.push({
      _id: nextId('student'),
      user: user._id,
      teacher: null,
      questionnaire: {},
      imc: null,
      imcCategory: '',
      questionnaireCompleted: false,
      monthlyFee: 100,
      paymentDueDay: 10,
      totalWorkouts: 0,
      lastWorkout: null,
      notes: [],
      createdAt: new Date(),
    });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });
  res.status(201).json({ success: true, token, user: publicUser(user) });
});

addRoute('get', '/auth/me', (req, res) => {
  const user = auth(req, res);
  if (!user) return;
  const student = user.role === 'student' ? enrichStudent(findStudentByUserId(user._id)) : null;
  res.json({ success: true, user: publicUser(user), student });
});

addRoute('get', '/admin/dashboard', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const stats = {
    totalStudents: store.students.length,
    activeStudents: store.students.filter((student) => student.lastWorkout).length,
    overduePayments: store.payments.filter((payment) => payment.status === 'vencido').length,
    upcomingPayments: store.payments.filter((payment) => payment.status === 'pendente').length,
    inactiveStudents: store.students.filter((student) => !student.lastWorkout).length,
  };
  const recentSessions = store.sessions
    .filter((session) => session.completed)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .map((session) => ({ ...clone(session), student: enrichStudent(findStudentById(session.student)) }));
  res.json({ success: true, stats, recentSessions });
});

addRoute('get', '/admin/students', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  res.json({ success: true, students: store.students.map(enrichStudent).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) });
});

addRoute('post', '/admin/students', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const { name, email, password, phone, monthlyFee, paymentDueDay, teacherId } = req.body || {};
  if (findUserByEmail(email)) {
    return res.status(400).json({ success: false, message: 'Email ja cadastrado.' });
  }
  const newUser = { _id: nextId('user'), name, email, password: password || '123456', role: 'student', phone: phone || '', active: true, createdAt: new Date() };
  store.users.push(newUser);
  const student = {
    _id: nextId('student'),
    user: newUser._id,
    teacher: teacherId || null,
    questionnaire: {},
    imc: null,
    imcCategory: '',
    questionnaireCompleted: false,
    monthlyFee: Number(monthlyFee || 100),
    paymentDueDay: Number(paymentDueDay || 10),
    totalWorkouts: 0,
    lastWorkout: null,
    notes: [],
    createdAt: new Date(),
  };
  store.students.push(student);
  store.payments.push({
    _id: nextId('payment'),
    student: student._id,
    amount: student.monthlyFee,
    referenceMonth: new Date().getMonth() + 1,
    referenceYear: new Date().getFullYear(),
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), student.paymentDueDay),
    status: 'pendente',
    paidDate: null,
    paymentMethod: '',
  });
  res.status(201).json({ success: true, student: enrichStudent(student) });
});

addRoute('put', '/admin/students/:id', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const student = findStudentById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Aluno nao encontrado.' });
  const account = findUserById(student.user);
  const { name, email, phone, active, monthlyFee, paymentDueDay, teacherId } = req.body || {};
  if (name) account.name = name;
  if (email) account.email = email;
  if (phone !== undefined) account.phone = phone;
  if (active !== undefined) account.active = active;
  if (monthlyFee) student.monthlyFee = Number(monthlyFee);
  if (paymentDueDay) student.paymentDueDay = Number(paymentDueDay);
  if (teacherId !== undefined) student.teacher = teacherId || null;
  res.json({ success: true, message: 'Aluno atualizado com sucesso.' });
});

addRoute('delete', '/admin/students/:id', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const student = findStudentById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Aluno nao encontrado.' });
  findUserById(student.user).active = false;
  res.json({ success: true, message: 'Aluno desativado com sucesso.' });
});

addRoute('get', '/admin/payments', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const { status, studentId } = req.query;
  let payments = store.payments.slice();
  if (status) payments = payments.filter((payment) => payment.status === status);
  if (studentId) payments = payments.filter((payment) => payment.student === studentId);
  res.json({ success: true, payments: payments.map(enrichPayment).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate)) });
});

addRoute('put', '/admin/payments/:id', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const payment = store.payments.find((entry) => entry._id === req.params.id);
  if (!payment) return res.status(404).json({ success: false, message: 'Pagamento nao encontrado.' });
  const { status, paidDate, paymentMethod, notes, amount } = req.body || {};
  if (status) payment.status = status;
  if (paidDate) payment.paidDate = paidDate;
  if (paymentMethod) payment.paymentMethod = paymentMethod;
  if (notes !== undefined) payment.notes = notes;
  if (amount) payment.amount = Number(amount);
  if (status === 'pago' && !payment.paidDate) payment.paidDate = new Date();
  res.json({ success: true, payment: enrichPayment(payment) });
});

addRoute('get', '/admin/teachers', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  res.json({ success: true, teachers: store.users.filter((entry) => entry.role === 'teacher' && entry.active).map(publicUser) });
});

addRoute('post', '/admin/teachers', (req, res) => {
  const user = auth(req, res, ['admin']);
  if (!user) return;
  const { name, email, password, phone } = req.body || {};
  if (findUserByEmail(email)) return res.status(400).json({ success: false, message: 'Email ja cadastrado.' });
  const teacher = { _id: nextId('user'), name, email, password: password || '123456', role: 'teacher', phone: phone || '', active: true, createdAt: new Date() };
  store.users.push(teacher);
  res.status(201).json({ success: true, teacher: publicUser(teacher) });
});

addRoute('get', '/student/profile', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = enrichStudent(findStudentByUserId(user._id));
  if (!student) return res.status(404).json({ success: false, message: 'Perfil de aluno nao encontrado.' });
  res.json({ success: true, student });
});

addRoute('post', '/student/questionnaire', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  if (!student) return res.status(404).json({ success: false, message: 'Aluno nao encontrado.' });
  const { objective, level, availableDays, timePerWorkout, focusMuscles, routine, physicalLimitations, weight, height, age, gender } = req.body || {};
  const { imc, category } = calculateIMC(weight, height);
  student.questionnaire = { objective, level, availableDays, timePerWorkout, focusMuscles, routine, physicalLimitations, weight, height, age, gender, completedAt: new Date() };
  student.imc = imc;
  student.imcCategory = category;
  student.questionnaireCompleted = true;
  store.progress.push({ _id: nextId('progress'), student: student._id, weight, height, imc, date: new Date(), notes: '' });
  store.workouts = store.workouts.filter((workout) => workout.student !== student._id);
  generateWorkouts(student.questionnaire).forEach((plan) => {
    store.workouts.push({ _id: nextId('workout'), student: student._id, generatedBy: 'ai', isActive: true, createdAt: new Date(), ...plan });
  });
  res.json({ success: true, message: 'Questionario salvo e treinos gerados com sucesso!', student: enrichStudent(student) });
});

addRoute('get', '/student/workout/today', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const today = new Date().getDay();
  const workouts = store.workouts.filter((workout) => workout.student === student._id && workout.isActive !== false);
  res.json({ success: true, workout: clone(workouts.find((workout) => workout.weekDay === today) || workouts[0] || null) });
});

addRoute('get', '/student/workouts', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const workouts = store.workouts.filter((workout) => workout.student === student._id && workout.isActive !== false).sort((a, b) => a.weekDay - b.weekDay);
  res.json({ success: true, workouts: clone(workouts) });
});

addRoute('post', '/student/session', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const session = {
    _id: nextId('session'),
    student: student._id,
    workout: req.body?.workoutId || null,
    workoutName: req.body?.workoutName || 'Treino',
    exercises: clone(req.body?.exercises || []),
    startTime: new Date(),
    completed: false,
    date: new Date(),
  };
  store.sessions.push(session);
  res.status(201).json({ success: true, session: clone(session) });
});

addRoute('put', '/student/session/:id', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const session = store.sessions.find((entry) => entry._id === req.params.id && entry.student === student._id);
  if (!session) return res.status(404).json({ success: false, message: 'Sessao nao encontrada.' });
  const { exercises, generalNotes, rating, completed } = req.body || {};
  if (exercises) session.exercises = clone(exercises);
  if (generalNotes !== undefined) session.generalNotes = generalNotes;
  if (rating) session.rating = rating;
  if (completed) {
    session.completed = true;
    session.endTime = new Date();
    session.totalDuration = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
    student.lastWorkout = new Date();
    student.totalWorkouts = (student.totalWorkouts || 0) + 1;
  }
  res.json({ success: true, session: clone(session) });
});

addRoute('get', '/student/sessions', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const sessions = store.sessions.filter((entry) => entry.student === student._id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
  res.json({ success: true, sessions: clone(sessions) });
});

addRoute('get', '/student/payments', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const payments = store.payments.filter((entry) => entry.student === student._id).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
  res.json({ success: true, payments: clone(payments) });
});

addRoute('get', '/student/progress', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const progress = store.progress.filter((entry) => entry.student === student._id).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 24);
  res.json({ success: true, progress: clone(progress) });
});

addRoute('post', '/student/progress', (req, res) => {
  const user = auth(req, res, ['student']);
  if (!user) return;
  const student = findStudentByUserId(user._id);
  const { weight, height, bodyFat, muscleMass, chest, waist, hip, arm, thigh, notes } = req.body || {};
  const h = height || student.questionnaire.height || 175;
  const { imc, category } = calculateIMC(weight, h);
  const entry = { _id: nextId('progress'), student: student._id, weight, height: h, imc, bodyFat, muscleMass, chest, waist, hip, arm, thigh, notes, date: new Date() };
  store.progress.push(entry);
  student.questionnaire.weight = weight;
  student.imc = imc;
  student.imcCategory = category;
  res.status(201).json({ success: true, progress: clone(entry) });
});

addRoute('get', '/teacher/students', (req, res) => {
  const user = auth(req, res, ['teacher', 'admin']);
  if (!user) return;
  const students = store.students.filter((student) => student.teacher === user._id || user.role === 'admin').map(enrichStudent).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, students });
});

addRoute('get', '/teacher/students/:id', (req, res) => {
  const user = auth(req, res, ['teacher', 'admin']);
  if (!user) return;
  const student = enrichStudent(findStudentById(req.params.id));
  if (!student) return res.status(404).json({ success: false, message: 'Aluno nao encontrado.' });
  const workouts = store.workouts.filter((entry) => entry.student === req.params.id);
  const sessions = store.sessions.filter((entry) => entry.student === req.params.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  const progress = store.progress.filter((entry) => entry.student === req.params.id).sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({ success: true, student, workouts: clone(workouts), sessions: clone(sessions), progress: clone(progress) });
});

addRoute('post', '/teacher/students/:id/notes', (req, res) => {
  const user = auth(req, res, ['teacher', 'admin']);
  if (!user) return;
  const student = findStudentById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Aluno nao encontrado.' });
  student.notes.push({ text: req.body?.text || '', author: user.name, createdAt: new Date() });
  res.json({ success: true, notes: clone(student.notes) });
});

module.exports = router;
