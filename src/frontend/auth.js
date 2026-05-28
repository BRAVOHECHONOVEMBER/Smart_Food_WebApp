import { api, getSession, saveSession } from './api.js';

const toast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const node = document.createElement('div');
    node.className = 'toast';
    node.innerHTML = `<i class="fas ${type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}"></i><span>${message}</span>`;
    container.appendChild(node);
    setTimeout(() => node.remove(), 3200);
};

const redirectFor = (user) => {
    window.location.replace(user.role === 'Vendor' ? '/vendor-dashboard.html' : '/');
};

const session = getSession();
if (session.token && session.user && location.pathname.endsWith('login.html')) {
    redirectFor(session.user);
}

document.getElementById('loginForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: form.get('email'),
                password: form.get('password')
            })
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

    if (form.get('password') !== form.get('confirmPassword')) {
        toast('Passwords do not match.', 'error');
        return;
    }

    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: form.get('fullname'),
                email: form.get('email'),
                phone: form.get('phone'),
                password: form.get('password'),
                role: 'Customer'
            })
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
    const businessName = String(form.get('businessName'));
    const vendorId = `vendor-${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;

    try {
        const data = await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: businessName,
                email: form.get('email'),
                phone: form.get('phone'),
                type: form.get('businessCategory'),
                address: form.get('address'),
                password: form.get('password'),
                role: 'Vendor',
                vendorId
            })
        });
        saveSession(data);
        redirectFor(data.user);
    } catch (error) {
        toast(error.message, 'error');
    }
});
