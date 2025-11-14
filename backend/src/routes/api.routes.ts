// backend/src/routes/api.routes.ts
import { Router } from "express";
import userRoutes from "./user.routes";
import notificationRoutes from "./notification.routes";

const router = Router();

// Routes liées aux utilisateurs (profil, etc.)
router.use("/users", userRoutes);

// Routes de notifications
router.use("/notifications", notificationRoutes);

export default router;
