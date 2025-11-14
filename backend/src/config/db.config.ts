// src/config/db.config.ts
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "equilibre_db",
  connectionLimit: 10,
  waitForConnections: true,
});

export { pool };
export default pool; // <-- si tu préfères import default ailleurs
