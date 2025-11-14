// src/routes/user.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { getMe, updateMe } from "../controllers/user.controller";

const router = Router();

// Récupérer mon profil
router.get("/me", requireAuth, getMe);

// Mettre à jour mon profil
router.put("/me", requireAuth, updateMe);

export default router;
