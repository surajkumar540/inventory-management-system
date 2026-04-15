import authRoutes from "./src/routes/authRoutes.js";
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";


const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// =======================
// ROUTES
// =======================
app.use("/api/auth", authRoutes);

// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// =======================
// ERROR HANDLER (BASIC)
// =======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
  });
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});