import express from "express";
import UserRoutes from "./routes/user.routes";
import { connectDB } from "./config/db";
import "dotenv/config";
import FilmRoutes from "./routes/film.routes";

connectDB();

const app = express();

// Middlewares
app.use(express.json());

app.use("/api/users", UserRoutes);
app.use("/api/films", FilmRoutes);

export default app;
