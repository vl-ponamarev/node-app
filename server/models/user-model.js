const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  isActivated: { type: Boolean, default: false },
  activationLink: { type: String },
  remember: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

module.exports = model('User', UserSchema);
