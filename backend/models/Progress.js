const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: Date, default: Date.now },
    weight: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    imc: { type: Number, default: 0 },
    bodyFat: { type: Number, default: 0 },
    muscleMass: { type: Number, default: 0 },
    chest: { type: Number, default: 0 },
    waist: { type: Number, default: 0 },
    hip: { type: Number, default: 0 },
    arm: { type: Number, default: 0 },
    thigh: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Progress', progressSchema);
