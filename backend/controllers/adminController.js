const User = require('../models/User');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const WorkoutSession = require('../models/WorkoutSession');
const { calculateIMC } = require('../services/imcCalculator');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ lastWorkout: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

    const today = new Date();
    const overduePayments = await Payment.countDocuments({ status: 'vencido' });

    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingPayments = await Payment.countDocuments({
      status: 'pendente',
      dueDate: { $lte: sevenDaysFromNow, $gte: today },
    });

    const inactiveThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const inactiveStudents = await Student.countDocuments({
      questionnaireCompleted: true,
      $or: [{ lastWorkout: { $lte: inactiveThreshold } }, { lastWorkout: null }],
    });

    const recentSessions = await WorkoutSession.find({ completed: true })
      .sort({ date: -1 })
      .limit(10)
      .populate({ path: 'student', populate: { path: 'user', select: 'name' } });

    res.json({
      success: true,
      stats: { totalStudents, activeStudents, overduePayments, upcomingPayments, inactiveStudents },
      recentSessions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email phone active createdAt')
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const { name, email, password, phone, monthlyFee, paymentDueDay, teacherId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email já cadastrado.' });

    const user = await User.create({ name, email, password: password || '123456', role: 'student', phone });
    const student = await Student.create({
      user: user._id,
      teacher: teacherId || null,
      monthlyFee: monthlyFee || 100,
      paymentDueDay: paymentDueDay || 10,
    });

    // Create first payment
    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), paymentDueDay || 10);
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);

    await Payment.create({
      student: student._id,
      amount: monthlyFee || 100,
      referenceMonth: dueDate.getMonth() + 1,
      referenceYear: dueDate.getFullYear(),
      dueDate,
    });

    const populated = await Student.findById(student._id).populate('user', 'name email phone').populate('teacher', 'name');
    res.status(201).json({ success: true, student: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, active, monthlyFee, paymentDueDay, teacherId } = req.body;

    const student = await Student.findById(id).populate('user');
    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    if (name) student.user.name = name;
    if (email) student.user.email = email;
    if (phone !== undefined) student.user.phone = phone;
    if (active !== undefined) student.user.active = active;
    await student.user.save();

    if (monthlyFee) student.monthlyFee = monthlyFee;
    if (paymentDueDay) student.paymentDueDay = paymentDueDay;
    if (teacherId !== undefined) student.teacher = teacherId || null;
    await student.save();

    res.json({ success: true, message: 'Aluno atualizado com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    await User.findByIdAndUpdate(student.user, { active: false });
    res.json({ success: true, message: 'Aluno desativado com sucesso.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const { status, studentId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (studentId) filter.student = studentId;

    const payments = await Payment.find(filter)
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ dueDate: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paidDate, paymentMethod, notes, amount } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Pagamento não encontrado.' });

    if (status) payment.status = status;
    if (paidDate) payment.paidDate = paidDate;
    if (paymentMethod) payment.paymentMethod = paymentMethod;
    if (notes !== undefined) payment.notes = notes;
    if (amount) payment.amount = amount;

    if (status === 'pago' && !payment.paidDate) {
      payment.paidDate = new Date();
    }

    await payment.save();

    // If paid, generate next month's payment
    if (status === 'pago') {
      const student = await require('../models/Student').findById(payment.student);
      const nextMonth = new Date(payment.referenceYear, payment.referenceMonth, student.paymentDueDay);
      const existing = await Payment.findOne({
        student: payment.student,
        referenceMonth: nextMonth.getMonth() + 1,
        referenceYear: nextMonth.getFullYear(),
      });

      if (!existing) {
        await Payment.create({
          student: payment.student,
          amount: student.monthlyFee,
          referenceMonth: nextMonth.getMonth() + 1,
          referenceYear: nextMonth.getFullYear(),
          dueDate: nextMonth,
        });
      }
    }

    res.json({ success: true, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', active: true }).select('name email phone');
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email já cadastrado.' });

    const teacher = await User.create({ name, email, password: password || '123456', role: 'teacher', phone });
    res.status(201).json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
