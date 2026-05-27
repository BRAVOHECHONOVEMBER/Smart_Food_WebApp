import { actions } from '../services/state.js';

const statusLabels = {
    open: 'Open',
    busy: 'Busy',
    closed: 'Closed'
};

export const Vendors = {
    render: (vendors) => {
        const grid = document.getElementById('vendors-grid');
        if (!grid) return;

        grid.innerHTML = vendors.map(vendor => `
            <article class="vendor-card glass-card" data-id="${vendor.id}" tabindex="0" role="button" aria-label="Open ${vendor.name} menu">
                <img src="${vendor.image}" alt="${vendor.name}">
                <div class="vendor-info">
                    <div class="vendor-title-row">
                        <h3>${vendor.name}</h3>
                        <span class="status-badge status-${vendor.status}">${statusLabels[vendor.status] || vendor.status}</span>
                    </div>
                    <p class="text-muted">${vendor.description}</p>
                    <div class="vendor-meta">
                        <span class="rating"><i class="fa-solid fa-star"></i> ${vendor.rating.toFixed(1)}</span>
                        <span><i class="fa-regular fa-clock"></i> ${vendor.deliveryTime}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${vendor.location}</span>
                    </div>
                </div>
            </article>
        `).join('');

        const openVendor = (card) => {
            const selected = vendors.find(vendor => vendor.id === card.dataset.id);
            if (!selected || selected.status === 'closed') return;

            actions.selectVendor(selected);
            document.getElementById('vendors-section')?.classList.add('hidden');
            document.getElementById('menu-section')?.classList.remove('hidden');
            document.getElementById('current-vendor-name').textContent = selected.name;
        };

        grid.querySelectorAll('.vendor-card').forEach(card => {
            card.addEventListener('click', () => openVendor(card));
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openVendor(card);
                }
            });
        });
    }
};
