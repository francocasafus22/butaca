import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFavFilms {
  film: Types.ObjectId;
  watched: boolean;
  rating?: number;
  review?: string;
  watchedAt?: Date;
}

// Interfaz para los datos de User
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fav_films: IFavFilms[];
}

const FavFilmSchema = new Schema<IFavFilms>({
  film: { type: Schema.Types.ObjectId, ref: "Film", required: true },
  watched: { type: Boolean, required: true, default: false },
  rating: { type: Number, required: false, min: 1, max: 5 },
  review: { type: String, required: false, trim: true },
  watchedAt: { type: Date, required: false },
});

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, trim: true },
  fav_films: { type: [FavFilmSchema], default: [] },
});

export const User = mongoose.model<IUser>("User", UserSchema);
