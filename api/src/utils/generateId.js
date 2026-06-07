
const generateId = (prefix) => {
  const timestamp = Date.now().toString(36).slice(-5);
  const random = Math.random().toString(36).substring(2, 5);
  return (prefix + timestamp + random).substring(0, 10).toUpperCase();
};

export default generateId;
