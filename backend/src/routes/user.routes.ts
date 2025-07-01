import { Router } from "express";
import { getUser } from "../controllers/userController";
import colors from "colors";

const UserRoutes = Router();

UserRoutes.get("/", getUser);

export default UserRoutes;
