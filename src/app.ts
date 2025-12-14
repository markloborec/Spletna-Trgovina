import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/index";
import { connectDB } from "./config/db";
import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import usersRouter from "./routes/users";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", router);

app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);



connectDB().catch((err) => {
  console.error("Fatal: cannot connect to MongoDB", err);
  process.exit(1);
});

export default app;
