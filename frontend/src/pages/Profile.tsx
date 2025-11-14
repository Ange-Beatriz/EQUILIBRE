// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../services/api.service";
import { useNavigate } from "react-router-dom";

type Me = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at?: string;
};

export default function Profile() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Récupère mes infos
  useEffect(() => {
    (async () => {
      try {
        const data = await apiGet<Me>("/api/users/me");
        setMe(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          password: "",
        });
      } catch {
        setMsg({ type: "error", text: "Impossible de récupérer le profil (token expiré ?)" });
        // Optionnel: rediriger vers /login
        setTimeout(() => nav("/login"), 1500);
      }
    })();
  }, [nav]);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        // n’envoie password que s’il est saisi
        ...(form.password.trim().length > 0 ? { password: form.password.trim() } : {}),
    };
      const res = await apiPut<{ message: string; user: Me }>("/api/users/me", payload);
      setMsg({ type: "success", text: res.message || "Profil mis à jour ✅" });
      setMe(res.user);
      setForm((f) => ({ ...f, password: "" })); // on vide le champ mdp
    } catch (err: any) {
      let text = "Erreur lors de la mise à jour.";
      try {
        const parsed = JSON.parse(err.message);
        text = parsed.message || text;
      } catch {}
      setMsg({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: 16 }}>
      <h1>Mon profil</h1>

      {me && (
        <p style={{ color: "#666" }}>
          Rôle : <b>{me.role}</b> — créé le {new Date(me.created_at ?? "").toLocaleDateString()}
        </p>
      )}

      {msg && (
        <div
          style={{
            margin: "12px 0",
            padding: "10px 12px",
            borderRadius: 8,
            background: msg.type === "success" ? "#e8fff1" : "#ffe8e8",
            color: msg.type === "success" ? "#106b36" : "#9b1c1c",
            border: `1px solid ${msg.type === "success" ? "#b2f5ea" : "#fecaca"}`,
          }}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Prénom
          <input
            name="first_name"
            value={form.first_name}
            onChange={onChange}
            required
            className="input"
          />
        </label>

        <label>
          Nom
          <input
            name="last_name"
            value={form.last_name}
            onChange={onChange}
            required
            className="input"
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            required
            className="input"
          />
        </label>

        <label>
          Nouveau mot de passe (optionnel)
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            placeholder="Laisser vide pour ne pas changer"
            className="input"
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <style>{`
        .input {
          display:block;
          width:100%;
          margin-top:4px;
          padding:10px 12px;
          border:1px solid #ddd;
          border-radius:8px;
          outline:none;
        }
        button{
          padding:10px 14px;
          border-radius:8px;
          border:0;
          background:#111827;
          color:#fff;
          cursor:pointer;
        }
        button[disabled]{ opacity:.7; cursor:not-allowed; }
      `}</style>
    </div>
  );
}
