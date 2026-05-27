# 2P Grill - Phase 1 Refactor

A premium, modular food ordering application built with modern Vanilla JavaScript. This project focuses on high-performance reactive state management and a sophisticated Glassmorphism UI.

## Features
- **Reactive State**: Custom Proxy-based state manager (no Redux/Vuex needed).
- **Glassmorphism UI**: High-end aesthetic using CSS backdrop filters and dynamic layouts.
- **Modular Components**: Separation of concerns between Logic, UI, and State.
- **Dynamic Menu**: Context-aware vendor and menu switching.
- **Real-time Cart**: Instant updates across the UI when items are added or modified.

## Prerequisites
- **Node.js** (v14 or higher)
- A modern web browser with **ES Modules** support.

## Installation

1. Clone or download the source code.
2. Navigate to the project directory:
    cd 2p-grill-refactor
3. Install the lightweight development server:
    npm install

## How to Run

### Option 1: Using npm (Recommended)
Run the following command to start a local development server:
    npm start

The application will be available at `http://localhost:3000` (or the port specified in your console).

### Option 2: Using Docker
If you have Docker installed, you can build and run the container:
    docker build -t 2p-grill .
    docker run -p 3000:3000 2p-grill

## Project Structure
- `src/app.js`: Entry point that initializes state and components.
- `src/services/state.js`: The heart of the app—manages data using JS Proxies.
- `src/services/mockData.js`: Centralized data store for vendors and products.
- `src/components/`: Pure UI components that render based on state.
- `public/styles/main.css`: Design system and layout logic.

## Usage
1. **Browse Vendors**: Choose a "Grill Master" from the landing page.
2. **Add Items**: Browse the menu and add items to your cart. You will see a toast notification for feedback.
3. **Manage Cart**: Click the cart icon to adjust quantities or remove items.
4. **Responsive**: The layout adjusts for mobile and desktop screens automatically.

## Troubleshooting
- **ES Module Error**: If you open `index.html` directly from your file system (`file://`), the browser will block imports due to CORS. Ensure you run the app using `npm start` or any local server.
- **Icons not showing**: The app uses FontAwesome CDN. Ensure you have an active internet connection.
