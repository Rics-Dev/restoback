// sendFCMNotification.js (⚠️ FCM V1 via Firebase Admin)
const { admin, db } = require('../config/firebase-admin');

const sendFCMNotification = async ({ id_user, role, title, body, data = {} }) => {
  try {
    console.log('📡 Tentative d’envoi de notification');
    console.log('🎯 ID Utilisateur :', id_user);
    console.log('👤 Rôle :', role);

    // 1. Récupérer le token FCM depuis Firestore
    const tokenRef = db.collection('fcm_tokens').doc(`${role}_${id_user}`);
    const tokenDoc = await tokenRef.get();

    if (!tokenDoc.exists) {
      console.warn(`❌ Aucun token trouvé pour ${role}_${id_user}`);
      return;
    }

    const token = tokenDoc.data().token;
    console.log('📦 Token récupéré depuis Firestore :', token);

    // 2. Préparer la notification
    const message = {
      token: token,
      notification: {
        title,
        body,
      },
      data: data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'default', // doit correspondre à celui créé par Notifee
        }
      }
    };
    

    console.log('📨 Notification à envoyer :', message);

    // 3. Envoyer avec Firebase Admin (FCM V1)
    const response = await admin.messaging().send(message);
    console.log('✅ Notification FCM envoyée avec succès :', response);

  } catch (error) {
    console.error('❌ Erreur lors de l’envoi de la notification :', error.message);
    console.error(error);
  }
};

module.exports = sendFCMNotification;
