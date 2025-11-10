import { useEffect, useState } from "react";

type Sprint = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  goal: string;
  status: string;
};

export default function Home() {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; } // protégé en amont, mais on évite tout loop

    fetch(`${import.meta.env.VITE_API_URL}/api/sprints`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status === 401) {
          // NE PAS recharger la page ici — ProtectedRoute gère l’accès.
          setSprints([]);
          return;
        }
        const data = await r.json();
        setSprints(data || []);
      })
      .catch(() => setSprints([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="p-6">
      <h1>Accueil</h1>
      <p>Bienvenue sur EQUILIBRE 👋</p>

      <h2>Mes sprints</h2>
      {loading ? (
        <p>Chargement…</p>
      ) : sprints.length === 0 ? (
        <p>Aucun sprint pour le moment.</p>
      ) : (
        <ul>
          {sprints.map((s) => (
            <li key={s.id}>{s.name} — {s.status}</li>
          ))}
        </ul>
      )}
    </main>
  );
}
