import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        borderBottom: "1px solid #e5e7eb",
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <strong style={{ fontSize: "1.2rem" }}>EQUILIBRE</strong>

      <nav style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Link to="/dashboard">🏠 Tableau de bord</Link>
        <Link to="/profile">👤 Profil</Link>
        <button
          onClick={handleLogout}
          style={{
            cursor: "pointer",
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
          }}
        >
          Déconnexion
        </button>
      </nav>
    </header>
  );
}
