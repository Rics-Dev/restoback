require('dotenv').config(); // Load environment variables
const express = require('express'); // Import Express
const { pool, db } = require('./config/db-drizzle.js'); // Import Drizzle-enabled db connection
const { initializeDatabase } = require('./config/db-init-drizzle'); // Import Drizzle initialization
const errorHandler = require("./controller/errorHandler");
const { admin } = require('./config/firebase-admin'); // Import simplified
const ingredientRoutes = require('./routes/ingredient_routes'); // Import routes
const platroutes = require('./routes/platGerant_router');
const offreroute = require('./routes/offregerant_route');
const personneRoute = require('./routes/personnel_route');
const clientRoute = require ('./routes/client_route');
const ClientMaladieRoute = require ('./routes/ClientMaladie_Route');
const ClientPlatRoute = require('./routes/ClientPlat_route');
const cors = require('cors'); // Import CORS
const PlatMaladieRoute = require('./routes/MaladiePlat_route');
const reservationRoutes = require('./routes/reservation_routes'); 
const MaladieRoute = require('./routes/maladie_route');
const PlatFavorieRoute = require('./routes/PlatPrefere_route');
const commandesRoutes = require('./routes/commande_route'); 
const NotePlatRoutes = require ('./routes/PlatNote_route');
const NoteServeurRoute = require('./routes/ServeurNote_Route');
const recommendationRoute = require('./routes/service_route'); 
const fcmTokenRoute = require('./routes/fcm_token_route'); 
const CategorieRoute = require('./routes/categorie_routes'); 
const { startCronJob } = require('./cron_notifications'); 

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Or your frontend domain (e.g., 'https://mon-site.com')
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Explicitly allow POST
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    if (!admin) {
      console.warn('Firebase not available - Degraded mode activated');
    }
    next();
});

// Make Drizzle db instance available in req object
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Use routes
app.use('/api', ingredientRoutes);
app.use('/api', platroutes);
app.use('/api', offreroute);
app.use('/api', personneRoute);
app.use('/api', clientRoute);
app.use('/api', ClientMaladieRoute);
app.use('/api', reservationRoutes);
app.use('/api', ClientPlatRoute);
app.use('/api', PlatMaladieRoute);
app.use('/api', MaladieRoute);
app.use('/api', PlatFavorieRoute);
app.use('/api', commandesRoutes);
app.use('/api', NotePlatRoutes);
app.use('/api', NoteServeurRoute);
app.use('/api', CategorieRoute);
app.use('/api', recommendationRoute);
app.use('/api', fcmTokenRoute);

app.use(errorHandler);

// Start the server with database initialization
async function startServer() {
  try {
    // Initialize database schema with Drizzle
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
