const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const connectDB = require("./config/db");

const app = express();

const clientOrigin = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.includes(",")
    ? process.env.CLIENT_URL.split(",").map((url) => url.trim())
    : process.env.CLIENT_URL
  : "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("SmartCommerce API Running...");
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
