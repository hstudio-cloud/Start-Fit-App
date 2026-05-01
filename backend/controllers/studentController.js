const Student = require('../models/Student');
const Workout = require('../models/Workout');
const WorkoutSession = require('../models/WorkoutSession');
const Payment = require('../models/Payment');
const Progress = require('../models/Progress');
const { calculateIMC } = require('../services/imcCalculator');
const { generateWorkouts } = require('../services/workoutGenerator');

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('teacher', 'name email phone');
    if (!student) return res.status(404).json({ success: false, message: 'Perfil de aluno não encontrado.' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.submitQuestionnaire = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    const {
      objective, level, availableDays, timePerWorkout,
      focusMuscles, routine, physicalLimitations, weight, height, age, gender,
    } = req.body;

    const { imc, category } = calculateIMC(weight, height);

    student.questionnaire = {
      objective, level, availableDays, timePerWorkout,
      focusMuscles, routine, physicalLimitations, weight, height, age, gender,
      completedAt: new Date(),
    };
    student.imc = imc;
    student.imcCategory = category;
    student.questionnaireCompleted = true;
    await student.save();

    // Generate initial progress entry
    await Progress.create({ student: student._id, weight, height, imc });

    // Generate workouts
    await Workout.deleteMany({ student: student._id, generatedBy: 'ai' });
    const workoutPlans = generateWorkouts(student.questionnaire);
    for (const plan of workoutPlans) {
      await Workout.create({ student: student._id, ...plan });
    }

    res.json({ success: true, message: 'Questionário salvo e treinos gerados com sucesso!', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getTodayWorkout = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    const todayDay = new Date().getDay();
    let workout = await Workout.findOne({ student: student._id, weekDay: todayDay, isActive: true });

    if (!workout) {
      workout = await Workout.findOne({ student: student._id, isActive: true }).sort({ createdAt: 1 });
    }

    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getWorkouts = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const workouts = await Workout.find({ student: student._id, isActive: true }).sort({ weekDay: 1 });
    res.json({ success: true, workouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.startSession = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const { workoutId, workoutName, exercises } = req.body;

    const session = await WorkoutSession.create({
      student: student._id,
      workout: workoutId || null,
      workoutName,
      startTime: new Date(),
      exercises: exercises || [],
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const { id } = req.params;
    const { exercises, generalNotes, rating, completed } = req.body;

    const session = await WorkoutSession.findOne({ _id: id, student: student._id });
    if (!session) return res.status(404).json({ success: false, message: 'Sessão não encontrada.' });

    if (exercises) session.exercises = exercises;
    if (generalNotes !== undefined) session.generalNotes = generalNotes;
    if (rating) session.rating = rating;
    if (completed) {
      session.completed = true;
      session.endTime = new Date();
      session.totalDuration = Math.round((session.endTime - session.startTime) / 60000);

      student.lastWorkout = new Date();
      student.totalWorkouts = (student.totalWorkouts || 0) + 1;
      await student.save();
    }

    await session.save();
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const sessions = await WorkoutSession.find({ student: student._id }).sort({ date: -1 }).limit(30);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const payments = await Payment.find({ student: student._id }).sort({ dueDate: -1 });
    res.json({ success: true, payments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const progress = await Progress.find({ student: student._id }).sort({ date: 1 }).limit(24);
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProgress = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    const { weight, height, bodyFat, muscleMass, chest, waist, hip, arm, thigh, notes } = req.body;

    const h = height || student.questionnaire.height;
    const { imc } = calculateIMC(weight, h);

    const progress = await Progress.create({
      student: student._id, weight, height: h, imc, bodyFat, muscleMass,
      chest, waist, hip, arm, thigh, notes,
    });

    if (weight) {
      student.questionnaire.weight = weight;
      student.imc = imc;
      const { category } = calculateIMC(weight, h);
      student.imcCategory = category;
      await student.save();
    }

    res.status(201).json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
