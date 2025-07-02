import type { Request, Response } from "express";
import { User } from "../models/User";
import { hashPassword } from "../utils/auth";
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

    const username = slug(req.body.username, "");
    const usernameExist = await User.findOne({ username });

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
