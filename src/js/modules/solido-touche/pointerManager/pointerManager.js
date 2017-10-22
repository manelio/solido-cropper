import SDOM from 'solido-dom';

import pointer from '../pointer';
import eventEmitter from 'solido-eventemitter';

import attachEvents from './attachEvents';
import detachEvents from './attachEvents';

import onMouseDown from './onMouseDown';
import onMouseMove from './onMouseMove';
import onMouseUp from './onMouseUp';
import onMouseWheel from './onMouseWheel';

import onTouchStart from './onTouchStart';
import onTouchMove from './onTouchMove';
import onTouchEnd from './onTouchEnd';

import startPointer from './startPointer';
import movePointer from './movePointer';
import endPointer from './endPointer';

import startPointers from './startPointers';
import movePointers from './movePointers';
import endPointers from './endPointers';

import getCombinedPointersMetrics from './getCombinedPointersMetrics';

import startInertia from './startInertia';

import timeSeries from '../timeSeries';

import solido_map from '../map';
import solido_pointer from '../pointer';
import solido_animator from 'animator';

import touchInput from '../input/touch';
import mouseInput from '../input/mouse';

let _instanceId = 0;

let animator = solido_animator();

const pointerManagerFactory = (element, options) => {


  /*
  let handlers = {
    start: function(d, t) {
      console.log(t + ' start');
    },
    move: function(d, t) {
      console.log(t + ' move');
    },
    end: function(d, t) {
      console.log(t + ' end');
    }
  }

  touchInput(element, handlers);
  mouseInput(element, handlers);
  */

  let self = {};

  options = options || {};

  options = Object.assign({
    roundPositions: true,
    touchDistanceThreshold: 10
  }, options);

  Object.assign(self, {
    instanceId: ++_instanceId,
    el: element,
    options: options,

    nrealpointers: 0,

    pointers: solido_map(),

    trackingPosition: timeSeries(),
    trackingAngle: timeSeries(),
    trackingDistance: timeSeries(),

    requested: false,
    animating: false,

    status: {
      dirty: false,

      npointers: 0,

      distance0: 0,
      angle0: 0,
      pageX0: 0,
      pageY0: 0,

      distance: 0,
      angle: 0,
      pageX: 0,
      pageY: 0,

      deltaAngle: 0,
      deltaScale: 1
    }
  });

  //let animator = solido_animator();

  let pointer = solido_pointer();
  
  let pointerId = 'virt1';

  pointer.tracking.addValue([0, 0]);
  pointer.t0 = Date.now();
  pointer.id = pointerId;

  //pointer.status.pageX0 = 0;
  //pointer.status.pageY0 = 0;
  pointer.status.pageX = 0;
  pointer.status.pageY = 0;

  pointer.delta = {x: 0, y: 0};
  
  //self.pointers.add(pointerId, pointer);

  function animate() {
    console.log('animate');

    //console.log(`${this.angleSpeed}, ${this.distanceSpeed}`);

    //console.log(this.angleSpeed);
    //console.log(this.distanceSpeed);
    let changed = false;

    this.angleSpeed *= .999;
    this.distanceSpeed *= .999;

    if (Math.abs(this.angleSpeed) > .001) {
      changed = true;
    } else {
    }

    if (Math.abs(this.distanceSpeed) > .001) {
      changed = true;
    } else {
    }

    let pointerData = {
      //device: deviceType,
      combined: true,
      npointers: this.pointers.n,

      pageX: this.status.pageX,
      pageY: this.status.pageY,

      deltaX: 0,
      deltaY: 0,
      incrementX: this.distanceSpeed,
      incrementY: 0,

      deltaAngle: 0,
      incrementAngle: this.angleSpeed / 60,

      deltaDistance: 0,

      deltaScale: 1,
      incrementScale: 1
    }

    this.emit('pointersmove', pointerData);

    // 1. CALCULATE
    // 2. RENDER

    //console.log(this.requested);

    if (changed) {
      this.animating = true;
    }

    if (this.animating) {
      this.animating = false;
      SDOM.requestAnimationFrame(this.animate.bind(this));
    }
  }

  Object.assign(self, eventEmitter());

  Object.assign(self, {
    attachEvents: attachEvents,
    detachEvents: detachEvents,

    onMouseDown: onMouseDown.bind(self),
    onMouseMove: onMouseMove.bind(self),
    onMouseUp: onMouseUp.bind(self),
    onMouseWheel: onMouseWheel.bind(self),

    onTouchStart: onTouchStart.bind(self),
    onTouchMove: onTouchMove.bind(self),
    onTouchEnd: onTouchEnd.bind(self),
    onTouchCancel: onTouchEnd.bind(self),

    //startPointer: startPointer,
    startPointer: require('./startPointer'),
    movePointer: movePointer,
    endPointer: endPointer,

    startPointers: startPointers,
    movePointers: movePointers,
    endPointers: endPointers,
    getCombinedPointersMetrics: getCombinedPointersMetrics,
    startInertia: startInertia,

    animate: animate,

    requestAnimation() {

      //animator.touch();
      if (!this.animating) {
        this.animating = true;
        console.log('not animating. animation requested');

        SDOM.requestAnimationFrame(this.animate.bind(this));
      }
    }
  })

  self.debug = function(str) {
    if (this.options.debug) {
      console.log(`instance ${this.instanceId} (${this.status.npointers} pointers): ${str}`);
    }
  }

  self.debugx = function(str) {
    console.log(`instance ${this.instanceId} (${this.status.npointers} pointers): ${str}`);
  }

  self.attachEvents();

  return self;
}

export default pointerManagerFactory;

var isBrowser = new Function("try {return this === window;}catch(e){ return false;}");
if (isBrowser) {
  if (!window.solido) {
    window.solido = {};
  }

  window.solido.pointerManager = pointerManagerFactory;
}
