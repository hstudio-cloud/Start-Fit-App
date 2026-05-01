const User = require('../models/User');
const Student = require('../models/Student');
const Workout = require('../models/Workout');
const WorkoutSession = require('../models/WorkoutSession');
const Progress = require('../models/Progress');

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id })
      .populate('user', 'name email phone active createdAt')
      .sort({ createdAt: -1 });
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStudentDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id)
      .populate('user', 'name email phone')
      .populate('teacher', 'name email');

    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    const workouts = await Workout.find({ student: student._id });
    const sessions = await WorkoutSession.find({ student: student._id }).sort({ date: -1 }).limit(10);
    const progress = await Progress.find({ student: student._id }).sort({ date: 1 });

    res.json({ success: true, student, workouts, sessions, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateWorkout = async (req, res) => {
  try {
    const { workoutId } = req.params;
    const workout = await Workout.findByIdAndUpdate(
      workoutId,
      { ...req.body, generatedBy: 'teacher' },
      { new: true }
    );
    if (!workout) return res.status(404).json({ success: false, message: 'Treino não encontrado.' });
    res.json({ success: true, workout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });

    student.notes.push({ text, author: req.user.name });
    await student.save();

    res.json({ success: true, notes: student.notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
