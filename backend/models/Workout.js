const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  exerciseId: { type: String, default: '' },
  name: { type: String, required: true },
  muscleGroup: { type: String, required: true },
  equipment: { type: String, default: 'nenhum' },
  sets: { type: Number, required: true },
  reps: { type: String, required: true },
  restTime: { type: Number, default: 60 }, // seconds
  duration: { type: Number, default: 0 }, // seconds (for cardio)
  difficulty: { type: String, enum: ['iniciante', 'intermediario', 'avancado'], default: 'iniciante' },
  instructions: { type: String, default: '' },
  animationKey: { type: String, default: 'generic' },
  videoUrl: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const workoutSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    weekDay: { type: Number }, // 0=Dom...6=Sab, null=qualquer dia
    exercises: { type: [exerciseSchema], default: [] },
    objective: { type: String, default: '' },
    estimatedDuration: { type: Number, default: 60 }, // minutes
    isActive: { type: Boolean, default: true },
    generatedBy: { type: String, enum: ['ai', 'teacher', 'admin'], default: 'ai' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workout', workoutSchema);
