import { genres } from "../data/genres";
import { Film } from "../models/Film";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface ITMDBMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  popularity: number;
  genre_ids: number[];
}

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

export async function fetchAndSavePopularFilms(pages: number = 5) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  try {
    for (let page = 1; page <= pages; page++) {
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`;

      const response = await axios.get<{ results: ITMDBMovie[] }>(url);
      const movies = response.data.results;

      // Obtener los IDs de las peliculas existentes en local
      const moviesIDs = movies.map((m) => m.id);
      const existingIds = await Film.find({
        tmdbId: { $in: moviesIDs },
      }).distinct("tmdbId");

      const bulkOps = movies.map((movie) => {
        const mapped = mapTMDBtoLocal(movie);

        if (existingIds.includes(movie.id)) {
          return {
            // Solo actualizás campos que puedan variar (por ejemplo, popularidad)
            updateOne: {
              filter: { tmdbId: movie.id },
              update: { $set: { popularity: movie.popularity } },
            },
          };
        } else {
          return {
            // Insertás una nueva película
            insertOne: { document: mapped },
          };
        }
      });

      if (bulkOps.length > 0) {
        await Film.bulkWrite(bulkOps);
      }

      console.log(`Página ${page} procesada (${movies.length} películas).`);
    }
    console.log(
      `Las primeras ${pages * 20} peliculas populares fueron cargadas.`
    );
  } catch (error) {
    console.log("Error al obtener las peliculas: ", error.message);
  }
}
