import Renderable from './Renderable';

export default class Rectangle extends Renderable {

  constructor(def) {
    super();

    this.code = 'rectangle';
    
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
  }

  testPoint(x, y) {
    if (
      x > this.x && 
      x < this.x + this.w &&
      y > this.y &&
      y < this.y + this.h
    ) {
      return true;
    }
  }

}