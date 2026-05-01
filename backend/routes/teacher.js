const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const tc = require('../controllers/teacherController');

router.use(protect);
router.use(authorize('teacher', 'admin'));

router.get('/students', tc.getStudents);
router.get('/students/:id', tc.getStudentDetail);
router.put('/workouts/:workoutId', tc.updateWorkout);
router.post('/students/:id/notes', tc.addNote);

module.exports = router;
