require('dotenv').config(); // Charger les variables d'environnement
const express = require('express'); // Importer Express
const pool = require('./config/db.js'); // Importer la connexion à la base de données
const { initializeDatabase } = require('./config/db-init');
const errorHandler = require("./controller/errorHandler");
const { db } = require('./config/firebase-admin'); // Import simplifié
const ingredientRoutes = require('./routes/ingredient_routes'); // Importer les routes des ingrédients
const platroutes = require('./routes/platGerant_router');
const offreroute = require('./routes/offregerant_route');
const personneRoute = require('./routes/personnel_route');
const clientRoute = require ('./routes/client_route');
const ClientMaladieRoute = require ('./routes/ClientMaladie_Route');
const ClientPlatRoute = require('./routes/ClientPlat_route');
const cors = require('cors'); // Importer CORS
const PlatMaladieRoute = require('./routes/MaladiePlat_route');
const reservationRoutes = require('./routes/reservation_routes'); // Importer les routes des réservations
const MaladieRoute = require('./routes/maladie_route');
const PlatFavorieRoute = require('./routes/PlatPrefere_route');
const commandesRoutes = require('./routes/commande_route'); // Importer les routes des commandes
const NotePlatRoutes = require ('./routes/PlatNote_route');
const NoteServeurRoute = require('./routes/ServeurNote_Route');
const recommendationRoute = require('./routes/service_route'); // Importer les routes de recommandation
const fcmTokenRoute = require('./routes/fcm_token_route'); // Importer les routes de gestion des tokens FCM
const CategorieRoute = require('./routes/categorie_routes'); // Importer les routes de gestion des catégories
const { startCronJob } = require('./cron_notifications'); // AJOUT ICI

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Ou votre domaine frontend (ex: 'https://mon-site.com')
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Autorisez POST explicitement
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use((req, res, next) => {
    if (!db) {
      console.warn('Firebase non disponible - Mode dégradé activé');
    }
    next();
  });




app.use('/api', ingredientRoutes); // Utiliser les routes des ingrédients
app.use('/api', platroutes);
app.use('/api', offreroute);
app.use('/api', personneRoute);
app.use('/api', clientRoute);
app.use('/api',ClientMaladieRoute);
app.use('/api', reservationRoutes); // Utiliser les routes des réservations
app.use('/api',ClientPlatRoute);
app.use('/api',PlatMaladieRoute);
app.use('/api',MaladieRoute);
app.use('/api',PlatFavorieRoute);
app.use('/api',commandesRoutes); // Utiliser les routes des commandes
app.use('/api',NotePlatRoutes);
app.use('/api',NoteServeurRoute);
app.use('/api', CategorieRoute); // Utiliser les routes de gestion des catégories
app.use('/api', recommendationRoute); // Utiliser les routes de recommandation
app.use('/api', fcmTokenRoute); // Utiliser les routes de gestion des tokens FCM


// Middleware pour parser les requêtes JSON

app.use(errorHandler);

// Start the server with database initialization
async function startServer() {
  try {
    // Initialize database schema
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database schema. Exiting...');
      process.exit(1);
    }
    
    // Start cron job for notifications
    startCronJob();
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
//
// startCronJob();
// //rana nl3bo
//
// const PORT = process.env.PORT;
// app.listen(PORT, () => {
//     console.log(`Serveur en écoute sur le port ${PORT}`);
// });
