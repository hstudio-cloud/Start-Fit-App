const mongoose = require('mongoose');

const exerciseSessionSchema = new mongoose.Schema({
  exerciseName: { type: String, required: true },
  muscleGroup: { type: String },
  plannedSets: { type: Number },
  plannedReps: { type: String },
  completedSets: { type: Number, default: 0 },
  load: { type: Number, default: 0 }, // kg
  reps: { type: String, default: '' },
  observations: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  duration: { type: Number, default: 0 }, // seconds
});

const workoutSessionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    workout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout' },
    workoutName: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    startTime: { type: Date },
    endTime: { type: Date },
    totalDuration: { type: Number, default: 0 }, // minutes
    exercises: { type: [exerciseSessionSchema], default: [] },
    generalNotes: { type: String, default: '' },
    rating: { type: Number, min: 1, max: 5, default: null },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkoutSession', workoutSessionSchema);
