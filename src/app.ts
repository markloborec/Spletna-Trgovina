import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import { router } from "./routes/index";
import { connectDB } from "./config/db";

import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import usersRouter from "./routes/users";
import cartRoutes from "./routes/cart";
import ordersRouter from "./routes/orders";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/product-images",
  express.static(path.join(process.cwd(), "public", "product-images"))
);

// osnovni router (health, auth, debug...)
app.use("/api", router);

// REST routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRouter);

connectDB().catch((err) => {
  console.error("Fatal: cannot connect to MongoDB", err);
  process.exit(1);
});

export default app;
