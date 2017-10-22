import SDOM from 'solido-dom';

export default class Pointer {

  constructor(element, options) {
    this.el = element;

    options = options || {};

    this.options = {
      onPointerStart: function() {},
      onPointerJustBeforeMove: function() {},
      onPointerMove: function() {},
      onPointerEnd: function() {},
      onPointerClick: function() {},

      onBefore: function() {},
      onMouseDown: function() {},
      onMove: function() {},
      onMoveTwoPointers: function() {},
      onWheel: function() {}
    }
    
    Object.assign(this.options, options);

    this.relativePoint = {}
    this.valuesBefore = {}
    
    this.previousValues = {}

    this.pointers = {};
    this.npointers = 0;
    this.moved = false;

    // Mouse
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseWheel = this.onMouseWheel.bind(this);

    // Touch devices
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onTouchCancel = this.onTouchCancel.bind(this);

    this.attachEvents();
  }

  attachEvents() {
    SDOM.addEventListener(this.el, 'mousedown', this.onMouseDown);
    SDOM.addEventListener(this.el, 'mousewheel', this.onMouseWheel);
    SDOM.addEventListener(this.el, 'DOMMouseScroll', this.onMouseWheel);

    SDOM.addEventListener(this.el, 'touchstart', this.onTouchStart);
  }

  detachEvents() {
    SDOM.removeEventListener(this.el, 'mousedown', this.onMouseDown);
    SDOM.removeEventListener(this.el, 'mousewheel', this.onMouseWheel);
    SDOM.removeEventListener(this.el, 'DOMMouseScroll', this.onMouseWheel);

    SDOM.removeEventListener(this.el, 'touchstart', this.onTouchStart);
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
    SDOM.stopEvent(e);
    document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

    this.moved = false;

    let point = this.getRelativePoint(e.pageX, e.pageY);
    
    this.valuesBefore.pagePoint = {x: e.pageX, y: e.pageY};
    this.previousValues.pagePoint = {x: e.pageX, y: e.pageY};

    this.saveValuesBefore();

    this.relativePoint = point;

    (this.options.onMouseDown.bind(this))(e);
    
    this.onPointerStartEventData = {
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
    };

    (this.options.onPointerStart.bind(this))(this.onPointerStartEventData);

    SDOM.addEventListener(document, 'mousemove', this.onMouseMove);
    SDOM.addEventListener(document, 'mouseup', this.onMouseUp);
  }

  onMouseMove(e) {
    if (!this.moved) {
      //console.log('just before move (touch)');
      (this.options.onPointerJustBeforeMove.bind(this))(this.onPointerStartEventData);
      this.moved = true;
    }

    if (!this.valuesBefore.pagePoint) return;

    let pageX = SDOM.getPageX(e);
    let pageY = SDOM.getPageY(e);

    var delta = {
        x: pageX - this.valuesBefore.pagePoint.x,
        y: pageY - this.valuesBefore.pagePoint.y
    };

    let increment = {
      x: pageX - this.previousValues.pagePoint.x,
      y: pageY - this.previousValues.pagePoint.y,
    }

    this.previousValues.pagePoint.x = pageX;
    this.previousValues.pagePoint.y = pageY;

    (this.options.onPointerMove.bind(this))({
      device: 'mouse',
      event: e,
      isMultiple: false,
      npointers: 1,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y,
      deltaX: delta.x,
      deltaY: delta.y,
      incrementX: increment.x,
      incrementY: increment.y,
      pageX: e.pageX,
      pageY: e.pageY
    });

    (this.options.onMove.bind(this))(e, delta, this.relativePoint);

  }

  onMouseUp(e) {
    this.item = false;

    if (this.moved === false ) {
      (this.options.onPointerClick.bind(this))({
        device: 'mouse',
        event: e,
        isMultiple: false,
        npointers: 1,
        x0: this.relativePoint.x,
        y0: this.relativePoint.y,
        x: this.relativePoint.x,
        y: this.relativePoint.y,
        pageX: e.pageX,
        pageY: e.pageY
      });
    }

    (this.options.onPointerEnd.bind(this))({
      device: 'mouse',
      event: e,
      isMultiple: false,
      npointers: this.npointers,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y
    });

    SDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
    SDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
  }

  onMouseWheel(e) {
    SDOM.stopEvent(e);
    
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
    SDOM.stopEvent(e);

    this.saveValuesBefore();

    if (this.npointers === 0) {
      SDOM.addEventListener(document, 'touchmove', this.onTouchMove);
      SDOM.addEventListener(document, 'touchend', this.onTouchEnd);
      SDOM.addEventListener(document, 'touchcancel', this.onTouchCancel);
    }

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerStart(e.changedTouches[i], e);
    }

    return false;
  }

  onTouchMove(e) {
    SDOM.stopEvent(e);
    if (!this.moved) {
      (this.options.onPointerJustBeforeMove.bind(this))(this.onPointerStartEventData);
      this.moved = true;
    }

    this.handlePointerMove(e);

    return false;
  }

  onTouchCancel(e) {

    SDOM.stopEvent(e);
    //this.saveValuesBefore();

    (this.options.onPointerMove.bind(this))({
      device: 'touch',
      event: e,
      isMultiple: true,
      npointers: 2,
      x0: 0,
      y0: 0,
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      pageX: this.onPointerStartEventData.pageX,
      pageY: this.onPointerStartEventData.pageY,
      l0: this.l0,
      vector0: this.vector0,
      vector: this.vector0
    });

    this.npointers = 0;
    this.pointers = {};

    SDOM.removeEventListener(document, 'touchmove', this.onTouchMove);
    SDOM.removeEventListener(document, 'touchend', this.onTouchEnd);
    SDOM.removeEventListener(document, 'touchcancel', this.onTouchEnd);
  }

  onTouchEnd(e) {

    SDOM.stopEvent(e);
    this.saveValuesBefore();

    for(let i = 0; i < e.changedTouches.length; i++) {
      this.handlePointerEnd(e.changedTouches[i], e);
    }

    var n = Object.keys(this.pointers).length;
    if (n === 0) {

      if (this.moved === false) {
        (this.options.onPointerClick.bind(this))({
          device: 'touch',
          event: e,
          isMultiple: this.npointers > 1,
          npointers: this.npointers,
          x0: this.onPointerStartEventData.x0,
          y0: this.onPointerStartEventData.y0,
          x: this.onPointerStartEventData.x,
          y: this.onPointerStartEventData.y,
          pageX: this.onPointerStartEventData.pageX,
          pageY: this.onPointerStartEventData.pageY
        });
      }

      SDOM.removeEventListener(document, 'touchmove', this.onTouchMove);
      SDOM.removeEventListener(document, 'touchend', this.onTouchEnd);
      SDOM.removeEventListener(document, 'touchcancel', this.onTouchEnd);
    }

    if (this.npointers === 0) {
      this.moved = false;
    }

    (this.options.onPointerEnd.bind(this))({
      device: 'touch',
      event: e,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      x0: this.relativePoint.x,
      y0: this.relativePoint.y
    });

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
        previousPagePoint: {
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

      if (!p2) {
        this.npointers = 1;
      } else {
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
    }

    this.onPointerStartEventData = {
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
    };

    (this.options.onPointerStart.bind(this))(this.onPointerStartEventData);

  }

  handlePointerMoveOnePointer(e) {
    var touch;
    var id;
    
    let touches = e.touches;
    for(let i = 0; i < touches.length; i++) {
      touch = touches[i];
      id = touch.identifier;
    }

    if (!this.pointers[id]) {
      return;
    }

    let delta = {
      x: touch.pageX - this.pointers[id].pagePoint.x,
      y: touch.pageY - this.pointers[id].pagePoint.y
    };

    let increment = {
      x: touch.pageX - this.pointers[id].previousPagePoint.x,
      y: touch.pageY - this.pointers[id].previousPagePoint.y
    };

    this.pointers[id].previousPagePoint.x = touch.pageX;
    this.pointers[id].previousPagePoint.y = touch.pageY;

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
      incrementX: increment.x,
      incrementY: increment.y,
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

    if (!p1 || !p2) {
      return;
    }

    let relativeMidpoint =  {
      x: ( p1.relativePoint.x + p2.relativePoint.x ) / 2,
      y: ( p1.relativePoint.y + p2.relativePoint.y ) / 2
    }

    if (!touch1) {
      this.pointers = {};
      this.npointers = 0;

      //SDOM.removeEventListener(this.el, 'touchmove', this.onTouchMove);
      //SDOM.removeEventListener(this.el, 'touchend', this.onTouchEnd);

      return;
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

    if (!this.moved) {
      this.moved = true;
    }

    if (this.npointers > 1) {
      this.handlePointerMoveTwoPointers(e);
    } else {
      this.handlePointerMoveOnePointer(e);
    }
  }

  handlePointerEnd(pointer, e) {

    this.resetPointers(e);

    let id = pointer.identifier;
    if (this.pointers[id]) {
      delete this.pointers[id];
      if (this.npointers > 0) {
        this.npointers--;
      }
    }
  }



}