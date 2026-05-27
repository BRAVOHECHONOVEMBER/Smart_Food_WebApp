import { subscribe, actions } from './services/state.js';
import { seedVendorsWithMenus } from './services/mockData.js';
import { Vendors } from './components/Vendors.js';
import { Menu } from './components/Menu.js';
import { Cart } from './components/Cart.js';
import { UI } from './components/UI.js';

class App {
    constructor() {
        this.init();
    }

    init() {
        console.log('2P Grill initializing...');

        UI.setupGlobalEvents();

        subscribe((state) => {
            Vendors.render(state.vendors);

            if (state.selectedVendor) {
                Menu.render();
            }

            Cart.render(state.cart, state.isCartOpen);
        });

        actions.setVendors(seedVendorsWithMenus());
    }
}

new App();
