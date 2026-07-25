import "dotenv/config";
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

const corsOptions = {
  origin: function (origin, callback) {
    
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://dhaka-zoo-management-system.vercel.app',
      'https://zoo-nuraia.vercel.app',
    ]

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('Blocked origin:', origin)
      callback(null, true) 
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions)) 

app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    name: "Dhaka Zoo Management API",
    routes: ["/api/health", "/api/animals", "/api/tickets", "/api/auth"],
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
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

app.listen(port, () => {
  console.log(`Dhaka Zoo API listening on port ${port}`);
});