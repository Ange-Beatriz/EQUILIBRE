// backend/src/controllers/notification.controller.ts
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.config";
import { AuthenticatedRequest } from "../middleware/auth";

/**
 * Récupérer toutes les notifications de l'utilisateur connecté
 * GET /api/notifications
 */
export async function getNotifications(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userId = req.user.id;

    const [rows] = await pool.query(
      `
      SELECT id, title, message, is_read, created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json(rows);
  } catch (err) {
    console.error("Erreur getNotifications:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Mock US-80 : création d'une notification "nouveau dépôt"
 * POST /api/notifications/mock
 */
export async function createMockDepositNotification(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userId = req.user.id;
    const id = uuidv4();

    const title = "Nouveau dépôt";
    const message =
      "Un nouveau dépôt a été enregistré pour un apprenti que vous suivez (mock).";

    await pool.query(
      `
      INSERT INTO notifications (id, user_id, title, message)
      VALUES (?, ?, ?, ?)
      `,
      [id, userId, title, message]
    );

    const [rows] = await pool.query(
      `
      SELECT id, title, message, is_read, created_at
      FROM notifications
      WHERE id = ?
      `,
      [id]
    );

    const notification = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

    return res.status(201).json({
      message: "Notification de dépôt créée (mock)",
      notification,
    });
  } catch (err) {
    console.error("Erreur createMockDepositNotification:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Marquer une notification comme lue
 * PUT /api/notifications/:id/read
 */
export async function markNotificationAsRead(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const userId = req.user.id;
    const notificationId = req.params.id;

    const [result]: any = await pool.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
      `,
      [notificationId, userId]
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ message: "Notification introuvable pour cet utilisateur" });
    }

    return res.json({ message: "Notification marquée comme lue" });
  } catch (err) {
    console.error("Erreur markNotificationAsRead:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
