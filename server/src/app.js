import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.js";
import vehicleRoutes from "./modules/vehicle/vehicle.routes.js";
import authRouter from "./modules/auth/auth.routes.js";
import maintenanceRoutes from "./modules/maintenance/maintenance.routes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT}`,
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/vehicles", vehicleRoutes);
app.use("/api/maintenance", maintenanceRoutes);


app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

app.use("/api/auth", authRouter);

app.use(errorHandler);

export default app;
