import mongoose, { Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  username: string;
}

const User = mongoose.model<IUser>('User', new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  username: { type: String, required: true }
}));

export default User; 