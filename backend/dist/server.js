"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const passport_config_1 = __importDefault(require("./config/passport.config"));
const db_config_1 = require("./config/db.config");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(passport_config_1.default.initialize());
// Routes
app.use('/auth', auth_routes_1.default);
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// Démarrage du serveur
const startServer = async () => {
    await (0, db_config_1.testConnection)();
    app.listen(PORT, () => {
        console.log("Serveur démarré sur http://localhost:${PORT}");
    });
};
startServer();
//# sourceMappingURL=server.js.map