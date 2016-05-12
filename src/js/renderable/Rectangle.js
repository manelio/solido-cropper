import Renderable from './Renderable';

export default class Rectangle extends Renderable {

  code = 'rectangle';

  constructor(def) {
    super();
    
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
  }

}