const { admin, db } = require('./config/firebase-admin'); // adapte si besoin

async function checkAndSendScheduledNotifications() {
  try {
    const now = new Date();

    const snapshot = await db
      .collection('client_rating_notifications')
      .where('status', '==', 'pending')
      .where('scheduledTime', '<=', now)
      .get();

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (!data.clientDeviceToken) {
        console.warn(`Pas de token pour notification ${doc.id}`);
        await doc.ref.update({ status: 'sent' });
        continue;
        
      }

      await admin.messaging().send({
        token: data.clientDeviceToken,
        notification: {
          title: 'Évaluez votre repas 🍴',
          body: data.message || 'Merci de nous donner votre avis !',
        },
        data: {
          id_commande: String(data.id_commande),
          plats: JSON.stringify(data.plats || []),
        }
      });

      await doc.ref.update({ status: 'sent' });
      console.log(`✅ Notification envoyée pour ${doc.id}`);
    }
  } catch (error) {
    console.error('Erreur lors de l’envoi des notifications programmées:', error);
  }
}

function startCronJob() {
  console.log('⏰ Cron lancé : vérification toutes les 5 minutes');
  setInterval(checkAndSendScheduledNotifications, 5 * 60 * 1000);
}

module.exports = { startCronJob };
