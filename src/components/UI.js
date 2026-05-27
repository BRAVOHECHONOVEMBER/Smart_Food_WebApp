export const UI = {
    showToast: (message) => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },

    setupGlobalEvents: () => {
        // Toggle Cart
        document.getElementById('cart-toggle-btn').addEventListener('click', () => {
            import('../services/state.js').then(({ actions }) => actions.toggleCart());
        });

        document.getElementById('close-cart').addEventListener('click', () => {
            import('../services/state.js').then(({ actions }) => actions.toggleCart(false));
        });

        // Back button
        document.getElementById('back-to-vendors').addEventListener('click', () => {
            document.getElementById('vendors-section').classList.remove('hidden');
            document.getElementById('menu-section').classList.add('hidden');
        });
    }
};
