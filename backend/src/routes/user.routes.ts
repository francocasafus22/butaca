import { Router } from "express";
import { createAccount, getUser } from "../controllers/userController";

const UserRoutes = Router();

UserRoutes.get("/", getUser);

UserRoutes.post("/register", createAccount);

export default UserRoutes;
