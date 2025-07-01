import express from "express";
import userRoutes from "./routes/user.routes";
import { connectDB } from "./config/db";
import "dotenv/config";

connectDB();

const app = express();

// Middlewares
app.use(express.json());

app.use("/api/users", userRoutes);

export default app;
