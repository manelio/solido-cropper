import Renderable from './Renderable';

export default class Hole extends Renderable {

  constructor(def) {
    super();

    this.code = 'hole';
    
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
  }

}