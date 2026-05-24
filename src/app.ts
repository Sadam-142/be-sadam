import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import routes from "./routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { logger } from "./utils/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set("trust proxy", 1);

// =========================================
// MIDDLEWARE
// =========================================

// CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Terlalu banyak request, coba lagi dalam beberapa menit",
  },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use("/uploads", express.static(resolve(__dirname, "../uploads")));

// Request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url }, "Incoming request");
  next();
});

// =========================================
// ROUTES
// =========================================

// Health check
app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Test endpoint to verify deployment version
app.get("/ping", (_req, res) => {
  res.json({ version: "custom_storage_v1" });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// =========================================
// GLOBAL ERROR HANDLER (must be last)
// =========================================
app.use(errorMiddleware);

export default app;
