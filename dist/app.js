"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const index_1 = require("./routes/index");
const db_1 = require("./config/db");
const products_1 = __importDefault(require("./routes/products"));
const categories_1 = __importDefault(require("./routes/categories"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api", index_1.router);
app.use("/api/products", products_1.default);
app.use("/api/categories", categories_1.default);
app.use("/api/users", users_1.default);
(0, db_1.connectDB)().catch((err) => {
    console.error("Fatal: cannot connect to MongoDB", err);
    process.exit(1);
});
exports.default = app;
