// src/models/user.model.ts
import { RowDataPacket } from "mysql2";
import { pool } from "../config/db.config";

export type DBUser = {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
};

// Récupérer un utilisateur par id
export async function findUserById(id: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] as Partial<DBUser> | undefined;
}

// Vérifier si un email existe déjà (autre que l’utilisateur courant)
export async function emailExistsElsewhere(email: string, excludeUserId: string) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
    [email, excludeUserId]
  );
  return !!rows[0];
}

// Mettre à jour les champs de base (sans mot de passe)
export async function updateUserBasics(
  id: string,
  data: { email: string; first_name: string; last_name: string }
) {
  const { email, first_name, last_name } = data;
  await pool.query(
    "UPDATE users SET email = ?, first_name = ?, last_name = ? WHERE id = ?",
    [email, first_name, last_name, id]
  );
}

// Mettre à jour le mot de passe (déjà hashé avant l’appel)
export async function updateUserPassword(id: string, passwordHash: string) {
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [passwordHash, id]);
}
