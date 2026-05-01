const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const sc = require('../controllers/studentController');

router.use(protect);
router.use(authorize('student'));

router.get('/profile', sc.getProfile);
router.post('/questionnaire', sc.submitQuestionnaire);
router.get('/workout/today', sc.getTodayWorkout);
router.get('/workouts', sc.getWorkouts);
router.post('/session', sc.startSession);
router.put('/session/:id', sc.updateSession);
router.get('/sessions', sc.getSessions);
router.get('/payments', sc.getPayments);
router.get('/progress', sc.getProgress);
router.post('/progress', sc.addProgress);

module.exports = router;
