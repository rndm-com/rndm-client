const isRNDMPlugin = (node = '') => (
  node.startsWith('@rndm/render-plugin')
);

module.exports = isRNDMPlugin;
