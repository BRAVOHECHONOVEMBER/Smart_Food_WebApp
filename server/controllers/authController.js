const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { admin, collections } = require('../config/firebase');

const allowedRoles = new Set(['Customer', 'Vendor']);

const createToken = (user) => jwt.sign(
    { uid: user.uid, email: user.email, role: user.role, vendorId: user.vendorId || null },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const register = async (req, res, next) => {
    try {
        const { email, password, name, role = 'Customer', vendorId = null } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        if (!allowedRoles.has(role)) {
            return res.status(400).json({ message: 'Role must be Customer or Vendor.' });
        }

        const userRecord = await admin.auth().createUser({ email, password, displayName: name });
        const passwordHash = await bcrypt.hash(password, 12);
        const user = {
            uid: userRecord.uid,
            email,
            name,
            role,
            vendorId: role === 'Vendor' ? vendorId : null,
            passwordHash,
            createdAt: new Date().toISOString()
        };

        await collections.users.doc(userRecord.uid).set(user);

        if (role === 'Vendor' && vendorId) {
            await collections.vendors.doc(vendorId).set({
                id: vendorId,
                ownerId: userRecord.uid,
                name,
                email,
                phone: req.body.phone || '',
                address: req.body.address || '',
                type: req.body.type || 'Food Vendor',
                status: 'online',
                rating: 0,
                orders: 0,
                createdAt: new Date().toISOString()
            }, { merge: true });
        }

        res.status(201).json({
            token: createToken(user),
            user: { uid: user.uid, email, name, role, vendorId: user.vendorId }
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const snapshot = await collections.users.where('email', '==', email).limit(1).get();
        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = snapshot.docs[0].data();
        const matches = await bcrypt.compare(password, user.passwordHash);
        if (!matches) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        res.json({
            token: createToken(user),
            user: {
                uid: user.uid,
                email: user.email,
                name: user.name,
                role: user.role,
                vendorId: user.vendorId || null
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
