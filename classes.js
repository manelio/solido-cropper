// export class function

export default function Emitter(el) {
  
  if (!(this instanceof Input)) {
    return new Emitter(el);
  }

  this.el = el;
  this.events = [];
}

Emitter.prototype.on = function(name, handler) {
  this.events[name] = handler;
}


// export factory function

cost factory = function(el) {

  function Emitter(el) {
    
    if (!(this instanceof Input)) {
      return new Emitter(el);
    }

    this.el = el;
    this.events = [];
  }

  Emitter.prototype.on = function(name, handler) {
    this.events[name] = handler;
  }

  return Emitter(el);

}

export default factory;