/**
 * Utility functions for data formatting
 */

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

/**
 * Format number to USD currency string
 * @param {number} value 
 * @returns {string}
 */
export const formatCurrency = (value) => {
    return CURRENCY_FORMATTER.format((Number(value) || 0) / 100);
};

/**
 * Capitalize first letter of string
 * @param {string} str 
 * @returns {string}
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};
