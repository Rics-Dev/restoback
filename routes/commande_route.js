const express = require('express');
const Router = express.Router();
const Commande = require('../controller/commande_controller');

// Routes pour les commandes
Router.get('/commandes', Commande.getallcommande);
Router.get('/commandes/plat/:id_commande', Commande.getallplat_in_commande);
Router.post('/commandes', Commande.createCommande);
Router.post('/chargily-webhook', express.raw({ type: 'application/json' }), Commande.handleEpayWebhook);

// Routes pour les cuisiniers
Router.patch('/commandes/cuisinier/:id_commande', Commande.updateCommandeByCuisinier);
Router.get('/notifications/cuisinier/:id_cuisinier', Commande.getNotificationsCuisinier);

// Routes pour les serveurs
Router.get('/notifications/serveur/:id_serveur', Commande.getNotificationsServeur);

// Routes pour les clients
Router.get('/notifications/client/:id_client', Commande.getNotificationsClient);

// Route commune
Router.patch('/notifications/mark-read/:collectionName/:notificationId', Commande.markNotificationAsRead);

Router.get('/commandes/:id_client',Commande.getCommandeClient);


// Ajoutez ces routes avant module.exports
Router.get('/notifications/gerant/:id_gerant', Commande.getNotificationsGerant);
Router.patch('/notifications/gerant/mark-read/:notificationId', Commande.markGerantNotificationAsRead);
Router.get('/notifications/rating/:id_client', Commande.getPendingRatingNotifications);
Router.post('/ratings/:notificationId', Commande.submitClientRatings);

Router.post('/call-waiter', Commande.callWaiter);

module.exports = Router;