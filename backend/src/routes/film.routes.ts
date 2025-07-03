import { Router } from "express";
import { body } from "express-validator";
import { queryLocalFilms, queryApiFilms } from "../controllers/filmController";
import { handleInputErrors } from "../middlewares/validation";

const FilmRoutes = Router();

FilmRoutes.get("/queryLocalFilms", queryLocalFilms);
FilmRoutes.get("/queryApiFilms", queryApiFilms);

export default FilmRoutes;
