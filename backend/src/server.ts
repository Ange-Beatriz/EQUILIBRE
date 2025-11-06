import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv/config';
import passport from './config/passport.config';
import { testConnection } from './config/db.config';
import authRoutes from './routes/auth.routes';

//dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Configuration CORS AVANT tout autre middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Autorise les deux variantes
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware pour parser le JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);

// Route de santé
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Route racine
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'API Backend - EQUILIBRE Project',
    version: '1.0.0'
  });
});

// Gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth routes: http://localhost:${PORT}/auth`);
      console.log(`🌍 CORS activé pour: http://localhost:5173`);
    });
  } catch (error) {
    console.error('Erreur au démarrage:', error);
    process.exit(1);
  }
};

startServer();
