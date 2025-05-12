const commande = require('../models/Commande_model');
const { catchAsync, AppError,handleDBErrors } = require('./error');
const { admin, db, fieldValue } = require('../config/firebase-admin');
const { createChargilyInvoice } = require('../models/chargilypay');


exports.getallcommande = handleDBErrors(catchAsync(async (req, res, next) => {
    const commandes = await commande.findallcommande();

    if (!commandes) {
        return next(new AppError('No commande found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            commandes
        }
    });
}));

exports.createCommande = handleDBErrors(catchAsync(async (req, res, next) => {
    const { commandeData, plats } = req.body;

    // Validation minimale
    if (!plats?.length) {
        return res.status(400).json({
            status: 'fail',
            message: 'ID commande et plats sont obligatoires'
        });
    }

    const result = await commande.createCommandeWithNotification(commandeData, plats);

    if (!result.success) {
        return res.status(400).json({
            status: 'fail',
            message: result.error
        });
    }
    if (commandeData.mode_payment === 'carte_banquaire') {
        const id_commande = result.commande.id_commande;
      
        const paymentUrl = await createChargilyInvoice({
          montant: commandeData.montant,
          clientName: commandeData.client_name,
          clientEmail: commandeData.client_email,
          invoiceId: id_commande.toString() // juste le numéro !
        });
      
        return res.status(201).json({
          status: 'success',
          data: {
            commande: result.commande,
            notification: result.notification,
            paymentUrl
          }
        });
    };


    return res.status(201).json({
        status: 'success',
        data: {
          commande: result.commande,
          notification: result.notification,
          paymentUrl: null
        }
      });
}));

exports.getNotificationsCuisinier = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_cuisinier } = req.params;
    
    const snapshot = await admin.firestore()
        .collection('notifications_cuisine')
        .where('id_cuisinier', '==', parseInt(id_cuisinier))
        .where('isRead', '==', false)
        .get();

    const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
    }));

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
    });
}));

exports.getNotificationsServeur = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_serveur } = req.params;
    
    const snapshot = await admin.firestore()
        .collection('notifications_serveur')
        .where('id_serveur', '==', parseInt(id_serveur))
        .where('isRead', '==', false)
        .get();

    const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
    }));

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
    });
}));

exports.markNotificationAsRead = handleDBErrors(catchAsync(async (req, res, next) => {
    const { notificationId, collectionName } = req.params;

    if (!['notifications_cuisine', 'notifications_serveur','notifications_serveur_pour_client'].includes(collectionName)) {
        return next(new AppError('Collection de notifications invalide', 400));
    }

    await admin.firestore()
        .collection(collectionName)
        .doc(notificationId)
        .update({ isRead: true });

    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue'
    });
}));

exports.getallplat_in_commande = handleDBErrors(catchAsync(async (req, res, next) => {
    const plat_commande = await commande.findallplat_in_commande(req.params.id_commande);

    if (!plat_commande) {
        return next(new AppError('No commande found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            plat_commande
        }
    });
}));

exports.updateCommandeByCuisinier = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_commande } = req.params;
    const { newState } = req.body;

    const updatedCommande = await commande.updateCommandeByCuisinier(id_commande, newState);

    res.status(200).json({
        status: 'success',
        data: {
            commande: updatedCommande
        }
    });
}));

exports.getNotificationsClient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;
    
    const snapshot = await db.collection('notifications_client')
        .where('id_client', '==', parseInt(id_client))
        .where('isRead', '==', false)
        .get();

    const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
    }));

    res.status(200).json({
        status: 'success',
        data: { notifications }
    });
}));

exports.getNotificationsGerant = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_gerant } = req.params;
    
    const snapshot = await admin.firestore()
        .collection('notifications_gerant')
        .where('id_gerant', '==', parseInt(id_gerant))
        .where('isRead', '==', false)
        .orderBy('createdAt', 'desc')
        .get();

    const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
    }));

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: { notifications }
    });
}));

exports.markGerantNotificationAsRead = handleDBErrors(catchAsync(async (req, res, next) => {
    const { notificationId } = req.params;

    await admin.firestore()
        .collection('notifications_gerant')
        .doc(notificationId)
        .update({ isRead: true });

    res.status(200).json({
        status: 'success',
        message: 'Notification marquée comme lue'
    });
}));

exports.submitClientRatings = handleDBErrors(catchAsync(async (req, res, next) => {
    const { notificationId } = req.params;
    const { ratings } = req.body;

    // Validation minimale
    if (!ratings || (!ratings.serveur && !ratings.plats)) {
        return next(new AppError('Aucune note fournie', 400));
    }

    if (ratings.serveur && (ratings.serveur.nb_etoile < 0 || ratings.serveur.nb_etoile > 5)) {
        return next(new AppError('La note du serveur doit être entre 0 et 5 étoiles', 400));
    }

    const result = await commande.processClientRating(notificationId, ratings);

    if (!result.success) {
        return next(new AppError(result.error, 400));
    }

    res.status(200).json({
        status: 'success',
        message: 'Merci pour votre feedback !'
    });
}));


exports.getPendingRatingNotifications = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;
    const now = new Date();
    
    const snapshot = await db.collection('client_rating_notifications')
        .where('id_client', '==', parseInt(id_client))
        .where('status', '==', 'pending')
        .where('scheduledTime', '<=', now) // Seulement celles dont l'heure est passée
        .orderBy('scheduledTime', 'desc')
        .get();

    const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        scheduledTime: doc.data().scheduledTime.toDate()
    }));

    res.status(200).json({
        status: 'success',
        data: { notifications }
    });
}));

exports.callWaiter = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client, id_table } = req.body;

    if (!id_client || !id_table) {
        return next(new AppError('ID client et table sont obligatoires', 400));
    }

    const result = await commande.callWaiter(id_client, id_table);

    if (!result.success) {
        return next(new AppError(result.error, 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            notificationId: result.notificationId
        }
    });
}));

exports.getCommandeClient = handleDBErrors(catchAsync(async (req, res, next) => {
    const { id_client } = req.params;
    
    const commandes = await commande.findcommandebyclient(id_client);

    if (!commandes) {
        return next(new AppError('No commande found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            commandes
        }
    });
}));


exports.handleEpayWebhook = async (req, res) => {
    const event = req.body;
  
    if (event.status === 'paid') {
        const id_commande = event.invoice_number; // PAS de split
        await commande.updateCommandePaymentStatus(id_commande, 'paid');
    }
  
    res.sendStatus(200);
  };