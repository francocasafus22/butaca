import { Router } from "express";
import { createAccount, getUser, login } from "../controllers/userController";

const UserRoutes = Router();

UserRoutes.get("/", getUser);

UserRoutes.post("/register", createAccount);

UserRoutes.post("/login", login);

export default UserRoutes;
