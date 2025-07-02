import type { Request, Response } from "express";
import { User } from "../models/User";
import { hashPassword, checkPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";
import slug from "slug";

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
