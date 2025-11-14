// src/server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";

import apiRoutes from "./routes/api.routes";
import authRoutes from "./routes/auth.routes";

const app = express();                      // <-- d'abord on crée l'app

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);                 // <-- puis on monte les routes

// Healthcheck simple
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`🟢 Serveur démarré sur http://localhost:${PORT}`);
});
