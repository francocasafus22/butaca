import { Film } from "../models/Film";
import axios from "axios";
import dotenv from "dotenv";
import { ITMDBMovie, ITMDBMoviePopularity } from "../interfaces/tmdb";
import { mapTMDBtoLocal } from "../utils/mapTMDBtoLocal";
dotenv.config();

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

export async function updateAllFilmsPopularity() {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  const allFilms = await Film.find({}, { tmdbId: 1, _id: 0 });
  const ids = allFilms.map((film) => film.tmdbId);

  const bulkOps = [];

  for (const id of ids) {
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`;
      const response = await axios.get<ITMDBMoviePopularity>(url);
      const popularity = response.data.popularity;

      bulkOps.push({
        updateOne: {
          filter: { tmdbId: id },
          update: { $set: { popularity } },
        },
      });
    } catch (error) {
      console.error(`Error al actualizar película ID ${id}:`, error);
    }
  }

  if (bulkOps.length > 0) {
    await Film.bulkWrite(bulkOps);
    console.log(`Actualizadas ${bulkOps.length} películas.`);
  }
}
