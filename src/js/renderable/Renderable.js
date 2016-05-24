import EventEmitter from '../events/EventEmitter';

export default class Renderable {

  constructor() {
    this.eventEmitter = new EventEmitter();

    this.ready = true;
    this.code = 'none';
    this.layer = {}

    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;

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