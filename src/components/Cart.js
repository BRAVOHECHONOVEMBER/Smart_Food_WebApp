import { actions } from '../services/state.js';
import { formatCurrency } from '../utils/formatters.js';
import { UI } from './UI.js';

export const Cart = {
    render: (cart, isOpen) => {
        const sidebar = document.getElementById('cart-sidebar');
        const itemsList = document.getElementById('cart-items');
        const countSpan = document.getElementById('cart-count');
        const subtotalSpan = document.getElementById('cart-subtotal');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (!sidebar || !itemsList || !countSpan || !subtotalSpan || !checkoutBtn) return;

        sidebar.classList.toggle('active', isOpen);
        sidebar.classList.toggle('hidden', false);

        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        countSpan.textContent = totalItems;
        subtotalSpan.textContent = formatCurrency(subtotal);
        checkoutBtn.disabled = cart.length === 0;

        itemsList.innerHTML = cart.length
            ? cart.map(item => `
                <div class="cart-item">
                    <div class="item-details">
                        <span class="item-name">${item.name}</span>
                        <span class="item-price-each">${formatCurrency(item.price)} each</span>
                    </div>
                    <div class="item-controls">
                        <button class="qty-btn minus" data-id="${item.id}" aria-label="Decrease ${item.name} quantity">-</button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn plus" data-id="${item.id}" aria-label="Increase ${item.name} quantity">+</button>
                        <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-cart"><i class="fa-solid fa-basket-shopping"></i><p>Your cart is empty</p></div>';

        itemsList.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const delta = btn.classList.contains('plus') ? 1 : -1;
                const result = actions.updateQuantity(btn.dataset.id, delta);
                if (!result.ok) UI.showToast(result.message, 'warning');
            });
        });

        itemsList.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                actions.removeFromCart(btn.dataset.id);
                UI.showToast('Item removed from cart.', 'success');
            });
        });

        checkoutBtn.onclick = () => {
            UI.setLoading(true);
            const result = actions.checkout();
            UI.setLoading(false);
            UI.showToast(result.message, result.ok ? 'success' : 'warning');

            if (result.ok) {
                UI.openModal({
                    title: 'Order placed',
                    body: `Your order ${result.order.id} has been sent to the vendor.`
                });
            }
        };
    }
};
