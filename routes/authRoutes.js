const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { catchAsync } = require('../middlewares/error');
const { JWT_SECRET } = require('../middlewares/auth');

const router = express.Router();

// Hàm tạo JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
};

// API Đăng Ký - POST /register
router.post('/register', catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email này đã được sử dụng.' });
  }

  // Tạo tài khoản mới (role mặc định là 'user')
  const user = await User.create({ name, email, password });

  // Trả token về để Client tự đăng nhập luôn
  res.status(201).json({
    user,
    token: generateToken(user._id)
  });
}));

// API Đăng Nhập - POST /login
router.post('/login', catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Tìm user theo email
  const user = await User.findOne({ email });

  // Kiểm tra user tồn tại + password đúng
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
  }

  res.json({
    user,
    token: generateToken(user._id)
  });
}));

module.exports = router;
