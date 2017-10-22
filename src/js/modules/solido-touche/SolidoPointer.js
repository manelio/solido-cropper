import SDOM from 'solido-dom';

const MOUSE_POINTER_ID = 999;
const MOUSE_DEVICE = 100;
const TOUCH_DEVICE = 200;

let _instanceId = 0;

class SolidoPointer {

  constructor(element, options) {

    //console.log(SDOM.getTransformComponents(element, SDOM.COMPONENT_ROTATION));

    this._instanceId = ++_instanceId;

    this.el = element;

    options = options || {};

    this.options = {
      onPointerStart: function() {},
      onPointerJustBeforeMove: function() {},
      onCombinedPointerMove: function() {},
      onPointerMove: function() {},
      onPointersMove: function() {},
      onPointerEnd: function() {},
      onPointerClick: function() {},

      onBefore: function() {},
      onMouseDown: function() {},
      onMove: function() {},
      onMoveTwoPointers: function() {},
      onWheel: function() {},

      roundPositions: true
    }
    
    Object.assign(this.options, options);

    this.pointers = {};
    this.npointers = 0;
    this.moved = false;

    // Mouse
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    //this.onMouseWheel = this.onMouseWheel.bind(this);

    // Touch devices
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    //this.onTouchCancel = this.onTouchCancel.bind(this);

    this.l0 = 0;
    this.l = 0;

    this.ang0 = 0;
    this.ang = 0;

    this.midPositionInPage0 = {x: 0, y: 0};
    this.midPositionInPage = {x: 0, y: 0};

    this.attachEvents();
  }

  debug(str) {
    console.log(`instance ${this._instanceId} (${this.npointers} pointers): ${str}`);
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
    return this.getRelativePosition(pageX, pageY);
  }

  getRelativePosition(pageX, pageY) {
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

    if (this.npointers === 0) {
      SDOM.addEventListener(document, 'mousemove', this.onMouseMove);
      SDOM.addEventListener(document, 'mouseup', this.onMouseUp);
    }

    this.startPointer(MOUSE_DEVICE, MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    this.startPointers(MOUSE_DEVICE);

    return false;
  }


  onTouchStart(e) {
    SDOM.stopEvent(e);

    if (this.npointers === 0) {
      SDOM.addEventListener(document, 'touchmove', this.onTouchMove);
      SDOM.addEventListener(document, 'touchend', this.onTouchEnd);
      SDOM.addEventListener(document, 'touchcancel', this.onTouchCancel);
    }

    let changed = false;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined') {
        changed = true;
        this.startPointer(TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (changed) {
      this.startPointers(TOUCH_DEVICE);
    }

    return false;
  }

  startPointer(deviceType, pointerId, positionInPage) {

    if (this.options.roundPositions) {
      positionInPage.x = Math.round(positionInPage.x);
      positionInPage.y = Math.round(positionInPage.y);
    }

    let pointer = {};
    pointer.t0 = Date.now();
    pointer.positionInPage0 = {x: positionInPage.x, y: positionInPage.y};
    pointer.positionInPage = {x: positionInPage.x, y: positionInPage.y};
    pointer.delta = {x: 0, y: 0};
    this.pointers[pointerId] = pointer;

    pointer.onPointerMove = function() {};

    this.npointers++;

    (this.options.onPointerStart.bind(this))({
      device: deviceType,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      pageX: positionInPage.x,
      pageY: positionInPage.y,
      incrementX: 0,
      incrementY: 0,
      pointer: pointer
    });

    this.debug(`startPointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y})`);
  }

  startPointers(deviceType) {
    let combined = this.getCombinedPointersMetrics();
    this.midPositionInPage.x = combined.positionInPage.x;
    this.midPositionInPage.y = combined.positionInPage.y;
    
    this.ang0 = combined.ang;
    this.l0 = combined.l;
  }

  onMouseMove(e) {
    SDOM.stopEvent(e);
    this.moveSinglePointer(MOUSE_DEVICE, MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    this.movePointers(MOUSE_DEVICE);
  }

  onTouchMove(e) {
    SDOM.stopEvent(e);

    let changed = false;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined') {
        changed = true;
        this.moveSinglePointer(TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (changed) {
      this.movePointers(TOUCH_DEVICE);
    }
  }

  moveSinglePointer(deviceType, pointerId, positionInPage) {

    if (!(pointerId in this.pointers)) {
      //this.debug(`pointerId ${pointerId} not in pointers`);
      return;
    }

    if (this.options.roundPositions) {
      positionInPage.x = Math.round(positionInPage.x);
      positionInPage.y = Math.round(positionInPage.y);
    }

    let pointer = this.pointers[pointerId];
    
    pointer.delta = {
      x: positionInPage.x - pointer.positionInPage0.x,
      y: positionInPage.y - pointer.positionInPage0.y
    }

    let increment = {
      x: positionInPage.x - pointer.positionInPage.x,
      y: positionInPage.y - pointer.positionInPage.y
    }

    pointer.positionInPage.x = positionInPage.x;
    pointer.positionInPage.y = positionInPage.y;

    (pointer.onPointerMove.bind(this))({
      device: deviceType,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      pageX: positionInPage.x,
      pageY: positionInPage.y,
      incrementX: increment.x,
      incrementY: increment.y
    });
    
    (this.options.onPointerMove.bind(this))({
      device: deviceType,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      pageX: positionInPage.x,
      pageY: positionInPage.y,
      incrementX: increment.x,
      incrementY: increment.y
    });
    
    //this.debug(`movePointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y})`);
    //this.debug(`increment (${increment.x.toFixed(2)}, ${increment.y.toFixed(2)})`);
    //this.debug(`delta (${pointer.delta.x.toFixed(2)}, ${pointer.delta.y.toFixed(2)})`);
  }

  movePointers(deviceType) {
    let combined = this.getCombinedPointersMetrics();
    
    let delta = {
      x: combined.positionInPage.x - this.midPositionInPage0.x,
      y: combined.positionInPage.y - this.midPositionInPage0.y
    }

    let increment = {
      x: combined.positionInPage.x - this.midPositionInPage.x,
      y: combined.positionInPage.y - this.midPositionInPage.y
    }

    this.midPositionInPage.x = combined.positionInPage.x;
    this.midPositionInPage.y = combined.positionInPage.y;

    let deltaAng = combined.ang - this.ang0;
    let deltaL = combined.l - this.l0;

    let deltaScale;
    if (this.l0 < 0.0001) {
      deltaScale = 1;
    } else {
      deltaScale = 1 + deltaL / this.l0;
    }

    let deg = deltaAng * 180 / Math.PI;
    //this.debug(`${combined.positionInPage.x.toFixed(0)}, ${combined.positionInPage.y.toFixed(0)}, l: ${combined.l.toFixed(0)}, ang: ${deg.toFixed(2)}, increment: (${increment.x.toFixed(0)}, ${increment.y.toFixed(0)})`);
    //this.debug(`cl: ${combined.l.toFixed(0)}, l0: ${this.l0.toFixed(2)}`);
    //this.debug(`${combined.positionInPage.x.toFixed(0)}, ${combined.positionInPage.y.toFixed(0)}, l: ${deltaL.toFixed(0)}, ang: ${deg.toFixed(2)}, deltaScale: ${deltaScale.toFixed(2)}`);

    (this.options.onCombinedPointerMove.bind(this))({
      device: deviceType,
      isMultiple: this.npointers > 1,
      npointers: this.npointers,
      midPositionInPageX: this.midPositionInPage.x,
      midPositionInPageY: this.midPositionInPage.y,
      deltaX: delta.x,
      deltaY: delta.y,
      incrementX: increment.x,
      incrementY: increment.y,
      deltaAng: deltaAng,
      deltaAngDeg: deg,
      deltaL: deltaL,
      deltaScale: deltaScale
    });

  }

  getCombinedPointersMetrics() {
    let
      midPositionInPageX = 0,
      midPositionInPageY = 0
    ;

    let p1, p2;
    let n = 0;
    for (let i in this.pointers) {
      let pointer = this.pointers[i];
      midPositionInPageX += pointer.positionInPage.x;
      midPositionInPageY += pointer.positionInPage.y;
      n++;

      if (n === 1) {
        p1 = pointer;
      } else if (n === 2) {
        p2 = pointer;
      }
    }

    midPositionInPageX = midPositionInPageX / n;
    midPositionInPageY = midPositionInPageY / n;

    if (this.options.roundPositions) {
      midPositionInPageX = Math.round(midPositionInPageX);
      midPositionInPageY = Math.round(midPositionInPageY);
    }


    let l = this.l0, ang = this.ang0, deg = 0;
    if (p2) {
      let dx = p2.positionInPage.x - p1.positionInPage.x;
      let dy = p2.positionInPage.y - p1.positionInPage.y;

      l = Math.sqrt(dx * dx + dy * dy);
      ang = Math.atan2(dy, dx);
      deg = ang * 180 / Math.PI;
    }

    return {
      positionInPage: {
        x: midPositionInPageX,
        y: midPositionInPageY
      },
      l: l,
      ang: ang
    }

  }

  onMouseUp(e) {
    SDOM.stopEvent(e);
    this.endPointer(MOUSE_DEVICE, MOUSE_POINTER_ID, {x: e.pageX, y: e.pageY});
    this.endPointers(MOUSE_DEVICE);

    if (this.npointers <= 0) {
      SDOM.removeEventListener(document, 'mousemove', this.onMouseMove);
      SDOM.removeEventListener(document, 'mouseup', this.onMouseUp);
    }
  }

  onTouchEnd(e) {
    SDOM.stopEvent(e);

    let dirty = false;
    for(let i in e.changedTouches) {
      let touch = e.changedTouches[i];
      let id = touch.identifier;
      if (typeof id !== 'undefined') {
        dirty = true;
        this.endPointer(TOUCH_DEVICE, id, {x: touch.pageX, y: touch.pageY});
      }
    }

    if (dirty) {
      this.endPointers(TOUCH_DEVICE);
    }

    if (this.npointers <= 0) {
      SDOM.removeEventListener(document, 'touchmove', this.onTouchMove);
      SDOM.removeEventListener(document, 'touchend', this.onTouchEnd);
      SDOM.removeEventListener(document, 'touchcancel', this.onTouchEnd);
    }
  }


  endPointer(deviceType, pointerId, positionInPage) {

    if (!(pointerId in this.pointers)) {
      return;
    }

    delete this.pointers[pointerId];
    this.npointers--;

    //this.debug(`endPointer(${deviceType}, ${pointerId}, (${positionInPage.x}, ${positionInPage.y})`);
  }


  endPointers(deviceType) {
    let combined = this.getCombinedPointersMetrics();
    this.midPositionInPage.x = combined.positionInPage.x;
    this.midPositionInPage.y = combined.positionInPage.y;
    
    this.ang0 = combined.ang;
    this.l0 = combined.l;

    if (this.npointers === 0) {
      this.startInertia();
    }
  }


  startInertia() {
    console.log('start inertia');
  }

  /*


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

      if (!this.pointers[id]) return;

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

    let id = pointer.identifier;
    this.pointers[id] = true;

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
  */

}

export default SolidoPointer;

var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
if (isBrowser) {
  window.SolidoPointer = SolidoPointer;
}
