"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_config_1 = require("../config/db.config");
const jwt_utils_1 = require("../utils/jwt.utils");
const router = (0, express_1.Router)();
// Route de test
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes fonctionnent' });
});
// Inscription
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }
        // Vérifier si l'utilisateur existe
        const [existing] = await db_config_1.pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }
        // Hasher le mot de passe
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Créer l'utilisateur
        const [result] = await db_config_1.pool.query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
        // ✅ Utiliser la fonction helper
        const token = (0, jwt_utils_1.generateToken)({
            id: result.insertId,
            email,
            name
        });
        res.status(201).json({
            message: 'Utilisateur créé',
            token,
            user: { id: result.insertId, email, name }
        });
    }
    catch (error) {
        console.error('Erreur inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis' });
        }
        // Trouver l'utilisateur
        const [rows] = await db_config_1.pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        const user = rows[0];
        if (!user.password) {
            return res.status(401).json({ message: 'Utilisez Google pour vous connecter' });
        }
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
        // Utiliser la fonction helper
        const token = (0, jwt_utils_1.generateToken)({
            id: user.id,
            email: user.email,
            name: user.name
        });
        res.json({
            token,
            user: { id: user.id, email: user.email, name: user.name }
        });
    }
    catch (error) {
        console.error('Erreur connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
// Google OAuth - Initiation
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));
// Google OAuth - Callback
router.get('/google/callback', passport_1.default.authenticate('google', {
    session: false,
    failureRedirect: '/login'
}), (req, res) => {
    const user = req.user;
    // Utiliser la fonction helper
    const token = (0, jwt_utils_1.generateToken)({
        id: user.id,
        email: user.email,
        name: user.name
    });
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}`);
});
// Route protégée - Profil utilisateur
router.get('/me', passport_1.default.authenticate('jwt', { session: false }), (req, res) => {
    res.json(req.user);
});
// Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Déconnexion réussie' });
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map