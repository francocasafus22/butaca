import type { Request, Response } from "express";
import { Film, IFilm } from "../models/Film";
import { genres } from "../data/genres";
import { fetchAndSavePopularFilms } from "../utils/fetchPopularFilms";
import axios, { all } from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

interface ITMDBMovie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string;
  release_date?: string;
  popularity: number;
  genre_ids: number[];
}

export const fetchSaveFilms = async (req: Request, res: Response) => {
  try {
    const page: number = Number(req.query.page);

    if (isNaN(page) || page < 1) {
      res.status(400).json({ message: "Número de página inválido." });
      return;
    }
    fetchAndSavePopularFilms(page);

    res.json({
      mensaje: "Peliculas populares actualizadas correctamente.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const queryLocalFilms = async (req: Request, res: Response) => {
  try {
    const query = req.query.q?.toString().trim();
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * 20;

    // Buscar en la DB
    const regex = new RegExp(query, "i");
    let localMovies = await Film.find({ title: { $regex: regex } })
      .skip(skip)
      .limit(20);

    // Calcular cuantas páginas hay
    const total = await Film.countDocuments({ title: { $regex: regex } });
    const totalPages = Math.ceil(total / 20);

    res.json({
      movies: localMovies,
      page: page,
      totalPages: totalPages,
      dataSource: "butaca",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const queryApiFilms = async (req: Request, res: Response) => {
  try {
    const query = req.query.q?.toString().trim();
    const page = Number(req.query.page) || 1;

    const url = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${query}&language=es-ES&page=${page}`;
    const response = await axios.get<{
      results: ITMDBMovie[];
      total_pages: Number;
    }>(url);

    const movies = response.data.results.map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date ? new Date(movie.release_date) : null,
      genres: movie.genre_ids.map((id: number) => genres[id]).filter(Boolean),
      popularity: movie.popularity,
    }));

    res.json({
      movies: movies,
      page: page,
      totalPages: response.data.total_pages,
      dataSource: "tmdb",
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al buscar en TMDb", error: error.message });
  }
};
