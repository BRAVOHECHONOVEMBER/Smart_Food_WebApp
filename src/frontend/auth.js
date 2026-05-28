import { api, getSession, saveSession } from './api.js';

const toast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const node = document.createElement('div');
    node.className = `toast toast-${type}`;
    node.innerHTML = `<i class="fas ${type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}"></i><span>${message}</span>`;
    container.appendChild(node);
    setTimeout(() => node.remove(), 3200);
};

const redirectFor = (user) => {
    window.location.replace(user.roles?.includes('Vendor')? '/vendor-dashboard.html' : '/');
};

const getString = (form, name) => String(form.get(name) || '').trim();

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validatePassword = (password) => password.length >= 6;

const existingSession = getSession();
if (existingSession.token && existingSession.user && location.pathname.endsWith('login.html')) {
    redirectFor(existingSession.user);
}

document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = getString(form, 'email');
    const password = getString(form, 'password');

    if (!validateEmail(email) || !password) {
        toast('Enter a valid email and password.', 'error');
        return;
    }

    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        saveSession(data);
        redirectFor(data.user);
    } catch (error) {
        toast(error.message, 'error');
    }
});

document.getElementById('customerSignupForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = getString(form, 'fullname');
    const email = getString(form, 'email');
    const phone = getString(form, 'phone');
    const password = getString(form, 'password');
    const confirmPassword = getString(form, 'confirmPassword');

    if (!name || !phone || !validateEmail(email)) {
        toast('Complete all required fields with valid information.', 'error');
        return;
    }

    if (!validatePassword(password)) {
        toast('Password must be at least 6 characters.', 'error');
        return;
    }

    if (password !== confirmPassword) {
        toast('Passwords do not match.', 'error');
        return;
    }

    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, phone, password, role: 'Customer' })
        });
        saveSession(data);
        redirectFor(data.user);
    } catch (error) {
        toast(error.message, 'error');
    }
});

document.getElementById('vendorSignupForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const businessName = getString(form, 'businessName');
    const email = getString(form, 'email');
    const phone = getString(form, 'phone');
    const type = getString(form, 'businessCategory');
    const address = getString(form, 'address');
    const password = getString(form, 'password');
    const vendorId = `vendor-${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

    if (!businessName || !phone || !type || !address || !validateEmail(email)) {
        toast('Complete all vendor signup fields.', 'error');
        return;
    }

    if (!validatePassword(password)) {
        toast('Password must be at least 6 characters.', 'error');
        return;
    }

    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name: businessName, email, phone, type, address, password, role: 'Vendor', vendorId })
        });
        saveSession(data);
        redirectFor(data.user);
    } catch (error) {
        toast(error.message, 'error');
    }
});
