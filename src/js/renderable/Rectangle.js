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

}