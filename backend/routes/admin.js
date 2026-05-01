const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const ac = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', ac.getDashboardStats);
router.get('/students', ac.getStudents);
router.post('/students', ac.createStudent);
router.put('/students/:id', ac.updateStudent);
router.delete('/students/:id', ac.deleteStudent);
router.get('/payments', ac.getPayments);
router.put('/payments/:id', ac.updatePayment);
router.get('/teachers', ac.getTeachers);
router.post('/teachers', ac.createTeacher);

module.exports = router;
