import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      // Appel API vers ton backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Email ou mot de passe invalide.");
        return;
      }

      // Récupération du token
      const data = await res.json();
      localStorage.setItem("token", data.token);

      // Redirection vers l'accueil
      navigate("/", { replace: true });
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Connexion
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: nassim@test.com"
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors"
          >
            Se connecter
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Pas encore de compte ?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            S’inscrire
          </a>
        </p>
      </div>
    </main>
  );
}
