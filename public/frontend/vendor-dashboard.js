import { api, connectSocket, getSession, logout, requireAuth } from './api.js';

requireAuth(['Vendor']);

const { user } = getSession();
const activeRole =
    localStorage.getItem(
        'activeRole'
    );

if (
    activeRole !== 'Vendor'
) {

    window.location.replace(
        '/role-selector.html'
    );

}
const page = {
    overview: document.getElementById('overview'),
    orders: document.getElementById('orders'),
    inventory: document.getElementById('inventory'),
    pos: document.getElementById('pos'),
    analytics: document.getElementById('analytics'),
    notifications: document.getElementById('notifications'),
    toast: document.getElementById('toastContainer')
};

const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;

const showToast = (message, type = 'success') => {
    if (!page.toast) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    page.toast.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
};

const showError = (target, error) => {
    if (target) {
        target.innerHTML = `<div class="empty-state"><h3>Unable to load data</h3><p>${error.message}</p></div>`;
    }
};

const safeList = (value) => Array.isArray(value) ? value : [];

const fetchDashboardData = async () => {
    const [dashboard, sales] = await Promise.all([
        api('/dashboard/vendor'),
        api('/pos/summary')
    ]);

    return {
        dashboard,
        sales,
        orders: safeList(dashboard.orders),
        inventory: safeList(dashboard.inventory)
    };
};

const renderOverview = (dashboard, sales) => {
    if (!page.overview) return;

    const inventoryCount = safeList(dashboard.inventory).length;
    const orders = safeList(dashboard.orders);
    const totalRevenue = sales.monthly.total || 0;

    page.overview.innerHTML = `
        <div class="stat-card"><span class="stat-value">${orders.length}</span><span class="stat-label">Total Orders</span></div>
        <div class="stat-card"><span class="stat-value">${money(totalRevenue)}</span><span class="stat-label">Total Revenue</span></div>
        <div class="stat-card"><span class="stat-value">${money(sales.daily.total)}</span><span class="stat-label">Daily Revenue</span></div>
        <div class="stat-card"><span class="stat-value">${money(sales.weekly.total)}</span><span class="stat-label">Weekly Revenue</span></div>
        <div class="stat-card"><span class="stat-value">${inventoryCount}</span><span class="stat-label">Inventory Count</span></div>
        <div class="stat-card"><span class="stat-value">${dashboard.overview.lowStockItems || 0}</span><span class="stat-label">Low Stock Alerts</span></div>
    `;
};

const renderOrders = (orders) => {
    if (!page.orders) return;

    const groups = ['pending', 'accepted', 'preparing', 'completed', 'cancelled'];

    page.orders.innerHTML = `
        <div class="section-header">
            <h3>Order Management</h3>
            <p>Accept, reject, and update customer order progress.</p>
        </div>
        <div class="status-summary">
            ${groups.map(status => `
                <div class="mini-card">
                    <strong>${orders.filter(order => order.status === status).length}</strong>
                    <span>${status}</span>
                </div>
            `).join('')}
        </div>
        <div class="table-wrap">
            <table class="table">
                <thead>
                    <tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            
							<td>
								<div class="order-code">
									#${order.id.slice(0, 8)}
								</div>

								<div class="order-products">
									${order.items?.length
										? order.items.map(item => `
											<div class="order-product-line">
												${item.quantity}x ${item.name}
											</div>
										`).join('')
										: 'No items'
									}
								</div>
							</td>
                            <td>${order.customerName || 'Customer'}</td>
                            <td><span class="status-pill">${order.status}</span></td>
                            <td>${money(order.total)}</td>
                            <td class="actions-cell">
                                <button class="filter-btn" data-order="${order.id}" data-status="accepted">Accept</button>
                                <button class="filter-btn" data-order="${order.id}" data-status="cancelled">Reject</button>
                                <button class="filter-btn" data-order="${order.id}" data-status="preparing">Preparing</button>
                                <button class="filter-btn" data-order="${order.id}" data-status="completed">Complete</button>
                            </td>
                        </tr>
                    `).join('') || '<tr><td colspan="5">No orders found.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;

    page.orders.querySelectorAll('[data-order]').forEach(button => {
        button.addEventListener('click', () => updateOrderStatus(button.dataset.order, button.dataset.status));
    });
};

const renderInventory = (inventory) => {
    if (!page.inventory) return;

    page.inventory.innerHTML = `
        <div class="section-header">
            <h3>Inventory Management</h3>
            <p>Add products, update stock, and remove unavailable items.</p>
        </div>
        <form id="productForm" class="form-grid">
            <div class="form-group"><label>Product Name</label><input name="name" required placeholder="Grilled chicken"></div>
            <div class="form-group"><label>Price</label><input type="number" name="price" min="0" required></div>
            <div class="form-group">
                <label>Category</label>
                <select name="category"><option value="food">Food</option><option value="drinks">Drinks</option><option value="water">Water</option></select>
            </div>
            <div class="form-group"><label>Stock</label><input type="number" name="stock" min="0" required></div>
            <div class="form-group"><label>Product Image</label><input type="file" name="imageFile" accept="image/*"></div>
            <button class="submit-btn" type="submit">Add Product</button>
        </form>
        <div class="inventory-grid">
            ${inventory.map(item => `
                <article class="product-card">
                    ${item.image ? `<img src="${item.image}" alt="${item.name || 'Product'}">` : '<div class="image-placeholder"><i class="fas fa-utensils"></i></div>'}
                    <input class="inline-input" id="name-${item.productId}" value="${item.name || ''}" placeholder="Product name">
                    <p>${money(item.price)}</p>

                    <div class="product-id">
                        ID: ${item.productId}
                    </div>
                    <span class="status-pill">${item.category || 'food'}</span>
                    <label class="stock-box">Stock <input id="stock-${item.productId}" value="${item.stock || 0}" type="number" min="0"></label>
                    <div class="actions">
                        <button class="filter-btn" data-edit="${item.productId}">Edit</button>
                        <button class="filter-btn" data-stock="${item.productId}">Save Stock</button>
                        <button class="filter-btn danger" data-delete="${item.productId}">Delete</button>
                    </div>
                </article>
            `).join('') || '<div class="empty-state"><h3>No products yet</h3><p>Add your first product above.</p></div>'}
        </div>
    `;

    document.getElementById('productForm')?.addEventListener('submit', addProduct);
    page.inventory.querySelectorAll('[data-edit]').forEach(button => {
        button.addEventListener('click', () => editProduct(button.dataset.edit));
    });
    page.inventory.querySelectorAll('[data-stock]').forEach(button => {
        button.addEventListener('click', () => updateStock(button.dataset.stock));
    });
    page.inventory.querySelectorAll('[data-delete]').forEach(button => {
        button.addEventListener('click', () => deleteProduct(button.dataset.delete));
    });
};

const renderPos = async (sales) => {
    if (!page.pos) return;

    page.pos.innerHTML = `
        <div class="section-header">
            <h3>POS & Sales</h3>
            <p>Record walk-in sales and view receipts.</p>
        </div>
        <div class="card-grid compact">
            <div class="stat-card"><span class="stat-value">${money(sales.daily.total)}</span><span class="stat-label">Daily Sales</span></div>
            <div class="stat-card"><span class="stat-value">${money(sales.weekly.total)}</span><span class="stat-label">Weekly Sales</span></div>
            <div class="stat-card"><span class="stat-value">${money(sales.monthly.total)}</span><span class="stat-label">Monthly Sales</span></div>
        </div>
        <form id="posForm" class="form-grid">
            <div class="form-group"><label>Product ID</label><input name="productId" required></div>
            <div class="form-group"><label>Product Name</label><input name="name" required></div>
            <div class="form-group"><label>Price</label><input type="number" name="price" min="0" required></div>
            <div class="form-group"><label>Quantity</label><input type="number" name="quantity" value="1" min="1" required></div>
            <button class="submit-btn" type="submit">Record Sale</button>
        </form>
        <div id="posHistory" class="table-wrap"></div>
    `;

    document.getElementById('posForm')?.addEventListener('submit', recordSale);
    await loadPosHistory();
};

const renderAnalytics = (orders, inventory, sales) => {
    if (!page.analytics) return;

    const itemCounts = new Map();
    orders.forEach(order => {
        safeList(order.items).forEach(item => {
            itemCounts.set(item.name, (itemCounts.get(item.name) || 0) + Number(item.quantity || 0));
        });
    });

    const topProducts = [...itemCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    page.analytics.innerHTML = `
        <div class="section-header">
            <h3>Analytics</h3>
            <p>Simple sales and product performance summary.</p>
        </div>
        <div class="card-grid compact">
            <div class="stat-card"><span class="stat-value">${money(sales.daily.total)}</span><span class="stat-label">Daily Revenue</span></div>
            <div class="stat-card"><span class="stat-value">${money(sales.weekly.total)}</span><span class="stat-label">Weekly Revenue</span></div>
            <div class="stat-card"><span class="stat-value">${money(sales.monthly.total)}</span><span class="stat-label">Monthly Revenue</span></div>
        </div>
        <div class="chart-bars">

            <div class="chart-item">
                <div
                    class="chart-bar"
                    style="height:${Math.max(120, sales.daily.total / 10)}px"
                >
                    <span class="chart-price">
                        ${money(sales.daily.total)}
                    </span>
                </div>

                <span class="chart-label">
                    Daily
                </span>
            </div>

            <div class="chart-item">
                <div
                    class="chart-bar"
                    style="height:${Math.max(120, sales.weekly.total / 10)}px"
                >
                    <span class="chart-price">
                        ${money(sales.weekly.total)}
                    </span>
                </div>

                <span class="chart-label">
                    Weekly
                </span>
            </div>

            <div class="chart-item">
                <div
                    class="chart-bar"
                    style="height:${Math.max(120, sales.monthly.total / 10)}px"
                >
                    <span class="chart-price">
                        ${money(sales.monthly.total)}
                    </span>
                </div>

                <span class="chart-label">
                    Monthly
                </span>
            </div>

        </div>
        <h4>Top Products</h4>
        <ul class="clean-list">
            ${topProducts.map(([name, count]) => `<li><span>${name}</span><strong>${count} sold</strong></li>`).join('') || '<li>No product sales yet.</li>'}
        </ul>
        <h4>Low Stock Items</h4>
        <ul class="clean-list">
            ${inventory.filter(item => Number(item.stock || 0) <= Number(item.threshold || 5)).map(item => `<li><span>${item.name || item.productId}</span><strong>${item.stock || 0} left</strong></li>`).join('') || '<li>No low stock items.</li>'}
        </ul>
    `;
};

const renderNotifications = () => {
    if (!page.notifications) return;
    page.notifications.innerHTML = '<h3>Notifications</h3><p>No notifications yet.</p>';
};

const updateOrderStatus = async (orderId, status) => {
    await api(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
    });
    showToast(`Order updated to ${status}.`);
    await loadDashboard();
};

const updateStock = async (productId) => {
    const stock = Number(document.getElementById(`stock-${productId}`)?.value || 0);
    await api(`/inventory/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stock, vendorId: user.vendorId })
    });
    showToast('Stock updated.');
    await loadDashboard();
};

const editProduct = async (productId) => {
    const name = document.getElementById(`name-${productId}`)?.value.trim();
    if (!name) {
        showToast('Product name is required.', 'error');
        return;
    }

    await api(`/vendors/${user.vendorId}/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
    });
    showToast('Product updated.');
    await loadDashboard();
};

const deleteProduct = async (productId) => {
    await api(`/vendors/${user.vendorId}/products/${productId}`, { method: 'DELETE' });
    showToast('Product deleted.');
    await loadDashboard();
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    if (!file || !file.size) {
        resolve('');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

const addProduct = async (event) => {
    event.preventDefault();

    const formElement = event.currentTarget;

    const form = new FormData(formElement);

    const image = await fileToDataUrl(
        form.get('imageFile')
    );

    await api(`/vendors/${user.vendorId}/products`, {
        method: 'POST',
        body: JSON.stringify({
            name: form.get('name'),
            price: Number(form.get('price')),
            category: form.get('category'),
            image,
            stock: Number(form.get('stock'))
        })
    });

    formElement.reset();

    showToast('Product added.');

    await loadDashboard();
};

const recordSale = async (event) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const sale = await api('/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
            vendorId: user.vendorId,
            paymentMethod: 'cash',
            items: [{
                productId: form.get('productId'),
                name: form.get('name'),
                price: Number(form.get('price')),
                quantity: Number(form.get('quantity'))
            }]
        })
    });

    event.currentTarget.reset();
    showToast(`POS sale recorded. Receipt ${sale.receiptNumber}.`);
    await loadDashboard();
};

const loadPosHistory = async () => {
    const history = document.getElementById('posHistory');
    if (!history) return;

    const rows = await api('/pos/sales');
    history.innerHTML = `
        <h4>Transaction History</h4>
        <table class="table">
            <thead><tr><th>Transaction</th><th>Receipt</th><th>Amount</th><th>Date</th></tr></thead>
            <tbody>
                ${safeList(rows).map(row => `
                    <tr><td>${row.transactionId}</td><td>${row.receiptNumber}</td><td>${money(row.amount)}</td><td>${new Date(row.createdAt).toLocaleString()}</td></tr>
                `).join('') || '<tr><td colspan="4">No transactions found.</td></tr>'}
            </tbody>
        </table>
    `;
};

const loadDashboard = async () => {
    const { dashboard, sales, orders, inventory } = await fetchDashboardData();

    renderOverview(dashboard, sales);
    renderOrders(orders);
    renderInventory(inventory);
    await renderPos(sales);
    renderAnalytics(orders, inventory, sales);
    renderNotifications();
};

const socket = connectSocket();
if (socket) {
    socket.on('connect', () => socket.emit('vendor:join', { vendorId: user.vendorId }));
    socket.on('vendor:new-order', order => {
        if (page.notifications) {
            page.notifications.innerHTML = `<p>New order: ${order.id}</p>` + page.notifications.innerHTML;
        }
        loadDashboard();
    });
    socket.on('vendor:low-stock', item => {
        if (page.notifications) {
            page.notifications.innerHTML = `<p>Low stock: ${item.name || item.productId}</p>` + page.notifications.innerHTML;
        }
    });
    socket.on('vendor:order-status', order => {
        if (page.notifications) {
            page.notifications.innerHTML = `<p>Order update: ${order.id} ${order.status}</p>` + page.notifications.innerHTML;
        }
    });
    socket.on('inventory:updated', () => loadDashboard());
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});

try {
    await loadDashboard();
} catch (error) {
    [page.overview, page.orders, page.inventory, page.pos, page.analytics].forEach(target => showError(target, error));
}
