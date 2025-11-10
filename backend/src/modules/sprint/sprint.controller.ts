import type { Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { pool } from "../../config/db.config";

export async function listSprints(_req: Request, res: Response) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, start_date, end_date, goal, status, created_at FROM sprints ORDER BY start_date DESC"
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur lors de la récupération des sprints" });
  }
}

export async function createSprint(req: Request, res: Response) {
  const { name, start_date, end_date, goal } = req.body;
  if (!name || !start_date || !end_date) {
    return res.status(400).json({ message: "Champs manquants : name, start_date, end_date" });
  }
  try {
    const id = uuid();
    await pool.query(
      "INSERT INTO sprints (id, name, start_date, end_date, goal) VALUES (?, ?, ?, ?, ?)",
      [id, name, start_date, end_date, goal ?? null]
    );
    res.status(201).json({ id, name, start_date, end_date, goal, status: "PLANNED" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur lors de la création du sprint" });
  }
}
