const express = require('express');
const Todo = require('../models/Todo');
const User = require('../models/User'); // Import bảng User để kiểm tra
const { catchAsync } = require('../middlewares/error');

const router = express.Router();

// Lấy danh sách Todos của 1 User cụ thể (Bắt buộc truyền ?userId=...)
router.get('/', catchAsync(async (req, res) => {
  const userId = req.query.userId;
  
  if (!userId) {
    return res.status(400).json({ message: 'userId là bắt buộc' });
  }

  // 1. Kiểm tra xem người dùng có thực sự tồn tại trong DB không
  const userExists = await User.findById(userId);
  if (!userExists) {
    return res.status(404).json({ message: 'Người dùng (userId) không tồn tại trong hệ thống' });
  }

  // 2. Chuẩn bị câu Query thao tác với Data
  let query = Todo.find({ userId });
  
  // 3. Tùy chọn (Optional): Chỉ khi nào Postman URL có gắn thêm &userInfo=true thì mới kéo Data ra
  if (req.query.userInfo === 'true') {
    query = query.populate('user', 'name email');
  }

  const todos = await query; // Kích hoạt chạy lệnh Query
  res.json(todos);
}));

// Lấy thông tin 1 Todo theo ID
router.get('/:id', catchAsync(async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  if (!todo) return res.status(404).json({ message: 'Không tìm thấy Todo này' });
  res.json(todo);
}));

// Tạo mới Todo
router.post('/', catchAsync(async (req, res) => {
  const newTodo = new Todo(req.body);
  await newTodo.save();
  res.json(newTodo);
}));

// Sửa Todo
router.put('/:id', catchAsync(async (req, res) => {
  const updatedTodo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedTodo) return res.status(404).json({ message: 'Không tìm thấy Todo để cập nhật' });
  res.json(updatedTodo);
}));

// Xóa Todo
router.delete('/:id', catchAsync(async (req, res) => {
  const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
  if (!deletedTodo) return res.status(404).json({ message: 'Không tìm thấy Todo để xóa' });
  res.json({ message: 'Todo deleted' });
}));

module.exports = router;
