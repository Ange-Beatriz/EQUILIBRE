// backend/src/routes/notification.routes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getNotifications,
  createMockDepositNotification,
  markNotificationAsRead,
} from "../controllers/notification.controller";

const router = Router();

// Liste des notifications de l'utilisateur connecté
router.get("/", requireAuth, getNotifications);

// Mock US-80 : créer une notification de "nouveau dépôt"
router.post("/mock", requireAuth, createMockDepositNotification);

// Marquer une notification comme lue
router.put("/:id/read", requireAuth, markNotificationAsRead);

export default router;
