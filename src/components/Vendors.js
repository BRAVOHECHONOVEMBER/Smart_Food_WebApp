import { actions } from '../services/state.js';

export const Vendors = {
    render: (vendors) => {
        const grid = document.getElementById('vendors-grid');
        if (!grid) return;

        grid.innerHTML = vendors.map(vendor => `
            <div class="vendor-card glass-card" data-id="${vendor.id}">
                <img src="${vendor.image}" alt="${vendor.name}">
                <div class="vendor-info">
                    <h3>${vendor.name}</h3>
                    <p class="text-muted">${vendor.description}</p>
                    <div class="vendor-meta">
                        <span class="rating">⭐ ${vendor.rating}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Attach Event Listeners
        grid.querySelectorAll('.vendor-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const selected = vendors.find(v => v.id === id);
                actions.selectVendor(selected);
                
                // Switch Views
                document.getElementById('vendors-section').classList.add('hidden');
                document.getElementById('menu-section').classList.remove('hidden');
                document.getElementById('current-vendor-name').textContent = selected.name;
            });
        });
    }
};
