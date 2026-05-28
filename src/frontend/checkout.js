import { api, getSession, logout, requireAuth } from './api.js';
import { clearCart, getCart } from './cartStore.js';

const { user } = requireAuth(['Customer']);
const cart = getCart();
const form = document.getElementById('checkoutForm');
const summary = document.getElementById('orderSummary');
const successPanel = document.getElementById('successPanel');

const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;
const toast = (message) => {
    const container = document.getElementById('toastContainer');
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    container.appendChild(node);
    setTimeout(() => node.remove(), 3000);
};

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});

if (!cart.length) {
    summary.innerHTML = '<h3>Your cart is empty</h3><p>Return home to add items.</p>';
} else {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    summary.innerHTML = `
        ${cart.map(item => `<div class="cart-item"><strong>${item.name}</strong><span>${item.quantity} x ${money(item.price)}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join('')}
        <h3>Total: ${money(total)}</h3>
    `;
}

document.querySelectorAll('[data-step]').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('[data-step]').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.step).classList.add('active');
    });
});

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!cart.length) {
        toast('Your cart is empty.');
        return;
    }

    const vendors = new Set(cart.map(item => item.vendorId));
    if (vendors.size > 1) {
        toast('Please checkout one vendor at a time.');
        return;
    }

    const data = new FormData(form);
    const transactionId = `TXN-${Date.now()}`;
    const receipt = `RCP-${String(Date.now()).slice(-8)}`;

    try {
        const order = await api('/orders', {
            method: 'POST',
            body: JSON.stringify({
                vendorId: cart[0].vendorId,
                customerName: data.get('fullname'),
                delivery: {
                    fullname: data.get('fullname'),
                    email: data.get('email'),
                    phone: data.get('phone'),
                    address: data.get('address'),
                    instructions: data.get('instructions')
                },
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                payment: {
                    method: data.get('paymentMethod'),
                    transactionId,
                    receipt,
                    status: 'paid',
                    provider: 'simulated'
                }
            })
        });

        clearCart();
        document.querySelector('[data-step="success"]').click();
        successPanel.innerHTML = `
            <h3>Order Successful</h3>
            <p>Order ID: ${order.id}</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>Receipt: ${receipt}</p>
            <p>Payment Status: paid</p>
        `;
    } catch (error) {
        toast(error.message);
    }
});
