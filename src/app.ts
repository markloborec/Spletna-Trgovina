import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/index";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

connectDB().catch((err) => {
  console.error("Fatal: cannot connect to MongoDB", err);
  process.exit(1);
});

export default app;
