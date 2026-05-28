const jwt = require('jsonwebtoken');

const auth = (roles = []) => (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

		console.log('AUTH DEBUG');
		console.log('payload:', payload);
		console.log('required roles:', roles);

		if (
			roles.length &&
			!roles.some(role => payload.roles?.includes(role))
		) {
			console.log('403 CHECK FAILED');
			console.log('payload:', payload);
			console.log('roles:', roles);

			return res.status(403).json({
				message: 'Insufficient permissions.'
			});
		}

        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = { auth };
