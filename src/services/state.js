const listeners = new Set();

const clone = (value) => JSON.parse(JSON.stringify(value));

const initialState = {
    vendors: [],
    selectedVendor: null,
    menu: [],
    cart: [],
    orders: [],
    isCartOpen: false,
    filters: {
        category: 'All',
        search: '',
        stock: 'available'
    },
    loading: false,
    modal: null
};

export const store = { ...initialState };

const notify = () => {
    const snapshot = Object.freeze({
        ...store,
        vendors: [...store.vendors],
        menu: [...store.menu],
        cart: [...store.cart],
        orders: [...store.orders],
        filters: { ...store.filters }
    });

    listeners.forEach(callback => callback(snapshot));
};

const getVendorMenu = (vendorId, vendors = store.vendors) => {
    const vendor = vendors.find(item => item.id === vendorId);
    return vendor ? [...vendor.menu] : [];
};

const getCartItemCount = (productId) => {
    const item = store.cart.find(cartItem => cartItem.id === productId);
    return item ? item.quantity : 0;
};

const setVendorMenuStock = (productId, nextStock) => {
    store.vendors = store.vendors.map(vendor => ({
        ...vendor,
        menu: vendor.menu.map(product => (
            product.id === productId ? { ...product, stock: nextStock } : product
        ))
    }));

    if (store.selectedVendor) {
        store.menu = getVendorMenu(store.selectedVendor.id);
    }
};

export const subscribe = (callback) => {
    listeners.add(callback);
    callback({
        ...store,
        vendors: [...store.vendors],
        menu: [...store.menu],
        cart: [...store.cart],
        filters: { ...store.filters }
    });

    return () => listeners.delete(callback);
};

export const selectors = {
    cartSubtotal: () => store.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    cartCount: () => store.cart.reduce((sum, item) => sum + item.quantity, 0),
    categories: () => ['All', ...new Set(store.menu.map(item => item.category))],
    filteredMenu: () => {
        const query = store.filters.search.trim().toLowerCase();

        return store.menu.filter(item => {
            const matchesCategory = store.filters.category === 'All' || item.category === store.filters.category;
            const matchesStock = store.filters.stock === 'all' || item.stock > 0;
            const matchesSearch = !query || `${item.name} ${item.description}`.toLowerCase().includes(query);
            return matchesCategory && matchesStock && matchesSearch;
        });
    }
};

export const actions = {
    setVendors: (vendors = []) => {
        store.vendors = vendors.map(vendor => ({
            ...vendor,
            menu: vendor.menu.map(product => ({ ...product }))
        }));

        if (store.selectedVendor) {
            store.selectedVendor = store.vendors.find(vendor => vendor.id === store.selectedVendor.id) || null;
            store.menu = store.selectedVendor ? getVendorMenu(store.selectedVendor.id) : [];
        }

        notify();
    },

    selectVendor: (vendor) => {
        store.selectedVendor = vendor ? { ...vendor } : null;
        store.menu = vendor ? getVendorMenu(vendor.id) : [];
        store.cart = [];
        store.filters = { category: 'All', search: '', stock: 'available' };
        notify();
    },

    setFilter: (name, value) => {
        store.filters = { ...store.filters, [name]: value };
        notify();
    },

    addToCart: (product) => {
        if (!product || product.stock <= 0) {
            return { ok: false, message: 'This item is currently out of stock.' };
        }

        const quantityInCart = getCartItemCount(product.id);
        if (quantityInCart >= product.stock) {
            return { ok: false, message: `Only ${product.stock} ${product.name} available.` };
        }

        const existing = store.cart.find(item => item.id === product.id);
        store.cart = existing
            ? store.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
            : [...store.cart, { ...product, quantity: 1, vendorId: store.selectedVendor?.id || product.vendorId }];

        notify();
        return { ok: true, message: `${product.name} added to cart.` };
    },

    removeFromCart: (productId) => {
        store.cart = store.cart.filter(item => item.id !== productId);
        notify();
    },

    updateQuantity: (productId, delta) => {
        const product = store.menu.find(item => item.id === productId);
        const current = store.cart.find(item => item.id === productId);

        if (!current) return { ok: false, message: 'Item is not in the cart.' };

        const nextQuantity = current.quantity + delta;
        if (nextQuantity <= 0) {
            actions.removeFromCart(productId);
            return { ok: true, message: 'Item removed from cart.' };
        }

        if (product && nextQuantity > product.stock) {
            return { ok: false, message: `Only ${product.stock} ${product.name} available.` };
        }

        store.cart = store.cart.map(item => (
            item.id === productId ? { ...item, quantity: nextQuantity } : item
        ));
        notify();
        return { ok: true, message: 'Quantity updated.' };
    },

    toggleCart: (force) => {
        store.isCartOpen = force !== undefined ? force : !store.isCartOpen;
        notify();
    },

    checkout: () => {
        if (!store.cart.length || !store.selectedVendor) {
            return { ok: false, message: 'Add at least one item before checkout.' };
        }

        const unavailable = store.cart.find(item => {
            const product = store.menu.find(menuItem => menuItem.id === item.id);
            return !product || item.quantity > product.stock;
        });

        if (unavailable) {
            return { ok: false, message: `${unavailable.name} no longer has enough stock.` };
        }

        store.cart.forEach(item => {
            const product = store.menu.find(menuItem => menuItem.id === item.id);
            setVendorMenuStock(item.id, product.stock - item.quantity);
        });

        const order = {
            id: `ord-${Date.now()}`,
            vendorId: store.selectedVendor.id,
            customerName: 'Walk-in Customer',
            status: 'pending',
            total: selectors.cartSubtotal(),
            createdAt: new Date().toISOString(),
            items: store.cart.map(item => ({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }))
        };

        store.orders = [order, ...store.orders];
        store.cart = [];
        store.isCartOpen = false;
        notify();

        return { ok: true, message: `Order ${order.id} placed successfully.`, order };
    },

    setLoading: (loading) => {
        store.loading = Boolean(loading);
        notify();
    },

    setModal: (modal) => {
        store.modal = modal;
        notify();
    }
};
