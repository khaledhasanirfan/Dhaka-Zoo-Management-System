import "dotenv/config";
import { pathToFileURL } from "node:url";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import animalRoutes from "./routes/animals.js";
import ticketRoutes from "./routes/tickets.js";
import feedingRoutes from "./routes/feeding.js";
import healthRoutes from "./routes/health.js";
import zoneRoutes from "./routes/zones.js";
import dayPlanRoutes from "./routes/dayPlans.js";
import enquiryRoutes from "./routes/enquiry.js";

const app = express();
const port = Number(process.env.PORT || 5000);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://dhaka-zoo-visitor-portal.vercel.app",
  "https://dhaka-zoo-management-system.vercel.app",
  "https://dhaka-zms-nuraias-projects.vercel.app",
];
const configuredAllowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);
const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredAllowedOrigins]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    return callback(error);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.set({
    "Content-Security-Policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  next();
});
app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

app.get("/", (_req, res) => {
  res.json({
    name: "Dhaka Zoo Management API",
    routes: ["/api/health", "/api/animals", "/api/tickets", "/api/auth"],
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/animals", animalRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feeding", feedingRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/day-plans", dayPlanRoutes);
app.use("/api/enquiry", enquiryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  const message = status === 500 ? "Internal server error." : error.message;
  if (status === 500) console.error(error);
  res.status(status).json({
    message,
    ...(error.details && { details: error.details }),
  });
});

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  app.listen(port, () => {
    console.log(`Dhaka Zoo API listening on port ${port}`);
  });
}

export { app };
