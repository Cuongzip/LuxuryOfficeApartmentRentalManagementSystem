/**
 * Generates a unique 10-character ID with a given prefix.
 * Useful for tables with VarChar(10) IDs like KhachHang (KH...), TaiKhoan (TK...), etc.
 * 
 * @param {string} prefix - The 2-character prefix (e.g. 'KH', 'TK')
 * @returns {string} The 10-character unique ID
 */
const generateId = (prefix) => {
  const timestamp = Date.now().toString(36).slice(-5);
  const random = Math.random().toString(36).substring(2, 5);
  return (prefix + timestamp + random).substring(0, 10).toUpperCase();
};

export default generateId;
