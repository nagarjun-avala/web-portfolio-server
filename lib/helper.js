const parseId = (id) => {
  const num = parseInt(id, 10);
  return isNaN(num) ? id : num; // Returns number if valid integer, else string
};

module.exports = { parseId };
