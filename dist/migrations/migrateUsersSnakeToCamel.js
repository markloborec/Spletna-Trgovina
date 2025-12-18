"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../config/db");
const User_1 = require("../models/User");
dotenv_1.default.config();
async function migrateUsersSnakeToCamel() {
    try {
        await (0, db_1.connectDB)();
        console.log("Starting users migration (snake_case -> camelCase)...");
        // poišči userje, ki imajo stara polja
        const users = await User_1.User.find({
            $or: [{ first_name: { $exists: true } }, { last_name: { $exists: true } }],
        }).lean();
        console.log(`Found ${users.length} users to migrate.`);
        for (const u of users) {
            const set = {};
            const unset = {};
            if (u.first_name && !u.firstName) {
                set.firstName = u.first_name;
                unset.first_name = "";
            }
            if (u.last_name && !u.lastName) {
                set.lastName = u.last_name;
                unset.last_name = "";
            }
            if (Object.keys(set).length === 0 && Object.keys(unset).length === 0) {
                continue;
            }
            await User_1.User.updateOne({ _id: u._id }, {
                ...(Object.keys(set).length ? { $set: set } : {}),
                ...(Object.keys(unset).length ? { $unset: unset } : {}),
            });
        }
        console.log("Users migration finished.");
        process.exit(0);
    }
    catch (err) {
        console.error("Users migration error:", err);
        process.exit(1);
    }
}
migrateUsersSnakeToCamel();
