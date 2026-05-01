const mongoose = require('mongoose');

const questionnaireSchema = new mongoose.Schema({
  objective: { type: String, enum: ['emagrecer', 'ganhar_massa', 'condicionamento', 'saude', 'força'], default: 'saude' },
  level: { type: String, enum: ['iniciante', 'intermediario', 'avancado'], default: 'iniciante' },
  availableDays: { type: [Number], default: [] }, // 0=Dom, 1=Seg ... 6=Sab
  timePerWorkout: { type: Number, default: 60 }, // minutes
  focusMuscles: { type: [String], default: [] },
  routine: { type: String, default: '' },
  physicalLimitations: { type: String, default: '' },
  weight: { type: Number, default: 0 }, // kg
  height: { type: Number, default: 0 }, // cm
  age: { type: Number, default: 0 },
  gender: { type: String, enum: ['masculino', 'feminino', 'outro'], default: 'masculino' },
  completedAt: { type: Date },
});

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    questionnaire: { type: questionnaireSchema, default: () => ({}) },
    imc: { type: Number, default: 0 },
    imcCategory: { type: String, default: '' },
    enrollmentDate: { type: Date, default: Date.now },
    monthlyFee: { type: Number, default: 100 },
    paymentDueDay: { type: Number, default: 10 },
    notes: { type: [{ text: String, author: String, createdAt: { type: Date, default: Date.now } }], default: [] },
    questionnaireCompleted: { type: Boolean, default: false },
    lastWorkout: { type: Date, default: null },
    totalWorkouts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);
