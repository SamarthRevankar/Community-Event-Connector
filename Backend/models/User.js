const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  bio: { type: String, trim: true, maxlength: 300, default: '' },
  avatar: { type: String, trim: true, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
