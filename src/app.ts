import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/index";
import { connectDB } from "./config/db";

import productsRouter from "./routes/products";
import categoriesRouter from "./routes/categories";
import usersRouter from "./routes/users";
import { cartRouter } from "./routes/cart";
import ordersRouter from "./routes/orders";
import reviewRoutes from "./routes/reviews";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// osnovni router (health, auth, debug...)
app.use("/api", router);

// REST routes
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/users", usersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api", reviewRoutes);

connectDB().catch((err) => {
  console.error("Fatal: cannot connect to MongoDB", err);
  process.exit(1);
});

export default app;
