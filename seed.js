const User = require('./models/User');

// Tạo sẵn tài khoản admin nếu chưa tồn tại
async function seedAdmin() {
  const adminEmail = 'admin@todoapp.com';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    console.log('👤 Tài khoản Admin đã tồn tại, bỏ qua seed.');
    return;
  }

  const admin = new User({
    name: 'Admin',
    email: adminEmail,
    password: 'admin123',
    role: 'admin'
  });

  await admin.save();
  console.log('✅ Đã tạo tài khoản Admin mặc định (admin@todoapp.com / admin123)');
}

module.exports = seedAdmin;
