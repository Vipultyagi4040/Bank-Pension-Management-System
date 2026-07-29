import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { pensionerRouter } from "./routes/pensioner.routes.js";
import { managementRouter } from "./routes/management.routes.js";
import { errorHandler, notFound } from "./middleware/error.js";

export const app = express();

const origins = env.CORS_ORIGINS.split(",").map(value => value.trim());

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  }
}));
app.use(express.json({ limit: "2mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/api/v1/health", (_req, res) => {
  res.json({ success: true, service: "bank-pension-api" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/pensioner", pensionerRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/management", managementRouter);

app.use(notFound);
app.use(errorHandler);
