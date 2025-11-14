// frontend/src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Fonctions d'API notifications
import { fetchNotifications, simulateDeposit } from "../services/notification.service";
import type { Notification } from "../services/notification.service";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [loadingMock, setLoadingMock] = useState(false);

  // Charger les notifications au montage
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotif(true);
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Erreur fetch notifications:", err);
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleMockDeposit = async () => {
    try {
      setLoadingMock(true);
      await simulateDeposit();
      await loadNotifications();
    } catch (err) {
      console.error("Erreur mock dépôt:", err);
    } finally {
      setLoadingMock(false);
    }
  };

  const handleLogout = () => {
    logout();          // on vide token + user
    navigate("/login"); // et on renvoie vers la page de connexion
  };

  return (
    <main className="page" style={{ display: "flex", minHeight: "100vh" }}>
      <section
        style={{
          flex: 1,
          maxWidth: 600,
          backgroundColor: "#f0f8ff",
          padding: "2rem",
        }}
      >
        <header className="page-header">
          <h1>💉 DASHBOARD TEST</h1>
          <p>Si tu vois ce titre, c’est le NOUVEAU dashboard ✅</p>

          {user && (
            <p>
              Connecté en tant que{" "}
              <strong>
                {user.first_name} {user.last_name}
              </strong>{" "}
              — rôle : <strong>{user.role}</strong>
            </p>
          )}
        </header>

        <div className="page-header-actions" style={{ marginTop: "1.5rem" }}>
          <button
            type="button"
            onClick={handleMockDeposit}
            disabled={loadingMock}
            style={{ marginRight: "1rem" }}
          >
            {loadingMock ? "Simulation en cours..." : "Simuler un dépôt (mock)"}
          </button>

          <button type="button" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>

        <section className="notifications" style={{ marginTop: "2rem" }}>
          <h2>Mes notifications</h2>

          {loadingNotif ? (
            <p>Chargement...</p>
          ) : notifications.length === 0 ? (
            <p>Aucune notification pour le moment.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li key={n.id} style={{ marginBottom: "1rem" }}>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <small>Reçue le : {n.created_at}</small>
                  <br />
                  {!n.is_read && (
                    <span style={{ color: "green" }}>🟢 Non lue</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {/* Partie droite vide pour l’instant, pour la maquette */}
      <section style={{ flex: 1 }} />
    </main>
  );
}
