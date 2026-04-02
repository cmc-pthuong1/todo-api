const express = require('express');
const User = require('../models/User');
const { catchAsync } = require('../middlewares/error');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Chỉ admin mới được quản lý Users
router.use(protect, authorize('admin'));

// Lấy danh sách Users (chỉ role: 'user')
router.get('/', catchAsync(async (req, res) => {
  const users = await User.find({ role: 'user' });
  res.json(users);
}));

// Lấy tất cả Users (bao gồm admin)
router.get('/all', catchAsync(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));

// Lấy thông tin 1 User theo ID
router.get('/:id', catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng này' });
  res.json(user);
}));

// Tạo mới User
router.post('/', catchAsync(async (req, res) => {
  if (req.body.role === 'admin') {
    return res.status(403).json({ message: 'Không được phép tạo tài khoản với quyền admin' });
  }
  const newUser = new User(req.body);
  await newUser.save();
  res.json(newUser);
}));

// Sửa User
router.put('/:id', catchAsync(async (req, res) => {
  if (req.body.role === 'admin') {
    return res.status(403).json({ message: 'Không được phép thay đổi quyền thành admin' });
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng để cập nhật' });
  res.json(updatedUser);
}));

// Xóa User
router.delete('/:id', catchAsync(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (!deletedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng để xóa' });
  res.json({ message: 'Đã xóa người dùng thành công' });
}));

module.exports = router;
