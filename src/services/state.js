/**
 * Reactive State Management
 * Uses JS Proxies to automatically trigger UI updates when data changes
 */

const listeners = new Set();

const initialState = {
    vendors: [],
    selectedVendor: null,
    menu: [],
    cart: [],
    isCartOpen: false,
};

// Create the reactive proxy
export const store = new Proxy(initialState, {
    set(target, property, value) {
        target[property] = value;
        // Notify all subscribers that the state has changed
        listeners.forEach(callback => callback(target));
        return true;
    }
});

/**
 * Subscribe to state changes
 * @param {Function} callback 
 */
export const subscribe = (callback) => {
    listeners.add(callback);
    // Initial call to sync current state
    callback(store);
};

// Actions to mutate state
export const actions = {
    setVendors: (vendors) => {
        store.vendors = vendors;
    },
    
    selectVendor: (vendor) => {
        store.selectedVendor = vendor;
        store.menu = vendor ? vendor.menu : [];
    },

    addToCart: (product) => {
        const existing = store.cart.find(item => item.id === product.id);
        if (existing) {
            store.cart = store.cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            store.cart = [...store.cart, { ...product, quantity: 1 }];
        }
    },

    removeFromCart: (productId) => {
        store.cart = store.cart.filter(item => item.id !== productId);
    },

    updateQuantity: (productId, delta) => {
        store.cart = store.cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0);
    },

    toggleCart: (force) => {
        store.isCartOpen = force !== undefined ? force : !store.isCartOpen;
    }
};
