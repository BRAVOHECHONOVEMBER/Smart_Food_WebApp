import { api, connectSocket, getSession, logout, requireAuth } from './api.js';
import {
getStorage,
ref,
uploadBytes,
getDownloadURL

} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
const { user } = requireAuth(['Vendor']);
const session = getSession();

const overview = document.getElementById('overview');
const ordersPanel = document.getElementById('orders');
const inventoryPanel = document.getElementById('inventory');
const posPanel = document.getElementById('pos');
const analyticsPanel = document.getElementById('analytics');
const notificationsPanel = document.getElementById('notifications');
const money = (amount) => `NGN ${Number(amount || 0).toLocaleString()}`;

const toast = (message) => {
    const container = document.getElementById('toastContainer');
    const node = document.createElement('div');
    node.className = 'toast';
    node.textContent = message;
    container.appendChild(node);
    setTimeout(() => node.remove(), 3000);
};

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    logout();
    window.location.replace('/login.html');
});

const renderOverview = (data, sales) => {
    overview.innerHTML = `
        <div class="vendor-card"><div class="stat-value">${data.overview.totalOrders || data.overview.openOrders || 0}</div><div class="stat-label">Total Orders</div></div>
        <div class="vendor-card"><div class="stat-value">${money(data.overview.totalRevenue || sales.monthly.total || 0)}</div><div class="stat-label">Total Revenue</div></div>
        <div class="vendor-card"><div class="stat-value">${money(sales.daily.total || 0)}</div><div class="stat-label">Daily Revenue</div></div>
        <div class="vendor-card"><div class="stat-value">${money(sales.weekly.total || 0)}</div><div class="stat-label">Weekly Revenue</div></div>
        <div class="vendor-card"><div class="stat-value">${data.inventory?.length || 0}</div><div class="stat-label">Inventory Count</div></div>
        <div class="vendor-card"><div class="stat-value">${data.overview.lowStockItems || 0}</div><div class="stat-label">Low Stock Alerts</div></div>
    `;
};

const renderOrders = (orders = []) => {
    ordersPanel.innerHTML = `
        <h3>Orders</h3>
        <table class="table">
            <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Actions</th></tr></thead>
            <tbody>
                ${orders.map(order => `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.status}</td>
                        <td>${money(order.total)}</td>
                        <td>
                            <button class="filter-btn" onclick="updateOrderStatus('${order.id}', 'accepted')">Accept</button>
                            <button class="filter-btn" onclick="updateOrderStatus('${order.id}', 'cancelled')">Reject</button>
                            <button class="filter-btn" onclick="updateOrderStatus('${order.id}', 'preparing')">Preparing</button>
                            <button class="filter-btn" onclick="updateOrderStatus('${order.id}', 'completed')">Completed</button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="4">No orders found.</td></tr>'}
            </tbody>
        </table>
    `;
};

const renderInventory = (inventory = []) => {
    inventoryPanel.innerHTML = `
    <div class="dashboard-section">

        <div class="section-header">
            <h3>📦 Inventory Management</h3>
        </div>

        <form id="productForm" class="inventory-form">

            <div class="form-group">
                <label>Product Name</label>
                <input name="name" placeholder="Burger..." required>
            </div>

            <div class="form-group">
                <label>Price</label>
                <input type="number" name="price" min="0" required>
            </div>

            <div class="form-group">
                <label>Category</label>

                <select name="category">

                    <option>Food</option>
                    <option>Drinks</option>
                    <option>Water</option>

                </select>
            </div>

            <div class="form-group">
                <label>Stock</label>
                <input type="number" name="stock" min="0" required>
            </div>

            <div class="form-group">
                <label>Upload Product Image</label>
                <input
                    type="file"
                    name="imageFile"
                    accept="image/*">
            </div>

            <button
              class="submit-btn"
              type="submit">

              Add Product

            </button>

        </form>

        <div class="inventory-grid">

        ${inventory.length ?

        inventory.map(item=>`

        <div class="product-card">

            <img
            src="${item.image || '/images/default-food.png'}"
            alt="${item.name}">

            <h4>${item.name || "Unnamed Product"}</h4>

            <p>${money(item.price)}</p>

            <span>

            ${item.category || "Food"}

            </span>

            <div class="stock-box">

            Stock:
            <input
            id="stock-${item.productId}"
            value="${item.stock}"
            type="number">

            </div>

            <div class="actions">

            <button
            onclick="editProduct('${item.productId}')">

            Edit

            </button>

            <button
            onclick="updateStock('${item.productId}')">

            Save

            </button>

            <button
            onclick="deleteProduct('${item.productId}')">

            Delete

            </button>

            </div>

        </div>

        `).join("")

        :

        `

        <div class="empty-state">

        📦

        <h3>No products yet</h3>

        <p>

        Add your first product

        </p>

        </div>

        `

        }

        </div>

    </div>
`;

document
.getElementById('productForm')
?.addEventListener(
'submit',
addProduct
);

};


const renderPos = (sales) => {
    posPanel.innerHTML = `
        <h3>POS</h3>
        <p>Daily Sales: ${money(sales.daily.total)} | Weekly Sales: ${money(sales.weekly.total)} | Monthly Sales: ${money(sales.monthly.total)}</p>
        <form id="posForm" class="form-grid">
            <div class="form-group"><label>Product ID</label><input name="productId" required></div>
            <div class="form-group"><label>Name</label><input name="name" required></div>
            <div class="form-group"><label>Price</label><input type="number" name="price" required></div>
            <div class="form-group"><label>Quantity</label><input type="number" name="quantity" value="1" min="1" required></div>
            <button class="submit-btn" type="submit">Record POS Sale</button>
        </form>
        <div id="posHistory"></div>
    `;

    document.getElementById('posForm')?.addEventListener('submit', recordSale);
    loadPosHistory();
};

const renderAnalytics = (data, sales) => {
    analyticsPanel.innerHTML = `
        <h3>Analytics</h3>
        <div class="card-grid">
            <div class="vendor-card"><div class="stat-value">${money(sales.daily.total)}</div><div class="stat-label">Daily</div></div>
            <div class="vendor-card"><div class="stat-value">${money(sales.weekly.total)}</div><div class="stat-label">Weekly</div></div>
            <div class="vendor-card"><div class="stat-value">${money(sales.monthly.total)}</div><div class="stat-label">Monthly</div></div>
        </div>
        <p>Top products and revenue trends use the transactions returned by Firestore.</p>
    `;
};

window.updateOrderStatus = async (orderId, status) => {
    await api(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(`Order ${orderId} updated to ${status}.`);
    await loadDashboard();
};

window.updateStock = async (productId) => {
    const stock = Number(document.getElementById(`stock-${productId}`).value);
    await api(`/inventory/${productId}`, { method: 'PATCH', body: JSON.stringify({ stock, vendorId: session.user.vendorId }) });
    toast('Stock updated.');
    await loadDashboard();
};

window.deleteProduct = async (productId) => {
    await api(`/vendors/${session.user.vendorId}/products/${productId}`, { method: 'DELETE' });
    toast('Product deleted.');
    await loadDashboard();
};

window.editProduct = async (productId) => {
    const name = document.getElementById(`name-${productId}`)?.value;
    if (!name) {
        toast('Product name is required.');
        return;
    }

    await api(`/vendors/${session.user.vendorId}/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name })
    });
    toast('Product updated.');
    await loadDashboard();
};

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    if (!file) {
        resolve('');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});



const storage =
getStorage();


const addProduct =
async(event)=>{

event.preventDefault();

try{

const form=
new FormData(
event.currentTarget
);

const imageFile=
form.get(
'imageFile'
);

let uploadedImage='';


if(
imageFile &&
imageFile.size
){

const imageRef=
ref(

storage,

`products/${
Date.now()
}-${imageFile.name}`

);

await uploadBytes(

imageRef,

imageFile

);

uploadedImage=
await getDownloadURL(
imageRef
);

}


await api(

`/vendors/${
session.user.vendorId
}/products`,

{

method:'POST',

body:JSON.stringify({

name:
form.get(
'name'
),

price:Number(

form.get(
'price'
)

),

category:
form.get(
'category'
),

image:
uploadedImage,

stock:Number(

form.get(
'stock'
)

)

})

}

);

toast(
'Product added successfully'
);

event.currentTarget.reset();

await loadDashboard();

}
catch(err){

toast(
err.message
);

}

};

const recordSale = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const sale = await api('/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
            vendorId: session.user.vendorId,
            paymentMethod: 'cash',
            items: [{
                productId: form.get('productId'),
                name: form.get('name'),
                price: Number(form.get('price')),
                quantity: Number(form.get('quantity'))
            }]
        })
    });
    toast(`POS receipt ${sale.receiptNumber}`);
    await loadDashboard();
};

const loadPosHistory = async () => {
    const rows = await api('/pos/sales');
    document.getElementById('posHistory').innerHTML = `
        <h4>Transaction History</h4>
        <table class="table"><tbody>
            ${rows.map(row => `<tr><td>${row.transactionId}</td><td>${row.receiptNumber}</td><td>${money(row.amount)}</td><td>${row.createdAt}</td></tr>`).join('') || '<tr><td>No transactions found.</td></tr>'}
        </tbody></table>
    `;
};

const loadDashboard = async () => {
    const [data, sales] = await Promise.all([
        api('/dashboard/vendor'),
        api('/pos/summary')
    ]);

    renderOverview(data, sales);
    renderOrders(data.orders || []);
    renderInventory(data.inventory || []);
    renderPos(sales);
    renderAnalytics(data, sales);
};

const socket = connectSocket();
if (socket) {
    socket.on('connect', () => socket.emit('vendor:join', { vendorId: session.user.vendorId }));
    socket.on('vendor:new-order', order => {
        notificationsPanel.innerHTML = `<p>New order: ${order.id}</p>` + notificationsPanel.innerHTML;
        loadDashboard();
    });
    socket.on('vendor:low-stock', item => {
        notificationsPanel.innerHTML = `<p>Low stock: ${item.name || item.productId}</p>` + notificationsPanel.innerHTML;
    });
    socket.on('vendor:order-status', order => {
        notificationsPanel.innerHTML = `<p>Order update: ${order.id} ${order.status}</p>` + notificationsPanel.innerHTML;
    });
}

notificationsPanel.innerHTML = '<h3>Notifications</h3><p>No notifications yet.</p>';

try {
    await loadDashboard();
} catch (error) {
    overview.innerHTML = `<div class="vendor-card">${error.message}</div>`;
}
