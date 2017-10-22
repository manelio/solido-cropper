let _rAF = null;
let _cAF = null;

export default class SDOM {

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

  static removeClassName(el, className) {
    if (this.hasClassName(className)) {
        let c = el.className;
        el.className = c.replace(new RegExp("(?:^|\\s+)" + className + "(?:\\s+|$)", "g"), " ");
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

  static getTransform(el) {
    let style = window.getComputedStyle(el, null);
    let transform = 
      style.getPropertyValue('transform') ||
      style.getPropertyValue('-webkit-transform') ||
      style.getPropertyValue('-moz-transform') ||
      style.getPropertyValue('-ms-transform') ||
      style.getPropertyValue('-o-transform')
    ;
    return transform;
  }


  static getTransformComponents(el, components) {
    components = components || this.COMPONENT_ALL;

    let transform = this.getTransform(el);

    if (!transform || transform === 'none') {
      transform = 'matrix(1, 0, 0, 1, 0, 0)';
    }

    let values = transform.split('(')[1];

    values = values.split(')')[0];
    values = values.split(/, */);

    let 
      a = values[0],
      b = values[1],
      c = values[2],
      d = values[3],
      e = values[4],
      f = values[5]
    ;

    let result = {};

    if (components & this.COMPONENT_TRANSLATION) {
      //console.log('x');
      result.tx = e;
      result.ty = f;
    }

    if (components & this.COMPONENT_ROTATION) {
      //console.log('y');
      result.r = Math.atan2(b, a);
      result.rdeg = result.r * (180/Math.PI);
    }

    if (components & this.COMPONENT_SCALE) {
      result.s = Math.sqrt(a*a + b*b);
    }

    return result;
  }

  static getTransformString(tx, ty, r, s) {
    return `translate(${tx}px, ${ty}px) rotate(${r}deg) scale(${s})`;
  }


  static requestAnimationFrame(callback) {
    if (_rAF) return _rAF.call(window, callback);

    if (window.requestAnimationFrame) {
      _rAF = window.requestAnimationFrame;
      return _rAF.call(window, callback);
    }

    this.lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      _rAF = window[vendors[x]+'RequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      _rAF = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - this.lastTime));
        var id = window.setTimeout(function() { callback(currTime + timeToCall); },
          timeToCall);
        this.lastTime = currTime + timeToCall;
        return id;
      };
    }

    return _rAF.call(window, callback);
  }

  static cancelAnimationFrame(callback) {
    if (_cAF) return _cAF.call(window, callback);

    if (window.cancelAnimationFrame) {
      _cAF = window.cancelAnimationFrame;
      return _rAF.call(window, callback);
    }

    this.lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        _cAF = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.cancelAnimationFrame) {
      _cAF = function(id) {
        clearTimeout(id);
      };
    }

    return _cAF.call(window, callback);
  }

}

SDOM.COMPONENT_ROTATION = 1;
SDOM.COMPONENT_TRANSLATION = 2;
SDOM.COMPONENT_SCALE = 4;
SDOM.COMPONENT_ALL = 7;

var isBrowser = new Function("try {return this === window;}catch(e){ return false;}");
if (isBrowser) {
  if (!window.solido) {
    window.solido = {};
  }
  
  window.solido.dom = SDOM;
}
