import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";

import passport from "../config/passport.config";
import { pool } from "../config/db.config";
import { requireAuth } from "../middleware/auth";

// ------------------------------
// Constantes / Types
// ------------------------------
const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret-dev";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

const ALLOWED_ROLES = [
  "APPRENTI",
  "TUTEUR_PEDAGO",
  "TUTEUR_ENTREPRISE",
  "RESP_CFA",
  "ETUDIANT",
  "MANAGER",
  "ADMIN",
] as const;
type Role = typeof ALLOWED_ROLES[number];

type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: Role | string;
};

// ------------------------------
// Helpers
// ------------------------------
function toSafeRole(role?: string): Role {
  if (role && (ALLOWED_ROLES as readonly string[]).includes(role)) {
    return role as Role;
  }
  return "APPRENTI";
}

function signToken(user: Express.User) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

// ------------------------------
// POST /auth/register
// ------------------------------
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body as RegisterBody;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Champs requis: email, password, firstName, lastName" });
    }

    // Email unique ?
    const [dups] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if ((dups as any[]).length > 0) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = uuid();
    const safeRole = toSafeRole(role);

    await pool.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, email, hash, firstName, lastName, safeRole]
    );

    return res.status(201).json({
      message: "Compte créé",
      user: { id, email, first_name: firstName, last_name: lastName, role: safeRole },
    });
  } catch (e) {
    console.error("Erreur register:", e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// ------------------------------
// POST /auth/login  (Passport Local)
// ------------------------------
router.post(
  "/login",
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      "local",
      { session: false },
      (err: any, user: Express.User | false, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json(info || { message: "Identifiants invalides" });

        const token = signToken(user as Express.User);
        return res.json({ token, user });
      }
    )(req, res, next);
  }
);

// ------------------------------
// POST /auth/logout (ack, le front supprime le token)
// ------------------------------
router.post("/logout", (_req: Request, res: Response) => {
  return res.json({ ok: true });
});

// ------------------------------
// GET /auth/me  (Profil courant)
// ------------------------------
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const me = req.user!; // { id, email, role }
    // Si tu veux retourner plus d'infos depuis la BDD :
    const [rows] = await pool.query(
      "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ?",
      [me.id]
    );
    const user = (rows as any[])[0] || null;
    return res.json({ user });
  } catch (e) {
    console.error("Erreur /auth/me:", e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// ------------------------------
// PUT /auth/me  (Mise à jour profil)
// ------------------------------
router.put("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const me = req.user!;
    const {
      first_name,
      last_name,
      password,
      role, // on l'ignore par défaut pour éviter l'escalade de privilèges
    } = req.body as {
      first_name?: string;
      last_name?: string;
      password?: string;
      role?: string;
    };

    if (!first_name && !last_name && !password) {
      return res.status(400).json({ message: "Aucun champ à mettre à jour" });
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), password = ? WHERE id = ?",
        [first_name ?? null, last_name ?? null, hash, me.id]
      );
    } else {
      await pool.query(
        "UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE id = ?",
        [first_name ?? null, last_name ?? null, me.id]
      );
    }

    return res.json({ ok: true, message: "Profil mis à jour" });
  } catch (e) {
    console.error("Erreur PUT /auth/me:", e);
    return res.status(500).json({ message: "Erreur serveur" });
  }
});

// ------------------------------
// GET /auth/notifications/mock  (exemple)
// ------------------------------
router.get("/notifications/mock", requireAuth, (_req: Request, res: Response) => {
  return res.json({
    items: [
      {
        id: "notif_1",
        type: "NEW_COMMIT",
        message: "Nouveau dépôt détecté sur votre repo.",
        date: new Date().toISOString(),
      },
    ],
  });
});

export default router;
