const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  _id: Number, // Quy định _id tự tăng
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: [true, 'Vui lòng nhập mật khẩu'] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Không trả về password khi truy vấn JSON
    }
  }
});

// Middleware: Tự động đếm và tăng ID
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const highest = await this.constructor.findOne().sort('-_id').exec();
    this._id = highest ? highest._id + 1 : 1;
  }
  // Băm mật khẩu nếu password được tạo mới hoặc bị sửa đổi
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  next();
});

// Hàm kiểm tra mật khẩu lúc đăng nhập
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
