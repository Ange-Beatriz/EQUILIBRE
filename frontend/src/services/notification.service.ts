// frontend/src/services/notification.service.ts
import { apiGet, apiPost } from "./api.service";

export interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: 0 | 1 | boolean;
  created_at: string;
}

// Récupérer les notifications de l'utilisateur connecté
export async function fetchNotifications(): Promise<Notification[]> {
  return apiGet<Notification[]>("/api/notifications");
}

// US-80 : simuler un nouveau dépôt (mock côté back)
export async function simulateDeposit(): Promise<Notification> {
  const res = await apiPost<{ message: string; notification: Notification }>(
    "/api/notifications/mock",
    {}
  );

  return res.notification;
}
