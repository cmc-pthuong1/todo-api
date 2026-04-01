const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  _id: Number, // Quy định _id là số thay vì mã khoá 24 ký tự
  userId: { 
    type: Number, 
    ref: 'User', // Sợi dây liên kết (Relationship) trỏ đến bảng User
    required: [true, 'Một Todo bắt buộc phải thuộc về một User (Thiếu userId)'] 
  },
  title: String,
  completed: { type: Boolean, default: false }
}, {
  // Config: Định hình làm sạch Data trước khi trả thành chuỗi JSON
  toJSON: {
    virtuals: true, // Bật tính năng trường ảo
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Dọn vỏ ảo nếu không được Populate để JSON gọn nhẹ (Tránh ném ra 'user': null)
      if (!ret.user) {
        delete ret.user;
      }
    }
  }
});

// Khai báo một trường ảo tên là 'user' để nhận cục Object Mongoose xịt vào
todoSchema.virtual('user', {
  ref: 'User',         // Tham chiếu tới bảng User
  localField: 'userId',// Lấy giá trị cột userId ở bảng Todo hiện tại...
  foreignField: '_id', // ...đem so khớp với ID (cột _id) của bên bảng User
  justOne: true        // 1 công việc chỉ có 1 User nên chọn true
});

// Middleware: Tự động đếm và tăng ID bắt đầu từ 1
todoSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Tìm Todo có ID lớn nhất hiện tại
    const highest = await this.constructor.findOne().sort('-_id').exec();
    this._id = highest ? highest._id + 1 : 1; // Số lớn nhất + 1 (hoặc 1 nếu là Todo đầu tiên)
  }
  next();
});

module.exports = mongoose.model('Todo', todoSchema);
