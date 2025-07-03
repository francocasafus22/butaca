import { genres } from "../data/genres";
import { Film } from "../models/Film";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface ITMDBMovie {
  id: number;
  popularity: number;
}

export async function updateAllFilmsPopularity() {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  const allFilms = await Film.find({}, { tmdbId: 1, _id: 0 });
  const ids = allFilms.map((film) => film.tmdbId);

  const bulkOps = [];

  for (const id of ids) {
    try {
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`;
      const response = await axios.get<ITMDBMovie>(url);
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
