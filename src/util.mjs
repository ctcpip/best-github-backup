function log(txt) {
  console.log(`${(new Date()).toISOString().replace('T', ' ').replace(/\.\d+Z/, '')} - ${txt}`);
}

export { log };
