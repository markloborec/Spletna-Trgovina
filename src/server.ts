import app from "./app";
import dotenv from "dotenv";
import productsRouter from "./routes/products";

app.use("/api/products", productsRouter);


dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
