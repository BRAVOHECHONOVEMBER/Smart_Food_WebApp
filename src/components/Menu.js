import { actions } from '../services/state.js';
import { formatCurrency } from '../utils/formatters.js';
import { UI } from './UI.js';

export const Menu = {
    render: (menuItems) => {
        const container = document.getElementById('menu-container');
        if (!container) return;

        if (menuItems.length === 0) {
            container.innerHTML = `<p class="text-muted">No items available.</p>`;
            return;
        }

        // Group by category
        const categories = [...new Set(menuItems.map(item => item.category))];

        container.innerHTML = categories.map(cat => `
            <div class="menu-category">
                <h3 class="category-title">${cat}</h3>
                <div class="menu-grid">
                    ${menuItems
                        .filter(item => item.category === cat)
                        .map(item => `
                            <div class="menu-item-card glass-card">
                                <div>
                                    <h4>${item.name}</h4>
                                    <p class="text-muted small">${item.description}</p>
                                </div>
                                <div class="item-footer">
                                    <span class="item-price">${formatCurrency(item.price)}</span>
                                    <button class="add-to-cart-btn btn-primary" data-id="${item.id}">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                </div>
            </div>
        `).join('');

        // Attach listeners
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const product = menuItems.find(p => p.id === id);
                actions.addToCart(product);
                UI.showToast(`Added ${product.name} to cart!`);
            });
        });
    }
};
