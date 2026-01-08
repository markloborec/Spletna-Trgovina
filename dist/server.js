"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const PORT = Number(process.env.PORT) || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
app_1.default.listen(PORT, () => {
    console.log("====================================");
    console.log(`🚀 Server running`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🔌 Port: ${PORT}`);
    console.log("====================================");
});
