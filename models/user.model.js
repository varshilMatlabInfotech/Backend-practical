import mongoose from 'mongoose';
import { toJSON } from 'models/plugins';
import enumModel from 'models/enum.model';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: {
    type: String,
    // eslint-disable-next-line security/detect-unsafe-regex
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
  role: {
    type: String,
    enum: Object.values(enumModel.EnumRoleOfUser),
    default: enumModel.EnumRoleOfUser.USER,
  },
  password: { type: String, private: true },
});

UserSchema.plugin(toJSON);

// Check if email is already taken
UserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

// Hash password before save
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});
/**
 * When user reset password or change password then it save in bcrypt format
 */
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update && update.password) {
    const passwordHash = await bcrypt.hash(update.password, 10);
    this.getUpdate().password = passwordHash;
  }
  next();
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
