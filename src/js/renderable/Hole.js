import Renderable from './Renderable';

export default class Hole extends Renderable {

  code = 'hole';

  constructor(def) {
    super();
    
    this.x = def.x;
    this.y = def.y;
    this.w = def.w;
    this.h = def.h;
  }

}