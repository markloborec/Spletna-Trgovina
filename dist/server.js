"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const products_1 = __importDefault(require("./routes/products"));
app_1.default.use("/api/products", products_1.default);
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
app_1.default.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
