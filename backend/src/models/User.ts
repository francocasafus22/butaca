import mongoose, { Document, Schema } from "mongoose";

// Interfaz para los datos de User
export interface IUser extends Document {
  user: string;
  email: string;
  password: string;
}

const UserSchema = new Schema<IUser>({
  user: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
});

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
