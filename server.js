const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const fs = require('fs');
const { globalErrorHandler } = require('./middlewares/error');

const app = express();
app.use(express.json());
app.use(cors());

let mongoServer; // Khai báo biến toàn cục để giữ Data trên RAM, chống Node.js tự động dọn rác (GC)

// Khởi tạo MongoDB Ảo
async function connectDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  console.log('✅ MongoDB "Ảo" trong RAM đã chạy thành công tại:', uri);

  // Theo dõi trạng thái kết nối
  mongoose.connection.on('error', (err) => {
    console.error('🔴 Lỗi kết nối MongoDB:', err.message);
  });
  // mongoose.connection.on('disconnected', () => {
  //   console.warn('⚠️ MongoDB đã bị ngắt kết nối! Gõ "rs" trong terminal để khởi động lại.');
  // });
}

// Auth Routes (đăng ký / đăng nhập) - mount ở root /
app.use(require('./routes/authRoutes'));

// Routes khác (Auto-Load từ thư mục routes)
fs.readdirSync('./routes').forEach((file) => {
  if (file.endsWith('Routes.js') && file !== 'authRoutes.js') {
    const routeName = file.split('Routes.js')[0]; // Cắt lấy chữ 'todo' hoặc 'user'
    app.use(`/${routeName}s`, require(`./routes/${file}`));
  }
});

// Global Error Handler (Hứng toàn bộ lỗi từ catchAsync đẩy xuống)
app.use(globalErrorHandler);

const seedAdmin = require('./seed');

// Start server sau khi DB đã kết nối xong
connectDB().then(async () => {
  await seedAdmin(); // Tạo tài khoản admin mặc định
  app.listen(3001, () => console.log('Server running on http://localhost:3001'));
}).catch(err => console.error("Lỗi khi khởi động Database:", err));
