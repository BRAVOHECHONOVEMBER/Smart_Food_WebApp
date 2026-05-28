const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
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