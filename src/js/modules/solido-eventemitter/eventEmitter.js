let isFunction = function(obj) {
    return typeof obj == 'function' || false;
};

const eventEmitter = () => {

  let listeners = new Map();
  
  return Object.assign({}, {
    
    on: function(label, callback) {
      listeners.has(label) || listeners.set(label, []);
      listeners.get(label).push(callback);
      return this;
    },
  
    off: function(label, callback) {
      let labelListeners = listeners.get(label),
        index;
      
      if (labelListeners && labelListeners.length) {
        index = labelListeners.reduce((i, listener, index) => {
          return (isFunction(listener) && listener === callback) ?
            i = index :
            i;
        }, -1);
        
        if (index > -1) {
          labelListeners.splice(index, 1);
          listeners.set(label, labelListeners);
          return true;
        }
      }
      return false;
    },

    emit: function(label, ...args) {
      let labelListeners = listeners.get(label);

      let that = this;

      if (labelListeners && labelListeners.length) {
        labelListeners.forEach(function(listener) {
          (listener.bind(that))(...args);
        });
        return true;
      }
      return false;
    }
  });

}

export default eventEmitter;

/*
export default (function(){
    var list = [];
    
    return {
      on: function() {},
      add: function() { list.push('x'); },
      get: function() { return list; }
    }
 })();
 */