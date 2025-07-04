import type { Request, Response } from "express";
import { IMyFilms, User } from "../models/User";
import { hashPassword, checkPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import slug from "slug";
import axios from "axios";
import { Film } from "../models/Film";
import { ITMDBMovie } from "../interfaces/tmdb";
import { mapTMDBtoLocal } from "../utils/mapTMDBtoLocal";
import mongoose from "mongoose";

export const getUser = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
      const error = new Error("El email ya está en uso, pruebe con otro.");
      res.status(400).json({ error: error.message });
      return;
    }

    // remove spaces and capital letters
    const username = slug(req.body.username, "");
    const usernameExist = await User.findOne({ username });

    // check if the username is used
    if (usernameExist) {
      const error = new Error("El user ya está en uso, pruebe con otro.");
      res.status(400).json({ error: error.message });
      return;
    }

    const user = new User(req.body);

    user.password = await hashPassword(password);
    user.username = username;

    await user.save();

    res.status(201).json({ message: "Usuario creado" });
  } catch (error) {
    console.error("Error al registrar: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // check if the email is registered
    if (!user) {
      const error = new Error("No hay ningun user con ese mail.");
      res.status(400).json({ error: error.message });
      return;
    }

    const isPasswordCorrect = await checkPassword(password, user.password);

    // check if the hash password is correct
    if (!isPasswordCorrect) {
      const error = new Error("La contraseña no es correcta");
      res.status(400).json({ error: error.message });
      return;
    }

    // generate the jwt
    const token = generateJWT({ id: user._id });

    res.send(token);
  } catch (error) {
    console.error("Error al iniciar sesion:", error.message);
    res.status(500).json({ error: error.message });
  }
};

function generateStatusMessage(watched: boolean, isFavourite: boolean) {
  if (isFavourite && watched)
    return "Película agregada a tus favoritas y marcada como vista.";
  if (isFavourite) return "Película agregada a tus favoritas.";
  if (watched) return "Película marcada como vista.";
  return "Película agregada a tu lista por ver.";
}

export const addFilm = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "No autorizado." });
      return;
    }

    const tmdbId = Number(req.params.film);
    const { watched, isFavourite } = req.body;

    if (!tmdbId) {
      res.status(400).json({ error: "tmdbId es requerido." });
      return;
    }

    let movie = await Film.findOne({ tmdbId: tmdbId }, { _id: 1 });

    if (!movie) {
      const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=es-ES`;
      const response = await axios.get<ITMDBMovie>(url);

      const newMovie = mapTMDBtoLocal(response.data);
      movie = await Film.create(newMovie);
    }

    const movieId = movie._id as mongoose.Types.ObjectId;

    const existsIndex = user.myFilms.findIndex((f) => f.film.equals(movieId));

    if (existsIndex >= 0) {
      // Actualizar campos existentes
      if (watched !== undefined) user.myFilms[existsIndex].watched = watched;
      if (isFavourite !== undefined)
        user.myFilms[existsIndex].isFavourite = isFavourite;
    } else {
      user.myFilms.unshift({
        film: movieId,
        watched: watched ?? false,
        isFavourite: isFavourite ?? false,
      });
    }

    await user.save();

    res
      .status(201)
      .json({ message: generateStatusMessage(watched, isFavourite) });
  } catch (error) {
    console.error("Error al agregar a favoritos: ", error.message);
    res.status(500).json({ error: error.message });
  }
};
