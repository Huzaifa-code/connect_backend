const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables


const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountBase64) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable');
}

// Decode the base64 string and write it to a temporary file
const serviceAccountBuffer = Buffer.from(serviceAccountBase64, 'base64');
const serviceAccountFilePath = path.join(__dirname, 'serviceAccountKey.json');
fs.writeFileSync(serviceAccountFilePath, serviceAccountBuffer);

const serviceAccount = require(serviceAccountFilePath);


// Initialize Firebase Admin with your service account
// const serviceAccount = require(path.resolve(__dirname, '../', process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
