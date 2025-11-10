// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";

import passport from "./config/passport.config";
import { testConnection } from "./config/db.config";

import authRoutes from "./routes/auth.routes";
import sprintRoutes from "./modules/sprint/sprint.routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

/* ----------------------------  CORS configuration  ---------------------------- */
const corsOptions: CorsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false, // on utilise Authorization (pas de cookies)
};

app.use(cors(corsOptions));
// Préflight explicite (utile derrière certains proxies)
app.options("*", cors(corsOptions));

/* -------------------------------  Middlewares  -------------------------------- */
app.use(express.json());
app.use(passport.initialize());

/* ----------------------------------- Routes ---------------------------------- */
// Ping
app.get("/", (_req: Request, res: Response) => {
  res.send("🚀 Backend EQUILIBRE opérationnel !");
});

// Auth
app.use("/auth", authRoutes);

// Sprints (protégées dans le router par requireAuth)
app.use("/api/sprints", sprintRoutes);

/* ----------------------------  Gestion des erreurs  --------------------------- */
// 404
app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

// 500
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: "Erreur serveur" });
});

/* --------------------------  Lancement + vérifications ------------------------ */
testConnection()
  .then(() => console.log("✅ Connexion MySQL OK"))
  .catch((e) => {
    console.error("❌ Connexion MySQL KO:", e?.message || e);
  });

app.listen(PORT, () => {
  console.log(`🟢 Serveur démarré sur http://localhost:${PORT}`);
});

export default app;
