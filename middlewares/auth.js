const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'todo-api-secret-key-2026'; // Secret key để ký và xác minh token

// Middleware "Anh Bảo Vệ" - Kiểm tra token trước khi cho vào API
const protect = async (req, res, next) => {
  let token;

  // 1. Lấy token từ Header: Authorization: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Cắt lấy phần token sau chữ "Bearer "
  }

  // 2. Không có token -> Chặn lại
  if (!token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập! Vui lòng đăng nhập để truy cập.' });
  }

  try {
    // 3. Giải mã token, kiểm tra hạn và tính hợp lệ
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Tìm User từ ID trong token, gắn vào req.user để các route phía sau dùng
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: 'Thông tin đăng nhập không chính xác.' });
    }

    req.user = currentUser;
    next(); // Cho đi tiếp vào API
  } catch (err) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// Middleware kiểm tra quyền (role) - Chạy SAU protect
// Ví dụ: authorize('admin') -> chỉ admin mới được vào
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role "${req.user.role}" không có quyền truy cập chức năng này.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
