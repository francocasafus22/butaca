import { Router } from "express";
import { body } from "express-validator";
import { createAccount, getUser, login } from "../controllers/userController";
import { handleInputErrors } from "../middlewares/validation";

const UserRoutes = Router();

UserRoutes.get("/", getUser);

UserRoutes.post(
  "/register",

  body("username").notEmpty().withMessage("User obligatorio"),
  body("email").notEmpty().withMessage("Email obligatorio"),
  body("password")
    .isStrongPassword()
    .withMessage(
      "La contraseña debe tener mas de 8 caractere, una mayuscula, un numero y un simbolo"
    ),
  handleInputErrors,
  createAccount
);

UserRoutes.post(
  "/login",
  body("email").notEmpty().withMessage("Email obligatorio."),
  body("password").notEmpty().withMessage("Contraseña obligatoria."),
  handleInputErrors,
  login
);

export default UserRoutes;
