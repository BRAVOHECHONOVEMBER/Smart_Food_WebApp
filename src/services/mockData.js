/**
 * Mock Data representing our vendors and their menus
 */

export const MOCK_VENDORS = [
    {
        id: 'v1',
        name: 'The Charcoal Master',
        description: 'Authentic wood-fired steaks and signature ribs.',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
        rating: 4.9,
        menu: [
            { id: 'p1', name: 'Signature T-Bone Steak', price: 24.99, category: 'Grill', description: 'Dry-aged for 21 days with garlic butter.' },
            { id: 'p2', name: 'Smoked Pork Ribs', price: 18.50, category: 'Grill', description: 'Falling off the bone with hickory sauce.' },
            { id: 'p3', name: 'Loaded Grill Salad', price: 12.00, category: 'Sides', description: 'Fresh greens with grilled corn and avocado.' }
        ]
    },
    {
        id: 'v2',
        name: 'Smoke & Spice',
        description: 'Bold flavors from the Southern coast.',
        image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800',
        rating: 4.7,
        menu: [
            { id: 'p4', name: 'Jerk Chicken Platter', price: 16.00, category: 'Grill', description: 'Hot & spicy Caribbean marinade.' },
            { id: 'p5', name: 'Brisket Burger', price: 14.50, category: 'Burgers', description: 'Slow-smoked brisket patty with slaw.' },
            { id: 'p6', name: 'Cornbread Muffins', price: 6.00, category: 'Sides', description: 'Sweet and buttery home-style muffins.' }
        ]
    },
    {
        id: 'v3',
        name: 'Ocean Grill',
        description: 'Freshly caught seafood grilled to perfection.',
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800',
        rating: 4.8,
        menu: [
            { id: 'p7', name: 'Grilled Sea Bass', price: 22.00, category: 'Seafood', description: 'Lemon zest and Mediterranean herbs.' },
            { id: 'p8', name: 'Giant Prawn Skewers', price: 19.00, category: 'Seafood', description: 'Garlic chili butter glazed.' },
            { id: 'p9', name: 'Sweet Potato Wedges', price: 5.50, category: 'Sides', description: 'Seasoned with smoked paprika.' }
        ]
    }
];
