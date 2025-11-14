// src/controllers/user.controller.ts
import { Response } from "express";
import bcrypt from "bcryptjs";
import {
  findUserById,
  emailExistsElsewhere,
  updateUserBasics,
  updateUserPassword,
} from "../models/user.model";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const me = await findUserById(req.user!.id);
    if (!me) return res.status(404).json({ message: "Utilisateur introuvable" });
    return res.json(me);
  } catch (e) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { first_name, last_name, email, password } = req.body as {
      first_name?: string;
      last_name?: string;
      email?: string;
      password?: string;
    };

    // Validation simple
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ message: "first_name, last_name et email sont requis." });
    }

    // Email déjà utilisé par un autre
    if (await emailExistsElsewhere(email, userId)) {
      return res.status(409).json({ message: "Cet email est déjà utilisé." });
    }

    // Update de base
    await updateUserBasics(userId, { first_name, last_name, email });

    // Update password si fourni
    if (password && password.trim().length > 0) {
      // (Optionnel) petite règle de robustesse
      if (password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
      }
      const hash = await bcrypt.hash(password, 10);
      await updateUserPassword(userId, hash);
    }

    const updated = await findUserById(userId);
    return res.json({ message: "Profil mis à jour", user: updated });
  } catch (e) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
