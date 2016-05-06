export default class uDOM {

  _rAF = null;
  
  static isElement(obj) {
    try {
      // Using W3 DOM2 (works for FF, Opera and Chrom)
      return obj instanceof HTMLElement;
    }
    catch(e){
      // Browsers not supporting W3 DOM2 don't have HTMLElement and
      // an exception is thrown and we end up here. Testing some
      // properties that all elements have. (works on IE7)
      return (typeof obj==="object") &&
        (obj.nodeType===1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
  }

  static createElement(string) {
    return document.createElement(string);
  }

  static hasClassName(el, className) {
      return new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)").test(el.className);
  }

  static addClassName(el, className) {
    if (!this.hasClassName(el, className)) {
        el.className = el.className ? [el.className, className].join(' ') : className;
    }
  }

  static after(el, el2) {
    el.parentNode.insertBefore(el2, el.nextSibling);
  }

  static append(el, el2) {
    el.appendChild(el2);
  }

  static addEventListener(el, eventName, eventHandler) {
    if (el.addEventListener){
      el.addEventListener(eventName, eventHandler, false); 
    } else if (el.attachEvent){
      el.attachEvent('on'+eventName, eventHandler);
    } else {
      el["on" + eventName] = eventHandler;
    }
  }

  static removeEventListener(el, eventName, eventHandler) {
    if (el.removeEventListener){
      el.removeEventListener(eventName, eventHandler, false); 
    } else if (el.detachEvent){
      el.detachEvent('on'+eventName, eventHandler);
    } else {
      el["on" + eventName] = null;
    }
  }

  static stopEvent(event) {
    if(event.preventDefault != undefined) event.preventDefault();
    if(event.stopPropagation != undefined) event.stopPropagation();
  }

  static getPageX(e) {
    return this.getPageXY(e).x;
  }

  static getPageY(e) {
    return this.getPageXY(e).y;
  }

  static getPageXY(e) {
    if (e.changedTouches) {
        return {
          x: e.changedTouches[0].pageX,
          y: e.changedTouches[0].pageY,
        }
    } else {
        return {
          x: e.pageX,
          y: e.pageY
        }
    }
  }

  static requestAnimationFrame(callback) {
    if (this._rAF) return this._rAF.call(window, callback);

    if (window.requestAnimationFrame) {
      this._rAF = window.requestAnimationFrame;
      this._cAF = window.cancelAnimationFrame;
      return this._rAF.call(window, callback);
    }

    this.lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        this._rAF = window[vendors[x]+'RequestAnimationFrame'];
        this._cAF = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        this._rAF = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - this.lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            this.lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        this._cAF.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    return this._rAF.call(window, callback);
  }



}