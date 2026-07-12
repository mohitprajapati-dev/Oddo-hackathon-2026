import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});


app.use(errorHandler);

export default app;
