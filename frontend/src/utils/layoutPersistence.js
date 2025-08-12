/**
 * Utility functions for managing layout preferences in localStorage
 */

// Constants for localStorage keys
export const LAYOUT_KEYS = {
  PRODUCTS_STOCK_PAGE: 'productsStockPageViewMode',
  STOCK_PAGE: 'stockPageViewMode'
};

// Default values for different layouts
export const DEFAULT_LAYOUTS = {
  PRODUCTS_STOCK_PAGE: 'grid',
  STOCK_PAGE: 'grouped'
};

/**
 * Save layout preference to localStorage
 * @param {string} key - The localStorage key
 * @param {string} value - The layout mode value
 */
export const saveLayoutPreference = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to save layout preference:', error);
  }
};

/**
 * Load layout preference from localStorage
 * @param {string} key - The localStorage key
 * @param {string} defaultValue - Default value if not found
 * @returns {string} The saved layout preference or default value
 */
export const loadLayoutPreference = (key, defaultValue = 'grid') => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.warn('Failed to load layout preference:', error);
    return defaultValue;
  }
};

/**
 * Clear all layout preferences
 */
export const clearLayoutPreferences = () => {
  try {
    Object.values(LAYOUT_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to clear layout preferences:', error);
  }
};

/**
 * Get all current layout preferences
 * @returns {Object} Object containing all layout preferences
 */
export const getAllLayoutPreferences = () => {
  const preferences = {};
  Object.entries(LAYOUT_KEYS).forEach(([name, key]) => {
    preferences[name] = loadLayoutPreference(key, DEFAULT_LAYOUTS[name]);
  });
  return preferences;
};
