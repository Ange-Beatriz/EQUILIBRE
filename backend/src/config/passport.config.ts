import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { pool } from "./db.config";

// helper pour typer proprement l'Express.User
function toExpressUser(u: any): Express.User | null {
  if (!u || !u.id || !u.email || !u.role) return null;
  return { id: String(u.id), email: String(u.email), role: String(u.role) };
}

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = (rows as any[])[0];
        if (!user) return done(null, false, { message: "Identifiants invalides" });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return done(null, false, { message: "Identifiants invalides" });

        const safe = toExpressUser(user);
        if (!safe) return done(null, false, { message: "Profil incomplet" });

        return done(null, safe);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// (dé/)-sérialisation : ici on n’utilise pas de session, mais on laisse le squelette
passport.serializeUser((user, done) => done(null, (user as Express.User).id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    const user = (rows as any[])[0];
    const safe = toExpressUser(user);
    if (!safe) return done(null, false);
    done(null, safe);
  } catch (err) {
    done(err);
  }
});

export default passport;
