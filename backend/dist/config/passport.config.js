"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const db_config_1 = require("./db.config");
const jwtOptions = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};
// JWT Strategy
passport_1.default.use(new passport_jwt_1.Strategy(jwtOptions, async (payload, done) => {
    try {
        const [rows] = await db_config_1.pool.query('SELECT id, email, name FROM users WHERE id = ?', [payload.id]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        }
        return done(null, false);
    }
    catch (error) {
        return done(error, false);
    }
}));
// Google OAuth2 Strategy
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0].value;
        const googleId = profile.id;
        const name = profile.displayName;
        // Vérifier si l'utilisateur existe
        const [rows] = await db_config_1.pool.query('SELECT * FROM users WHERE googleId = ? OR email = ?', [googleId, email]);
        if (rows.length > 0) {
            return done(null, rows[0]);
        }
        // Créer un nouvel utilisateur
        const [result] = await db_config_1.pool.query('INSERT INTO users (email, googleId, name) VALUES (?, ?, ?)', [email, googleId, name]);
        const newUser = {
            id: result.insertId,
            email: email,
            googleId,
            name,
            created_at: new Date()
        };
        return done(null, newUser);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;
//# sourceMappingURL=passport.config.js.map