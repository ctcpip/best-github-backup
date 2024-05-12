export default (function stats() {
  const _stats = {};

  function clone() {
    _stats['gitRepoCloned'] = (_stats['gitRepoCloned'] || 0) + 1;
  }

  function create(type) {
    _stats[`${type}Created`] = (_stats[`${type}Created`] || 0) + 1;
  }

  function update(type) {
    _stats[`${type}Updated`] = (_stats[`${type}Updated`] || 0) + 1;
  }

  function print() {
    const sb = [];
    for (const [k, v] of Object.entries(_stats)) {
      const keyParts = k.split(/(?=[A-Z])/);
      const operation = keyParts[keyParts.length - 1];
      const type = keyParts
        .slice(0, keyParts.length - 1)
        .map(str => str.toLowerCase())
        .join(' ');

      sb.push(`${type}s ${operation.toLowerCase()}: ${v}`);
    }

    return sb.length > 0 ? sb.join('\n') : 'there were no updates; everything is already up-to-date!';
  }

  function any() {
    return Object.keys(_stats).length > 0;
  }

  return {
    any,
    clone,
    create,
    print,
    update,
  };
})();
