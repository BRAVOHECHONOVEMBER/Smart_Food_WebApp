export const MOCK_VENDORS = [
    {
        id: 'vendor-charcoal-master',
        name: 'The Charcoal Master',
        description: 'Premium wood-fired steaks, ribs, and smoked sides from 2P Grill.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        status: 'open',
        deliveryTime: '25-35 min',
        location: 'Main Kitchen',
        lowStockThreshold: 5
    },
    {
        id: 'vendor-smoke-spice',
        name: 'Smoke & Spice',
        description: 'Southern-style grilled chicken, brisket burgers, and bold sauces.',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        status: 'open',
        deliveryTime: '30-40 min',
        location: 'Campus Outlet',
        lowStockThreshold: 6
    },
    {
        id: 'vendor-ocean-grill',
        name: 'Ocean Grill',
        description: 'Fresh seafood grill plates, skewers, and crisp sides.',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        status: 'busy',
        deliveryTime: '40-50 min',
        location: 'Annex Stand',
        lowStockThreshold: 4
    }
];

export const MOCK_PRODUCTS = [
    {
        id: 'prod-tbone',
        vendorId: 'vendor-charcoal-master',
        name: 'Signature T-Bone Steak',
        price: 24990,
        category: 'Grill',
        description: 'Dry-aged steak finished with garlic butter and charred pepper sauce.'
    },
    {
        id: 'prod-ribs',
        vendorId: 'vendor-charcoal-master',
        name: 'Smoked Pork Ribs',
        price: 18500,
        category: 'Grill',
        description: 'Hickory-smoked ribs glazed with 2P Grill barbecue sauce.'
    },
    {
        id: 'prod-loaded-salad',
        vendorId: 'vendor-charcoal-master',
        name: 'Loaded Grill Salad',
        price: 12000,
        category: 'Sides',
        description: 'Greens, grilled corn, avocado, tomatoes, and citrus dressing.'
    },
    {
        id: 'prod-jerk-chicken',
        vendorId: 'vendor-smoke-spice',
        name: 'Jerk Chicken Platter',
        price: 16000,
        category: 'Grill',
        description: 'Char-grilled chicken with spicy jerk marinade and plantain chips.'
    },
    {
        id: 'prod-brisket-burger',
        vendorId: 'vendor-smoke-spice',
        name: 'Brisket Burger',
        price: 14500,
        category: 'Burgers',
        description: 'Smoked brisket patty, slaw, pickles, and house aioli.'
    },
    {
        id: 'prod-cornbread',
        vendorId: 'vendor-smoke-spice',
        name: 'Cornbread Muffins',
        price: 6000,
        category: 'Sides',
        description: 'Warm buttery muffins served with honey butter.'
    },
    {
        id: 'prod-sea-bass',
        vendorId: 'vendor-ocean-grill',
        name: 'Grilled Sea Bass',
        price: 22000,
        category: 'Seafood',
        description: 'Lemon-herb sea bass with roasted vegetables.'
    },
    {
        id: 'prod-prawn-skewers',
        vendorId: 'vendor-ocean-grill',
        name: 'Giant Prawn Skewers',
        price: 19000,
        category: 'Seafood',
        description: 'Garlic chili butter prawns over jollof rice.'
    },
    {
        id: 'prod-sweet-potato',
        vendorId: 'vendor-ocean-grill',
        name: 'Sweet Potato Wedges',
        price: 5500,
        category: 'Sides',
        description: 'Crisp wedges dusted with smoked paprika.'
    }
];

export const MOCK_INVENTORY = [
    { productId: 'prod-tbone', vendorId: 'vendor-charcoal-master', stock: 8, reserved: 0, threshold: 4 },
    { productId: 'prod-ribs', vendorId: 'vendor-charcoal-master', stock: 5, reserved: 0, threshold: 4 },
    { productId: 'prod-loaded-salad', vendorId: 'vendor-charcoal-master', stock: 16, reserved: 0, threshold: 5 },
    { productId: 'prod-jerk-chicken', vendorId: 'vendor-smoke-spice', stock: 11, reserved: 0, threshold: 5 },
    { productId: 'prod-brisket-burger', vendorId: 'vendor-smoke-spice', stock: 7, reserved: 0, threshold: 4 },
    { productId: 'prod-cornbread', vendorId: 'vendor-smoke-spice', stock: 0, reserved: 0, threshold: 6 },
    { productId: 'prod-sea-bass', vendorId: 'vendor-ocean-grill', stock: 4, reserved: 0, threshold: 3 },
    { productId: 'prod-prawn-skewers', vendorId: 'vendor-ocean-grill', stock: 2, reserved: 0, threshold: 3 },
    { productId: 'prod-sweet-potato', vendorId: 'vendor-ocean-grill', stock: 12, reserved: 0, threshold: 5 }
];

export const MOCK_ORDERS = [
    {
        id: 'ord-1001',
        vendorId: 'vendor-charcoal-master',
        customerName: 'Ada Johnson',
        status: 'completed',
        total: 43490,
        createdAt: '2026-05-25T14:20:00.000Z',
        items: [
            { productId: 'prod-tbone', name: 'Signature T-Bone Steak', quantity: 1, price: 24990 },
            { productId: 'prod-ribs', name: 'Smoked Pork Ribs', quantity: 1, price: 18500 }
        ]
    }
];

export const MOCK_TRANSACTIONS = [
    {
        id: 'txn-2pg-0001',
        vendorId: 'vendor-charcoal-master',
        source: 'POS',
        amount: 18500,
        createdAt: '2026-05-26T11:18:00.000Z',
        receiptNumber: 'RCP-0001'
    }
];

const inventoryByProduct = new Map(MOCK_INVENTORY.map(item => [item.productId, item]));

export const seedVendorsWithMenus = () => MOCK_VENDORS.map(vendor => ({
    ...vendor,
    menu: MOCK_PRODUCTS
        .filter(product => product.vendorId === vendor.id)
        .map(product => ({
            ...product,
            stock: inventoryByProduct.get(product.id)?.stock ?? 0,
            threshold: inventoryByProduct.get(product.id)?.threshold ?? vendor.lowStockThreshold
        }))
}));

export const MOCK_SEED = {
    vendors: seedVendorsWithMenus(),
    products: MOCK_PRODUCTS,
    inventory: MOCK_INVENTORY,
    orders: MOCK_ORDERS,
    transactions: MOCK_TRANSACTIONS
};
