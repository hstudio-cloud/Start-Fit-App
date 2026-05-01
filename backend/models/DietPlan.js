const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    time: { type: String, default: '' },
    foods: { type: [String], default: [] },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const dietPlanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    title: { type: String, required: true },
    goal: { type: String, default: '' },
    hydrationLiters: { type: Number, default: 2 },
    caloriesTarget: { type: Number, default: 0 },
    meals: { type: [mealSchema], default: [] },
    tips: { type: [String], default: [] },
    notes: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DietPlan', dietPlanSchema);
