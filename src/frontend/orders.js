import { api, logout, requireAuth } from './api.js';

requireAuth(['Customer']);

const panel = document.getElementById('ordersPanel');

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});

const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;

try {
    const orders = await api('/orders/history');
    panel.innerHTML = orders.length
        ? `
            <table class="table">
                <thead><tr><th>Order</th><th>Status</th><th>Payment</th><th>Total</th><th>Receipt</th></tr></thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.status}</td>
                            <td>${order.payment?.status || 'pending'}</td>
                            <td>${money(order.total)}</td>
                            <td>${order.payment?.receipt || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
        : 'No orders found.';
} catch (error) {
    panel.textContent = error.message;
}
