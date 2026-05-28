import { api, logout, requireAuth } from './api.js';
import { clearCart, getCart } from './cartStore.js';

requireAuth(['Customer']);

const cart = getCart();
const form = document.getElementById('checkoutForm');
const summary = document.getElementById('orderSummary');
const successPanel = document.getElementById('successPanel');

const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;

const toast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const node = document.createElement('div');
    node.className = `toast toast-${type}`;
    node.textContent = message;
    container.appendChild(node);
    setTimeout(() => node.remove(), 3000);
};

const getString = (formData, name) => String(formData.get(name) || '').trim();

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});

const renderSummary = () => {
    if (!summary) return;

    if (!cart.length) {
        summary.innerHTML = '<h3>Your cart is empty</h3><p>Return home to add items.</p>';
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    summary.innerHTML = `
        ${cart.map(item => `
            <div class="cart-item">
                <strong>${item.name}</strong>
                <span>${item.quantity} x ${money(item.price)}</span>
                <strong>${money(item.price * item.quantity)}</strong>
            </div>
        `).join('')}
        <h3>Total: ${money(total)}</h3>
    `;
};

document.querySelectorAll('[data-step]').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('[data-step]').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.step)?.classList.add('active');
    });
});

form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!cart.length) {
        toast('Your cart is empty.', 'error');
        return;
    }

    const vendorIds = new Set(cart.map(item => item.vendorId));
    if (vendorIds.size > 1) {
        toast('Please checkout one vendor at a time.', 'error');
        return;
    }

    const data = new FormData(form);
    const delivery = {
        fullname: getString(data, 'fullname'),
        email: getString(data, 'email'),
        phone: getString(data, 'phone'),
        address: getString(data, 'address'),
        instructions: getString(data, 'instructions')
    };

    if (!delivery.fullname || !delivery.email || !delivery.phone || !delivery.address) {
        toast('Please complete delivery details.', 'error');
        return;
    }

    const transactionId = `TXN-${Date.now()}`;
    const receipt = `RCP-${String(Date.now()).slice(-8)}`;

    try {
        const order = await api('/orders', {
            method: 'POST',
            body: JSON.stringify({
                vendorId: cart[0].vendorId,
                customerName: delivery.fullname,
                delivery,
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
        document.querySelector('[data-step="success"]')?.click();
        successPanel.innerHTML = `
            <h3>Order Successful</h3>
            <p>Order ID: ${order.id}</p>
            <p>Transaction ID: ${transactionId}</p>
            <p>Receipt: ${receipt}</p>
            <p>Payment Status: paid</p>
            <a class="vendor-btn" href="/orders.html">View Orders</a>
        `;
    } catch (error) {
        toast(error.message, 'error');
    }
});

renderSummary();
