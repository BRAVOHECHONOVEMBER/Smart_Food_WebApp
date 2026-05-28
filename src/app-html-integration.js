import { api, connectSocket, getSession, logout as clearSession } from './frontend/api.js';
import { getCart, setCart, clearCart } from './frontend/cartStore.js';

let vendors = [];
let menuItems = { food: [], drinks: [], water: [] };
let products = [];
let cart = getCart();
let currentFilter = 'all';
let socket = null;

const session = getSession();

if (!session.token || !session.user) {
    window.location.replace('/login.html');
}

const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;
const allMenuProducts = () => Object.values(menuItems).flat();
const updateLiveStock = () => {

const allProducts =
allMenuProducts();

console.log(
'ALL PRODUCTS:',
allProducts
);

const liveStock =
allProducts.reduce(

(total,item)=>{

const stock =
Number(item.stock || 0);

console.log(
'PRODUCT:',
item.name,
'STOCK:',
stock
);

return total + stock;

},

0

);

console.log(
'TOTAL LIVE STOCK:',
liveStock
);

const counter =
document.getElementById(
'liveStockCounter'
);

console.log(
'COUNTER:',
counter
);

if(counter){

counter.textContent =
liveStock;

}

};
const findProduct = (id) => [...allMenuProducts(), ...products].find(item => item.id === id);
const byVendorName = (name) => vendors.find(vendor => vendor.name === name);

const normalizeVendor = (vendor) => ({
    id: vendor.id,
    name: vendor.name || vendor.businessName || 'Unnamed Vendor',
    type: vendor.type || vendor.category || vendor.description || 'Food Vendor',
    rating: Number(vendor.rating || 0),
    orders: Number(vendor.orders || 0),
    image: vendor.image || vendor.logo || vendor.name?.slice(0, 2).toUpperCase() || '2P',
    status: vendor.status || 'online'
});

const normalizeProduct = (vendor, product) => ({
    id: product.id,
    name: product.name || 'Unnamed Product',
    price: Number(product.price || 0),
    stock: Number(product.stock ?? product.inventory?.stock ?? product.quantity ?? 0),
    vendor: vendor.name,
    vendorId: vendor.id,
    category: String(product.category || 'food').toLowerCase(),
    icon: product.icon || product.image || product.name?.slice(0, 2).toUpperCase() || '2P',
    image: product.image || '',
    badge: product.badge || product.status || 'Available',
    description: product.description || 'Freshly prepared and available from this vendor.'
});

const emptyMessage = (message) => `
    <div class="empty-cart">
        <i class="fas fa-store-slash"></i>
        <h3>${message}</h3>
    </div>
`;

const loadData = async () => {
    vendors = [];
    products = [];
    menuItems = { food: [], drinks: [], water: [] };

    const remoteVendors = await api('/vendors');
    vendors = Array.isArray(remoteVendors) ? remoteVendors.map(normalizeVendor) : [];

    for(const vendor of vendors){
        const remoteProducts = await api(`/vendors/${vendor.id}/products`);
        const normalized = Array.isArray(remoteProducts)
            ? remoteProducts.map(product => normalizeProduct(vendor, product))
            : [];

        normalized.forEach(product => {
            const category = ['food', 'drinks', 'water'].includes(product.category) ? product.category : 'food';
            menuItems[category].push(product);
            if (category !== 'water') products.push(product);
        });
    }
};

const syncSocket = () => {
    socket = connectSocket();
    if (!socket) return;

    if (session.user.role === 'Vendor' && session.user.vendorId) {
        socket.on('connect', () => socket.emit('vendor:join', { vendorId: session.user.vendorId }));
    }

    socket.on('vendor:new-order', order => {
        showToast(`New order received: ${order.id}`, 'success');
        showStockNotification('New order', order.status || 'pending');
    });

    socket.on('vendor:low-stock', item => {
        showToast(`Low stock alert: ${item.name || item.productId}`, 'warning');
        showStockNotification(item.name || item.productId, `${item.stock} left`);
        updateLocalStock(item.productId, item.stock);
    });

    socket.on('vendor:order-status', order => {
        showToast(`Order ${order.id} is now ${order.status}.`, 'success');
        showStockNotification(`Order ${order.id}`, order.status);
    });
};

const renderRoleNavigation = () => {
    const headerActions = document.querySelector('.header-actions');
    if (!headerActions || document.getElementById('roleNavigation')) return;

    const nav = document.createElement('div');
    nav.id = 'roleNavigation';
    nav.className = 'header-actions';
    nav.innerHTML = session.user?.role === 'Vendor'
        ? `
            <a class="vendor-btn" href="/vendor-dashboard.html">Dashboard</a>
            <a class="vendor-btn" href="/vendor-dashboard.html#inventory">Inventory</a>
            <a class="vendor-btn" href="/vendor-dashboard.html#orders">Orders</a>
            <a class="vendor-btn" href="/vendor-dashboard.html#pos">POS</a>
            <a class="vendor-btn" href="/vendor-dashboard.html#analytics">Analytics</a>
            <button class="vendor-btn" onclick="logout()">Logout</button>
        `
        : `
            <a class="vendor-btn" href="/">Home</a>
            <a class="vendor-btn" href="/orders.html">Orders</a>
            <a class="vendor-btn" href="/checkout.html">Checkout</a>
            <a class="vendor-btn" href="/profile.html">Profile</a>
            <button class="vendor-btn" onclick="logout()">Logout</button>
        `;

    headerActions.prepend(nav);
};

const updateLocalStock = (productId, stock) => {
    Object.keys(menuItems).forEach(category => {
        menuItems[category] = menuItems[category].map(item => item.id === productId ? { ...item, stock } : item);
    });
    products = products.map(product => product.id === productId ? { ...product, stock } : product);
    renderMenu();
    renderProducts();
};

window.toggleCategory = (header) => {
    const content = header.nextElementSibling;
    const isOpen = content.classList.contains('open');

    document.querySelectorAll('.category-content').forEach(item => item.classList.remove('open'));
    document.querySelectorAll('.category-header').forEach(item => item.classList.remove('active'));

    if (!isOpen) {
        content.classList.add('open');
        header.classList.add('active');
    }
};

window.renderMenu = () => {

Object.keys(menuItems).forEach(category => {

const container =
document.getElementById(
`${category}-menu`
);

if (!container) return;

if (!menuItems[category].length) {

container.innerHTML =
emptyMessage(
'No products available'
);

return;

}

container.innerHTML =
menuItems[category]
.map(item => `

<div
class="menu-item"
onclick="
addToCart(
'${item.id}',
'${category}'
)
"
>

<div class="menu-product">

<img
class="menu-image"
src="${
item.image ||
'/images/default-food.png'
}"
alt="${item.name}"
onerror="
this.src='/images/default-food.png'
"
/>

<div class="menu-text">

<div class="item-name">
${item.name}
</div>

<div class="vendor-name">
${item.vendor || 'Vendor'}
</div>

<div class="item-price">
${money(item.price)}
</div>

<div class="
stock-badge
${getStockClass(item.stock)}
">

<i class="fas fa-box"></i>

${item.stock} left

</div>

</div>

<div class="menu-right">

<button
class="add-btn"
${item.stock <= 0
? 'disabled'
: ''
}
onclick="
event.stopPropagation();

addToCart(
'${item.id}',
'${category}'
)
"
>

<i class="fas fa-plus"></i>

</button>

</div>

</div>

</div>

`).join('');

});
updateLiveStock();
};
window.getStockClass = (stock) => {
    if (stock > 20) return 'stock-high';
    if (stock > 10) return 'stock-medium';
    return 'stock-low';
};

window.renderVendors = () => {
    const grid = document.getElementById('vendorsGrid');
    if (!grid) return;

    if (!vendors.length) {
        grid.innerHTML = emptyMessage('No vendors available');
        return;
    }

    grid.innerHTML = vendors.map(vendor => `
        <div class="vendor-card">
            <div class="vendor-banner">
                <div class="vendor-logo">${vendor.image}</div>
                <div class="vendor-status">Open</div>
            </div>
            <div class="vendor-info">
                <div class="vendor-name">${vendor.name}</div>
                <div class="vendor-type">${vendor.type}</div>
                <div class="vendor-stats">
                    <div class="stat"><div class="stat-value">${vendor.rating.toFixed(1)}</div><div class="stat-label">Rating</div></div>
                    <div class="stat"><div class="stat-value">${vendor.orders.toLocaleString()}</div><div class="stat-label">Orders</div></div>
                    <div class="stat">
					<div class="stat-value">
					${Object.values(menuItems)
					.flat()
					.filter(
					item => item.vendorId === vendor.id
					).length}
					</div>
					<div class="stat-label">
					Items
					</div>
					</div>
                </div>
            </div>
        </div>
    `).join('');
};

window.renderProducts = () => {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;

    const filtered = currentFilter === 'all' ? products : products.filter(product => product.vendor === currentFilter);

    if (!filtered.length) {
        grid.innerHTML = emptyMessage(vendors.length ? 'No products available' : 'No vendors available');
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : product.icon}
                <span class="product-badge">${product.badge}</span>
                <div class="stock-indicator">
                    <div class="stock-dot" style="background: ${getStockColor(product.stock)}"></div>
                    <span>${product.stock} in stock</span>
                </div>
            </div>
            <div class="product-details">
                <div class="product-vendor">${product.vendor}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.description}</div>
                <div class="product-footer">
                    <span class="product-price">${money(product.price)}</span>
                    <button class="add-to-cart" onclick="addProductToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> Add
                    </button>
                </div>
            </div>
        </div>
    `).join('');
};

window.getStockColor = (stock) => {
    if (stock > 15) return '#28a745';
    if (stock > 5) return '#ffc107';
    return '#dc3545';
};

window.renderVendorFilters = () => {
    const container = document.getElementById('vendorFilter');
    if (!container) return;

    const buttons = vendors.map(vendor => `<button class="filter-btn" onclick="filterProducts('${vendor.name.replace(/'/g, "\\'")}')">${vendor.name}</button>`).join('');
    container.innerHTML = `<button class="filter-btn active" onclick="filterProducts('all')">All Vendors</button>${buttons}`;
};

window.filterProducts = (vendor) => {
    currentFilter = vendor;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', (vendor === 'all' && btn.textContent === 'All Vendors') || btn.textContent === vendor);
    });
    renderProducts();
};

window.addToCart = (itemId, category) => {
    const item = menuItems[category]?.find(menuItem => menuItem.id === itemId);
    addCartItem(item);
};

window.addProductToCart = (productId) => {
    addCartItem(products.find(product => product.id === productId));
};

const addCartItem = (item) => {
    if (!item || item.stock <= 0) {
        showToast('Item out of stock!', 'error');
        return;
    }

    const existing = cart.find(cartItem => cartItem.id === item.id);
    const requestedQuantity = existing ? existing.quantity + 1 : 1;

    if (requestedQuantity > item.stock) {
        showToast('Maximum stock reached!', 'warning');
        return;
    }

    cart = existing
        ? cart.map(cartItem => cartItem.id === item.id ? { ...cartItem, quantity: requestedQuantity } : cartItem)
        : [...cart, { ...item, quantity: 1 }];

    setCart(cart);
    updateCart();
    showToast(`${item.name} added to cart!`);
};

window.updateCart = () => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const countEl = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');

    if (countEl) countEl.textContent = count;
    if (cartTotal) cartTotal.textContent = money(total);
    if (!cartItems || !cartFooter) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <h3>Your cart is empty</h3>
                <p>Add items from the menu to get started</p>
            </div>
        `;
        cartFooter.style.display = 'none';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">${item.icon || '2P'}</div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-vendor">${item.vendor}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span style="font-weight: 700;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
            </div>
            <div class="cart-item-price">${money(item.price * item.quantity)}</div>
        </div>
    `).join('');
    cartFooter.style.display = 'block';
};

window.updateQuantity = (itemId, change) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    const source = findProduct(itemId);
    if (!item || !source) return;

    const nextQuantity = item.quantity + change;
    if (nextQuantity <= 0) {
        cart = cart.filter(cartItem => cartItem.id !== itemId);
    } else if (nextQuantity > source.stock) {
        showToast('Maximum stock reached!', 'warning');
        return;
    } else {
        cart = cart.map(cartItem => cartItem.id === itemId ? { ...cartItem, quantity: nextQuantity } : cartItem);
    }

    setCart(cart);
    updateCart();
};

window.toggleCart = () => {
    document.getElementById('cartSidebar')?.classList.toggle('open');
};

window.checkout = () => {
    if (cart.length === 0) return;
    window.location.href = '/checkout.html';
};

window.openVendorModal = () => {
    if (session.user?.role === 'Vendor') {
        window.location.href = '/vendor-dashboard.html';
        return;
    }
    window.location.href = '/vendor-signup.html';
};

window.closeVendorModal = () => {
    document.getElementById('vendorModal')?.classList.remove('active');
};

window.registerVendor = (event) => {
    event.preventDefault();
    window.location.href = '/vendor-signup.html';
};

window.logout = () => {
    clearSession();
    if (socket) socket.disconnect();
    window.location.replace('/login.html');
};

window.showStockNotification = (itemName, stock) => {
    const notification = document.getElementById('stockNotification');
    const message = document.getElementById('stockMessage');
    if (!notification || !message) return;

    message.textContent = `${itemName}: ${stock}`;
    notification.classList.add('show');
    window.setTimeout(() => notification.classList.remove('show'), 3000);
};

window.showToast = (message, type = 'success') => {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
    const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107' };

    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.success}" style="color: ${colors[type] || colors.success}"></i>
        <span style="font-weight: 600;">${message}</span>
    `;

    container.appendChild(toast);
    window.setTimeout(() => {
        toast.style.animation = 'toastSlide 0.3s ease reverse';
        window.setTimeout(() => toast.remove(), 300);
    }, 3000);
};

document.addEventListener('DOMContentLoaded', async () => {
    renderRoleNavigation();

    try {
        await loadData();
    } catch (error) {
        vendors = [];
        products = [];
        menuItems = { food: [], drinks: [], water: [] };
        showToast('Unable to load Firestore data.', 'error');
    }

		renderMenu();

		renderVendors();

		renderProducts();

		renderVendorFilters();

		updateCart();

		syncSocket();

		updateLiveStock();

		socket.on(

		'products:updated',

		async ()=>{

		await loadData();

		renderMenu();

		renderVendors();

		renderProducts();

		renderVendorFilters();

		updateLiveStock();

		}

		);

    window.setTimeout(() => document.querySelector('.category-header')?.click(), 500);

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            document.getElementById('cartSidebar')?.classList.remove('open');
        }
    });

});
