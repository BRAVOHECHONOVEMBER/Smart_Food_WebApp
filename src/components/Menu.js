import { actions, selectors, store } from '../services/state.js';
import { formatCurrency } from '../utils/formatters.js';
import { UI } from './UI.js';

const stockLabel = (item) => {
    if (item.stock <= 0) return '<span class="stock-badge stock-out">Out of stock</span>';
    if (item.stock <= item.threshold) return `<span class="stock-badge stock-low">Only ${item.stock} left</span>`;
    return `<span class="stock-badge stock-ok">${item.stock} available</span>`;
};

export const Menu = {
    render: () => {
        const container = document.getElementById('menu-container');
        if (!container) return;

        const categories = selectors.categories();
        const menuItems = selectors.filteredMenu();

        container.innerHTML = `
            <div class="menu-toolbar glass-card">
                <div class="filter-group">
                    <label for="menu-search">Search</label>
                    <input id="menu-search" type="search" placeholder="Find meals" value="${store.filters.search}">
                </div>
                <div class="filter-group">
                    <label for="category-filter">Category</label>
                    <select id="category-filter">
                        ${categories.map(category => `
                            <option value="${category}" ${category === store.filters.category ? 'selected' : ''}>${category}</option>
                        `).join('')}
                    </select>
                </div>
                <label class="toggle-row">
                    <input id="stock-filter" type="checkbox" ${store.filters.stock === 'available' ? 'checked' : ''}>
                    Available only
                </label>
            </div>
            ${menuItems.length ? Menu.renderCategories(menuItems) : '<p class="text-muted empty-state">No menu items match your filters.</p>'}
        `;

        container.querySelector('#menu-search')?.addEventListener('input', event => {
            actions.setFilter('search', event.target.value);
        });

        container.querySelector('#category-filter')?.addEventListener('change', event => {
            actions.setFilter('category', event.target.value);
        });

        container.querySelector('#stock-filter')?.addEventListener('change', event => {
            actions.setFilter('stock', event.target.checked ? 'available' : 'all');
        });

        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const product = store.menu.find(item => item.id === btn.dataset.id);
                const result = actions.addToCart(product);
                UI.showToast(result.message, result.ok ? 'success' : 'warning');
            });
        });
    },

    renderCategories: (menuItems) => {
        const categories = [...new Set(menuItems.map(item => item.category))];

        return categories.map(category => `
            <section class="menu-category">
                <h3 class="category-title">${category}</h3>
                <div class="menu-grid">
                    ${menuItems
                        .filter(item => item.category === category)
                        .map(item => `
                            <article class="menu-item-card glass-card ${item.stock <= 0 ? 'is-unavailable' : ''}">
                                <div>
                                    <div class="item-title-row">
                                        <h4>${item.name}</h4>
                                        ${stockLabel(item)}
                                    </div>
                                    <p class="text-muted small">${item.description}</p>
                                </div>
                                <div class="item-footer">
                                    <span class="item-price">${formatCurrency(item.price)}</span>
                                    <button class="add-to-cart-btn btn-primary" data-id="${item.id}" ${item.stock <= 0 ? 'disabled' : ''}>
                                        Add to Cart
                                    </button>
                                </div>
                            </article>
                        `).join('')}
                </div>
            </section>
        `).join('');
    }
};
