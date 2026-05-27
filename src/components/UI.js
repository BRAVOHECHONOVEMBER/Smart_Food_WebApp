import { actions } from '../services/state.js';

const ensureModal = () => {
    let modal = document.getElementById('app-modal');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'modal-backdrop hidden';
    modal.innerHTML = `
        <div class="modal-panel glass-card" role="dialog" aria-modal="true">
            <button class="btn-icon modal-close" aria-label="Close modal"><i class="fa-solid fa-xmark"></i></button>
            <h3 id="modal-title"></h3>
            <p id="modal-body" class="text-muted"></p>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.modal-close').addEventListener('click', () => UI.closeModal());
    modal.addEventListener('click', event => {
        if (event.target === modal) UI.closeModal();
    });
    return modal;
};

const ensureLoader = () => {
    let loader = document.getElementById('global-loader');
    if (loader) return loader;

    loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.className = 'loading-overlay hidden';
    loader.innerHTML = '<div class="loader-card glass-card"><span class="spinner"></span><span>Processing</span></div>';
    document.body.appendChild(loader);
    return loader;
};

export const UI = {
    showToast: (message, type = 'info') => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        window.setTimeout(() => {
            toast.classList.add('toast-exit');
            window.setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    setLoading: (loading) => {
        ensureLoader().classList.toggle('hidden', !loading);
    },

    openModal: ({ title, body }) => {
        const modal = ensureModal();
        modal.querySelector('#modal-title').textContent = title;
        modal.querySelector('#modal-body').textContent = body;
        modal.classList.remove('hidden');
        actions.setModal({ title, body });
    },

    closeModal: () => {
        ensureModal().classList.add('hidden');
        actions.setModal(null);
    },

    badge: (text, type = 'default') => `<span class="status-badge status-${type}">${text}</span>`,

    setupGlobalEvents: () => {
        ensureModal();
        ensureLoader();

        document.getElementById('cart-toggle-btn')?.addEventListener('click', () => {
            actions.toggleCart();
        });

        document.getElementById('close-cart')?.addEventListener('click', () => {
            actions.toggleCart(false);
        });

        document.getElementById('back-to-vendors')?.addEventListener('click', () => {
            document.getElementById('vendors-section')?.classList.remove('hidden');
            document.getElementById('menu-section')?.classList.add('hidden');
            actions.selectVendor(null);
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                actions.toggleCart(false);
                UI.closeModal();
            }
        });
    }
};
