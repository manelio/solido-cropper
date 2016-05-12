export default class Renderable {

  code = 'none';

  constructor() {
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