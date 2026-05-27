/**
 * Application Entry Point
 * Orchestrates the bootstrapping and state subscription
 */

import { subscribe, actions } from './services/state.js';
import { MOCK_VENDORS } from './services/mockData.js';
import { Vendors } from './components/Vendors.js';
import { Menu } from './components/Menu.js';
import { Cart } from './components/Cart.js';
import { UI } from './components/UI.js';

class App {
    constructor() {
        this.init();
    }

    init() {
        console.log('🔥 2P Grill Phase 1 Initializing...');

        // 1. Setup UI Static Events
        UI.setupGlobalEvents();

        // 2. Subscribe to State Changes
        subscribe((state) => {
            // Render Vendors list
            Vendors.render(state.vendors);

            // Render Menu (if vendor is selected)
            if (state.selectedVendor) {
                Menu.render(state.menu);
            }

            // Render Cart sidebar and badge
            Cart.render(state.cart, state.isCartOpen);
        });

        // 3. Load initial data
        actions.setVendors(MOCK_VENDORS);
    }
}

// Start the app
new App();
