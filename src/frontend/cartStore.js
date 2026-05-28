const CART_KEY = 'smartFoodCart';

export const getCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');

export const setCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearCart = () => {
    localStorage.removeItem(CART_KEY);
};
