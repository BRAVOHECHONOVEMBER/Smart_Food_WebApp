const admin = require('firebase-admin');

const hasServiceAccount = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

if (!admin.apps.length) {
    if (hasServiceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            })
        });
    } else {
        admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID || 'smart-food-ordering-system-local'
        });
    }
}

const db = admin.firestore();

const collections = {
    users: db.collection('users'),
    vendors: db.collection('vendors'),
    products: db.collection('products'),
    inventory: db.collection('inventory'),
    orders: db.collection('orders'),
    transactions: db.collection('transactions')
};

module.exports = { admin, db, collections };
