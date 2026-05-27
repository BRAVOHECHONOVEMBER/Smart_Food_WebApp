import { actions } from '../services/state.js';
import { formatCurrency } from '../utils/formatters.js';

export const Cart = {
    render: (cart, isOpen) => {
        const sidebar = document.getElementById('cart-sidebar');
        const itemsList = document.getElementById('cart-items');
        const countSpan = document.getElementById('cart-count');
        const subtotalSpan = document.getElementById('cart-subtotal');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!sidebar || !itemsList) return;

        // Handle Sidebar visibility
        if (isOpen) {
            sidebar.classList.add('active');
        } else {
            sidebar.classList.remove('active');
        }

        // Update Counter
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countSpan.textContent = totalItems;

        // Render Items
        if (cart.length === 0) {
            itemsList.innerHTML = `<div class="empty-cart"><i class="fa-solid fa-basket-shopping"></i><p>Your cart is empty</p></div>`;
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            itemsList.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price-each">${formatCurrency(item.price)}</span>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn minus" data-id="${item.id}">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}">+</button>
                    </div>
                </div>
            `).join('');
        }

        // Update Subtotal
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        subtotalSpan.textContent = formatCurrency(subtotal);

        // Attach Listeners
        itemsList.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const delta = btn.classList.contains('plus') ? 1 : -1;
                actions.updateQuantity(id, delta);
            });
        });
    }
};
