import { genres } from "../data/genres";
import { ITMDBMovie } from "../interfaces/tmdb";

export function mapTMDBtoLocal(movie: ITMDBMovie) {
  const release_date = movie.release_date ? new Date(movie.release_date) : null;
  const genres_TMDB = movie.genre_ids.map((id) => genres[id]).filter(Boolean);

  return {
    tmdbId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
    overview: movie.overview,
    releaseDate: release_date,
    genres: genres_TMDB,
    popularity: movie.popularity,
  };
}
