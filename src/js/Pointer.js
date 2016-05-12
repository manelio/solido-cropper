import uDOM from './uDOM';

export default class Pointer {

  constructor(element, options) {
    this.el = element;

    options = options || {};

    this.options = {
      onPointerStart: function() {},
      onPointerMove: function() {},
      onPointerEnd: function() {},

      onBefore: function() {},
      onMouseDown: function() {},
      onMove: function() {},
      onMoveTwoPointers: function() {},
      onWheel: function() {}
    }
    
    Object.assign(this.options, options);

    this.relativePoint = {}
    this.valuesBefore = {}

    this.pointers = {};
    this.npointers = 0;

    this.attachEvents();
  }

  attachEvents() {

    // Mouse
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);    
    this.onMouseWheel = this.onMouseWheel.bind(this);

    uDOM.addEventListener(this.el, 'mousedown', this.onMouseDown);
    uDOM.addEventListener(this.el, 'mousewheel', this.onMouseWheel);
    uDOM.addEventListener(this.el, 'DOMMouseScroll', this.onMouseWheel);

    // Touch devices
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    uDOM.addEventListener(this.el, 'touchstart', this.onTouchStart);

  }

  getRelativePoint(pageX, pageY) {
    var doc = document.documentElement;
    var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
    var elementOffset = this.el.getBoundingClientRect();

    return {
      x: pageX - elementOffset.left - left,
      y: pageY - elementOffset.top - top
    }
  }

  saveValuesBefore() {
    (this.options.onBefore.bind(this))();
  }

  onMouseDown(e) {
    uDOM.stopEvent(e);
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    let point = this.getRelativePoint(e.pageX, e.pageY);
    
    this.valuesBefore.pagePoint = {x: e.pageX, y: e.pageY};
    this.saveValuesBefore();

    this.relativePoint = point;

    (this.options.onMouseDown.bind(this))(e);
    
    (this.options.onPointerStart.bind(this))({
      device: 'mouse',
      event: e,
      isMultiple: false,
      npointers: 1,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      x: point.x,
      y: point.y,
      pageX: e.pageX,
      pageY: e.pageY
    });

    uDOM.addEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.addEventListener(document, 'mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    if (!this.valuesBefore.pagePoint) return;

    var delta = {
        x: uDOM.getPageX(e) - this.valuesBefore.pagePoint.x,
        y: uDOM.getPageY(e) - this.valuesBefore.pagePoint.y
    };

    (this.options.onPointerMove.bind(this))({
      device: 'mouse',
      event: e,
      isMultiple: false,
      npointers: 1,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      deltaX: delta.x,
      deltaY: delta.y,
      pageX: e.pageX,
      pageY: e.pageY
    });

    (this.options.onMove.bind(this))(e, delta, this.relativePoint);

  }

  onMouseUp(e) {
    this.item = false;

    uDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
    uDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
  }


  onMouseWheel(e) {
    var delta = e.wheelDelta ? e.wheelDelta/40 : e.detail ? -e.detail : 0;
    this.relativePoint = this.getRelativePoint(e.pageX, e.pageY);
    this.saveValuesBefore();

    (this.options.onWheel.bind(this))({
      event: e,
      device: 'mouse',
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      x: this.relativePoint.x,
      y: this.relativePoint.y,
      deltaX: 0,
      deltaY: -delta * 10
    });
  }

  onTouchStart(e) {
    uDOM.stopEvent(e);

    this.saveValuesBefore();
    if (this.npointers === 0) {
      uDOM.addEventListener(this.el, 'touchmove', this.onTouchMove);
      uDOM.addEventListener(this.el, 'touchend', this.onTouchEnd);
    }

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerStart(e.changedTouches[i], e);
    }
  }

  onTouchMove(e) {
    uDOM.stopEvent(e);
    this.handlePointerMove(e);
  }

  onTouchEnd(e) {
    uDOM.stopEvent(e);
    this.saveValuesBefore();

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerEnd(e.changedTouches[i], e);
    }

    var n = Object.keys(this.pointers).length;
    if (n === 0) {
      uDOM.removeEventListener(this.el, 'touchmove', this.onTouchMove);
      uDOM.removeEventListener(this.el, 'touchend', this.onTouchEnd);
    }
  }

  resetPointers(e) {
    for(let i = 0; i < e.targetTouches.length; i++) {
      let touch = e.targetTouches[i];

      let relativePoint = this.getRelativePoint(touch.pageX, touch.pageY);
      let id = touch.identifier;

      this.pointers[id] = {
        pagePoint: {
          x: touch.pageX,
          y: touch.pageY
        },
        relativePoint: relativePoint
      }
    }
  }

  handlePointerStart(pointer, e) {

    this.resetPointers(e);
    this.npointers++;

    let keys = Object.keys(this.pointers);
    let p1 = this.pointers[keys[0]];

    if (this.npointers > 1) {
      let p2 = this.pointers[keys[1]];

      this.p1id = keys[0];
      this.p2id = keys[1];

      let vector0 = {
        x: p2.pagePoint.x - p1.pagePoint.x,
        y: p2.pagePoint.y - p1.pagePoint.y
      }

      let l0 = Math.sqrt(vector0.x * vector0.x + vector0.y * vector0.y);
      this.vector0 = vector0;
      this.l0 = l0;
    }

    (this.options.onPointerStart.bind(this))({
      device: 'touch',
      event: e,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      x: p1.relativePoint.x,
      y: p1.relativePoint.y,
      pageX: p1.pagePoint.x,
      pageY: p1.pagePoint.y
    });

  }

  handlePointerMoveOnePointer(e) {
    var touch;
    var id;
    
    let touches = e.touches;
    for(let i = 0; i < touches.length; i++) {
      touch = touches[i];
      id = touch.identifier;
    }

    let delta = {
      x: touch.pageX - this.pointers[id].pagePoint.x,
      y: touch.pageY - this.pointers[id].pagePoint.y
    };

    (this.options.onMove.bind(this))(e, delta, this.relativePoint);

    (this.options.onPointerMove.bind(this))({
      device: 'touch',
      event: e,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      deltaX: delta.x,
      deltaY: delta.y,
      pageX: touch.pageX,
      pageY: touch.pageY
    });

  }

  handlePointerMoveTwoPointers(e) {
    var touch, touch1, touch2;
    var id;

    let touches = e.touches;

    for(let i = 0; i < touches.length; i++) {
      touch = touches[i];
      id = touch.identifier;

      if (id == this.p1id) {
        touch1 = touch;
      } else if (id == this.p2id) {
        touch2 = touch;
      }
    }

    let p1 = this.pointers[this.p1id];
    let p2 = this.pointers[this.p2id];

    let relativeMidpoint =  {
      x: ( p1.relativePoint.x + p2.relativePoint.x ) / 2,
      y: ( p1.relativePoint.y + p2.relativePoint.y ) / 2
    }

    let delta = {
      x: ( touch1.pageX + touch2.pageX ) / 2 - (p1.pagePoint.x + p2.pagePoint.x) / 2,
      y: ( touch1.pageY + touch2.pageY ) / 2 - (p1.pagePoint.y + p2.pagePoint.y) / 2
    }

    let vector = {
      x: touch2.pageX - touch1.pageX,
      y: touch2.pageY - touch1.pageY
    };

    (this.options.onMoveTwoPointers.bind(this))(e, delta, relativeMidpoint, this.vector0, vector, this.l0);

    (this.options.onPointerMove.bind(this))({
      device: 'touch',
      event: e,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      x: relativeMidpoint.x,
      y: relativeMidpoint.y,
      deltaX: delta.x,
      deltaY: delta.y,
      pageX: touch.pageX,
      pageY: touch.pageY,
      l0: this.l0,
      vector0: this.vector0,
      vector: vector
    });

  }

  handlePointerMove(e) {
    if (this.npointers > 1) {
      this.handlePointerMoveTwoPointers(e);
    } else {
      this.handlePointerMoveOnePointer(e);
    }
  }

  handlePointerEnd(pointer, e) {
    this.resetPointers(e);

    let id = pointer.identifier;
    delete this.pointers[id];
    this.npointers--;
  }



}