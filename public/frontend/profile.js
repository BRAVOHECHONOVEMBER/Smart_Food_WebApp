import { getSession, logout, requireAuth } from './api.js';

requireAuth(['Customer']);

const { user } = getSession();
const panel = document.getElementById('profilePanel');

panel.innerHTML = `
    <div class="form-group"><label>Name</label><input value="${user.name || ''}" readonly></div>
    <div class="form-group"><label>Email</label><input value="${user.email || ''}" readonly></div>
    <div class="form-group"><label>Role</label><input value="${user.role || ''}" readonly></div>
`;

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});
