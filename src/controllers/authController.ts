import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/authMiddleware";

const SALT_ROUNDS = 10;

export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "REGISTER_MISSING_FIELDS" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "REGISTER_EMAIL_EXISTS" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email.toLowerCase(),
      password_hash,
      is_admin: false
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      is_admin: user.is_admin
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "REGISTER_FAILED" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "LOGIN_MISSING_FIELDS" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "LOGIN_INVALID_CREDENTIALS" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "LOGIN_INVALID_CREDENTIALS" });
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      is_admin: user.is_admin
    });

    return res.json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_admin: user.is_admin
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "LOGIN_FAILED" });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });
    }

    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    return res.json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_admin: user.is_admin
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "ME_FAILED" });
  }
}
