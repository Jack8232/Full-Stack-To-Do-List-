import { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
}

declare const User: Model<IUser>;
export default User; 