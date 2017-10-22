import Renderable from './Renderable';

export default class Circle extends Renderable {

  constructor(def) {
    super();

    this.code = 'circle';
    
    this.x = def.x;
    this.y = def.y;
    this.radius = def.radius;
    this.w = 2 * this.radius;
    this.h = 2 * this.radius;
  }

  testPoint(x, y) {
    let dx = x - this.x;
    let dy = y - this.y;
    if (dx*dx + dy*dy < this.radius * this.radius) {
      return true;
    }
  }

}