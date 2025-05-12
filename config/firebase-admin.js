const admin = require('firebase-admin');

// Chargement de la configuration
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });

  console.log('🔥 Connexion Firebase établie');
  module.exports = {
    admin,
    db: admin.firestore(),
    fieldValue: admin.firestore.FieldValue
  };
} catch (error) {
  console.error('⚠️ Firebase non connecté:', error.message);
  module.exports = {
    admin: null,
    db: null,
    fieldValue: null
  };
}

