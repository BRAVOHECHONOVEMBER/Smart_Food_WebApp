import {
initializeApp
} from
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

const firebaseConfig = {

apiKey: "YOUR_API_KEY",

authDomain: "YOUR_PROJECT.firebaseapp.com",

projectId: "YOUR_PROJECT_ID",

storageBucket: "YOUR_PROJECT.appspot.com",

messagingSenderId: "YOUR_SENDER_ID",

appId: "YOUR_APP_ID"

};
export const app =
initializeApp(firebaseConfig);

const TOKEN_KEY = 'smartFoodToken';
const USER_KEY = 'smartFoodUser';

export const API_BASE = window.API_BASE || '';

export const getSession = () => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    user: JSON.parse(localStorage.getItem(USER_KEY) || 'null')
});

export const saveSession = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const api = async (path, options = {}) => {
    const { token } = getSession();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Request failed.');
    }

    return data;
};

export const requireAuth = (roles = []) => {
    const session = getSession();

    if (!session.token || !session.user) {
        window.location.replace('/login.html');
        return session;
    }

    if (roles.length && !roles.includes(session.user.role)) {
        window.location.replace(session.user.role === 'Vendor' ? '/vendor-dashboard.html' : '/');
    }

    return session;
};

export const connectSocket = () => {
    if (!window.io) return null;
    const { token } = getSession();
    return window.io(API_BASE || window.location.origin, { auth: { token } });
};
