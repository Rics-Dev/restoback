const { db } = require('../config/firebase-admin');

exports.saveFcmToken = async (req, res) => {
  const { id_user, role, fcmToken, token } = req.body;
  const actualToken = fcmToken || token;
  
  if (!id_user || !role || !actualToken) {
    return res.status(400).json({
      error: 'Champs manquants',
      received: { id_user, role, fcmToken, token },
    });
  }

  try {
    await db.collection('fcm_tokens').doc(`${role}_${id_user}`).set({
      id_user,
      role,
      token: actualToken,
      updatedAt: new Date()
    });

    res.status(200).json({ message: 'Token FCM enregistré' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur enregistrement' });
  }
};
