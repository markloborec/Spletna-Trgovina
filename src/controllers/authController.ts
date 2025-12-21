import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../models/User";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../middleware/authMiddleware";

const SALT_ROUNDS = 10;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function register(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      deliveryAddress,
      phone,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "REGISTER_MISSING_FIELDS" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "REGISTER_EMAIL_EXISTS" });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      email: email.toLowerCase(),
      deliveryAddress: deliveryAddress ?? "",
      phone: phone ?? "",
      password_hash,
      is_admin: false,
    });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      is_admin: user.is_admin,
    });

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        deliveryAddress: user.deliveryAddress,
        phone: user.phone,
        is_admin: user.is_admin,
      },
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
      is_admin: user.is_admin,
    });

    return res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        deliveryAddress: user.deliveryAddress,
        phone: user.phone,
        is_admin: user.is_admin,
      },
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      deliveryAddress: user.deliveryAddress,
      phone: user.phone,
      is_admin: user.is_admin,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "ME_FAILED" });
  }
}

/**
 * Pozabljeno geslo (request reset)
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: "FORGOT_PASSWORD_MISSING_EMAIL" });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });

    // Vedno vrni 200 (da ne razkrivaš, ali email obstaja)
    if (!user) {
      return res.json({ message: "RESET_REQUESTED" });
    }

    const rawToken = crypto.randomBytes(24).toString("hex");
    const tokenHash = sha256Hex(rawToken);

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    // POZOR: v pravi aplikaciji token pošlješ po emailu.
    // Za šolski projekt ga vračamo, da lahko FE prikaže korak "ponastavi".
    return res.json({ message: "RESET_REQUESTED", resetToken: rawToken });
  } catch (err) {
    console.error("ForgotPassword error:", err);
    return res.status(500).json({ error: "FORGOT_PASSWORD_FAILED" });
  }
}

/**
 * Ponastavi geslo (apply reset)
 * POST /api/auth/reset-password
 * Body: { token, newPassword }
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      return res.status(400).json({ error: "RESET_PASSWORD_MISSING_FIELDS" });
    }

    const tokenHash = sha256Hex(String(token));
    const now = new Date();

    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: now },
    });

    if (!user) {
      return res.status(400).json({ error: "RESET_PASSWORD_INVALID_OR_EXPIRED" });
    }

    user.password_hash = await bcrypt.hash(String(newPassword), SALT_ROUNDS);
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "PASSWORD_RESET_OK" });
  } catch (err) {
    console.error("ResetPassword error:", err);
    return res.status(500).json({ error: "RESET_PASSWORD_FAILED" });
  }
}
