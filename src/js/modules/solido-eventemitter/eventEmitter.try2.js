let isFunction = function(obj) {
    return typeof obj == 'function' || false;
};

const proto = {
  add() {
    this.test.push('a');
  },

  on(label, callback) {
    this.listeners.has(label) || this.listeners.set(label, []);
    this.listeners.get(label).push(callback);
    return this;
  },

  off(label, callback) {
    let labelListeners = this.listeners.get(label),
      index;
    
    if (labelListeners && labelListeners.length) {
      index = labelListeners.reduce((i, listener, index) => {
        return (isFunction(listener) && listener === callback) ?
          i = index :
          i;
      }, -1);
      
      if (index > -1) {
        labelListeners.splice(index, 1);
        this.listeners.set(label, labelListeners);
        return true;
      }
    }
    return false;
  },

  emit(label, ...args) {
    let labelListeners = this.listeners.get(label);

    let that = this;

    if (labelListeners && labelListeners.length) {
      labelListeners.forEach(function(listener) {
        (listener.bind(that))(...args);
      });
      return true;
    }
    return false;
  }
}

const eventEmitter = () => Object.assign(Object.create(proto), {
  listeners: new Map(),
  test: []
});

/*
const eventEmitter2 = () => {

  let listeners = new Map();

  return Object.assign({
    test: []
  }, {

  });

}
*/

export default eventEmitter();