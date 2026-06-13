/**
 * Format helper utilities
 */

/**
 * Format currency to VND (e.g. 15,000,000 ₫)
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Format Date to standard Vietnamese display format (dd/MM/yyyy)
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (e) {
    return '-';
  }
};

/**
 * Format Date to ISO string format for input value (yyyy-MM-dd)
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDateInput = (dateVal) => {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};
