const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: Number, // Quy định _id tự tăng
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, default: 18 }
}, {
  toJSON: {
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Middleware: Tự động đếm và tăng ID
userSchema.pre('save', async function (next) {
  if (this.isNew) {
    const highest = await this.constructor.findOne().sort('-_id').exec();
    this._id = highest ? highest._id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
