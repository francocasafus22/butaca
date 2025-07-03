import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFilm extends Document {
  tmdbId: number;
  title: string;
  posterPath?: string;
  overview?: string;
  releaseDate?: Date;
  genres?: string[];
  popularity?: number;
}

const FilmSchema = new Schema<IFilm>({
  tmdbId: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  posterPath: { type: String, required: false },
  overview: { type: String, required: false },
  releaseDate: { type: Date, required: false },
  genres: [{ type: String, required: false }],
  popularity: { type: Number },
});

export const Film = mongoose.model<IFilm>("Film", FilmSchema);
