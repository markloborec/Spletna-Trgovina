"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const SALT_ROUNDS = 10;
async function register(req, res) {
    try {
        const { firstName, lastName, email, deliveryAddress, phone, password,
        // confirmPassword ignoriramo (FE-only)
         } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "REGISTER_MISSING_FIELDS" });
        }
        const existing = await User_1.User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: "REGISTER_EMAIL_EXISTS" });
        }
        const password_hash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const user = await User_1.User.create({
            firstName: firstName ?? "",
            lastName: lastName ?? "",
            email: email.toLowerCase(),
            deliveryAddress: deliveryAddress ?? "",
            phone: phone ?? "",
            password_hash,
            is_admin: false,
        });
        const token = (0, jwt_1.signToken)({
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
    }
    catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "REGISTER_FAILED" });
    }
}
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "LOGIN_MISSING_FIELDS" });
        }
        const user = await User_1.User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: "LOGIN_INVALID_CREDENTIALS" });
        }
        const valid = await bcrypt_1.default.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: "LOGIN_INVALID_CREDENTIALS" });
        }
        const token = (0, jwt_1.signToken)({
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
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "LOGIN_FAILED" });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "AUTH_NOT_LOGGED_IN" });
        }
        const user = await User_1.User.findById(req.user.id).lean();
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
    }
    catch (err) {
        console.error("GetMe error:", err);
        return res.status(500).json({ error: "ME_FAILED" });
    }
}
