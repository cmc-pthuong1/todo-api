const express = require('express');
const Todo = require('../models/Todo');
const { catchAsync } = require('../middlewares/error');
const { protect } = require('../middlewares/auth');

const router = express.Router();
router.use(protect)// check authenticate

// Lấy danh sách Todos của User đang đăng nhập
router.get('/', catchAsync(async (req, res) => {
  let query = Todo.find({ userId: req.user._id });
  
  // Tùy chọn: Gắn thêm ?userInfo=true để kéo thông tin User ra
  if (req.query.userInfo === 'true') {
    query = query.populate('user', 'name email');
  }

  const todos = await query;
  res.json(todos);
}));

// Lấy thông tin 1 Todo theo ID (chỉ xem được Todo của chính mình)
router.get('/:id', catchAsync(async (req, res) => {
  const todo = await Todo.findOne({ _id: req.params.id, userId: req.user._id });
  if (!todo) return res.status(404).json({ message: 'Không tìm thấy Todo này' });
  res.json(todo);
}));

// Tạo mới Todo (ép userId từ token, không tin request)
router.post('/', catchAsync(async (req, res) => {
  req.body.userId = req.user._id; // Ép cứng userId từ token
  const newTodo = new Todo(req.body);
  await newTodo.save();
  res.json(newTodo);
}));

// Sửa Todo (chỉ sửa được Todo của chính mình)
router.put('/:id', catchAsync(async (req, res) => {
  const updatedTodo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );
  if (!updatedTodo) return res.status(404).json({ message: 'Không tìm thấy Todo để cập nhật' });
  res.json(updatedTodo);
}));

// Xóa Todo (chỉ xóa được Todo của chính mình)
router.delete('/:id', catchAsync(async (req, res) => {
  const deletedTodo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!deletedTodo) return res.status(404).json({ message: 'Không tìm thấy Todo để xóa' });
  res.json({ message: 'Đã xóa Todo thành công' });
}));

module.exports = router;
