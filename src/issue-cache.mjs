export default (function issueCache() {
  let _issues;

  function load(issues) {
    if (_issues) {
      throw new Error('cache is already loaded');
    }
    _issues = issues;
  }

  function get() {
    return _issues;
  }

  function push(items) {
    _issues.push(items);
  }

  return {
    get,
    load,
    push,
  };
})();
