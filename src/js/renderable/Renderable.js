import uniqueId from 'uniqueid';
import TransformationMatrix2D from '../TransformationMatrix2D';
import EventEmitter from '../events/EventEmitter';

export default class Renderable {

  constructor() {

    this.id = uniqueId();

    this.transformationMatrix = new TransformationMatrix2D();
    this.eventEmitter = new EventEmitter();

    this.ready = true;
    this.code = 'none';
    this.layer = {}

    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
  }

  testPoint(x, y) {
    return false;
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;

    if (this.w < 0) {
      this.x += this.w;
      this.w = -this.w;
    }

    if (this.h < 0) {
      this.y += this.h;
      this.h = -this.h;
    }

    this.layer.dirty = true;
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;

    if (this.onChangePosition) {
      this.onChangePosition(this);
    }

    this.layer.diry = true;
  }

}