const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); // Load environment variables

// Initialize Firebase Admin with your service account
const serviceAccount = require(path.resolve(__dirname, '../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
