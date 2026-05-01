const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Nome, email e senha são obrigatórios.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado.' });
    }

    const user = await User.create({ name, email, password, role: role === 'admin' ? 'student' : role, phone });

    if (user.role === 'student') {
      await Student.create({ user: user._id });
    }

    const token = generateToken(user._id, user.role);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
    }

    if (!user.active) {
      return res.status(401).json({ success: false, message: 'Conta desativada. Contate o administrador.' });
    }

    const token = generateToken(user._id, user.role);
    const userData = user.toJSON();

    res.json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    let extra = null;

    if (user.role === 'student') {
      extra = await Student.findOne({ user: user._id }).populate('teacher', 'name email');
    }

    res.json({ success: true, user, student: extra });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
