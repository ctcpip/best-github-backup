export default class Semaphore {
  constructor(slots) {
    this.slots = slots;
    this.queue = [];
  }

  gimme() {
    return new Promise(resolve => {
      if (this.slots > 0) {
        this.slots -= 1;
        resolve();
      }
      else {
        this.queue.push(resolve);
      }
    });
  }

  bye() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    }
    else {
      this.slots += 1;
    }
  }
}
