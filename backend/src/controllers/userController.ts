import type { Request, Response } from "express";
import User from "../models/user";

export const getUser = async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
};
